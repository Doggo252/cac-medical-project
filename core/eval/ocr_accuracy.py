"""How well does Reader B (Neil's classifier) do on real phone-quality text?

train_classifier.py tests on clean text straight from the fake PDFs. Real
text comes from a photo through OCR (the text reader), which makes mistakes.
This runs Tesseract on the photos of the same 480 letters train_classifier.py
held back for testing, then scores the classifier on that messy text. It also
reads the real letters in data/real/.

Run from the repository root (needs `brew install tesseract`):
    .venv/bin/python core/eval/ocr_accuracy.py

Writes core/eval/reader_b_ocr.md.
"""

import csv
import random
import subprocess
import sys
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import pymupdf

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
from core.classifier import load, predict  # noqa: E402

SYNTHETIC = ROOT / "data" / "synthetic"
CACHE = SYNTHETIC / "ocr_texts.csv"


def held_back_filenames():
    """The exact test letters train_classifier.py uses. Its shuffle only
    depends on the seed and the number of rows, so shuffling the filenames
    the same way gives the same order."""
    rows = list(csv.DictReader(open(SYNTHETIC / "texts.csv")))
    random.seed(1)
    random.shuffle(rows)
    cut = int(len(rows) * 0.8)
    return rows[cut:]


def ocr(image_path):
    result = subprocess.run(["tesseract", str(image_path), "-", "--psm", "3"],
                            capture_output=True, text=True)
    return result.stdout


def ocr_all(paths):
    with ThreadPoolExecutor(max_workers=8) as pool:
        return list(pool.map(ocr, paths))


def main():
    model = load(ROOT / "app" / "public" / "model.json")
    labels = {r["filename"]: r for r in csv.DictReader(open(SYNTHETIC / "labels.csv"))}
    test = held_back_filenames()

    # Reading 480 photos takes a few minutes, so keep the results.
    if CACHE.exists():
        texts = {r["filename"]: r["text"] for r in csv.DictReader(open(CACHE))}
    else:
        print(f"Reading {len(test)} photos with Tesseract...")
        read = ocr_all([SYNTHETIC / "images" / r["filename"] for r in test])
        texts = {r["filename"]: t for r, t in zip(test, read)}
        with open(CACHE, "w", newline="") as f:
            w = csv.writer(f)
            w.writerow(["filename", "text"])
            w.writerows(texts.items())

    results = []
    for r in test:
        info = labels[r["filename"]]
        guess = predict(model, texts[r["filename"]])
        results.append({"true": r["letter_type"], "guess": guess, "effect": info["photo_effect"],
                        "writing": info["writing"], "layout": info["layout"]})

    def accuracy(rows):
        return sum(x["true"] == x["guess"] for x in rows) / len(rows) if rows else 0

    lines = ["# Reader B on OCR text", "",
             f"Tested on the {len(results)} held-back fake letters, read from their photos by Tesseract.", "",
             f"**Overall accuracy: {accuracy(results):.1%}**", ""]
    for key, title in [("true", "By letter type"), ("effect", "By photo type"),
                       ("writing", "By writing"), ("layout", "By layout")]:
        lines += [f"## {title}", "", "| | letters | accuracy |", "|---|---|---|"]
        for value in sorted({x[key] for x in results}):
            group = [x for x in results if x[key] == value]
            lines.append(f"| {value} | {len(group)} | {accuracy(group):.1%} |")
        lines.append("")

    types = sorted({x["true"] for x in results})
    lines += ["## Confusion matrix", "", "Rows are the true type, columns are what Reader B guessed.", "",
              "| true \\ guessed | " + " | ".join(types) + " |", "|---" * (len(types) + 1) + "|"]
    pairs = Counter((x["true"], x["guess"]) for x in results)
    for t in types:
        lines.append(f"| {t} | " + " | ".join(str(pairs[(t, g)]) for g in types) + " |")
    lines.append("")

    # The real letters: every page, as a phone would see it.
    lines += ["## Real letters (data/real/)", "", "| file | page | Reader B says |", "|---|---|---|"]
    for pdf in sorted((ROOT / "data" / "real").glob("*.pdf")):
        doc = pymupdf.open(pdf)
        for n, page in enumerate(doc, start=1):
            image = SYNTHETIC / f"_real_{pdf.stem}_{n}.png"
            page.get_pixmap(dpi=200).save(image)
            text = ocr(image)
            image.unlink()
            lines.append(f"| {pdf.name} | {n} | {predict(model, text)} |")
    lines.append("")

    out = ROOT / "core" / "eval" / "reader_b_ocr.md"
    out.write_text("\n".join(lines))
    print("\n".join(lines))


if __name__ == "__main__":
    main()
