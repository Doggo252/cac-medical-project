"""Writes the text of each fake letter to data/synthetic/texts.csv.

The classifier learns from text, not pictures. Real letters will come through
the phone's text reader (OCR), which makes mistakes. For a first version the
classifier trains on the clean text of the same fake letters the images were
made from, so a row here matches a row in labels.csv by filename.

Run from the repository root:
    .venv/bin/python data/extract_text.py --per-type 800
"""

import argparse
import csv
import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import generate as g  # noqa: E402


def main(per_type, seed):
    out = g.OUT_DIR / "texts.csv"
    with open(out, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["filename", "letter_type", "text"])
        for letter_type in g.LETTER_TYPES:
            for i in range(per_type):
                # Same seed as generate.py, so this is the same letter as the image.
                rng = random.Random(f"{seed}-{letter_type}-{i}")
                facts = g.make_facts(letter_type, rng, index=i)
                text = g.build_letter(facts)[0].get_text()
                writer.writerow([f"{letter_type.lower()}_{i:04d}.jpg", letter_type, text])
            print(f"{letter_type}: {per_type} texts")
    print(f"Wrote {out}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--per-type", type=int, default=800)
    parser.add_argument("--seed", type=int, default=1)
    args = parser.parse_args()
    main(args.per_type, args.seed)
