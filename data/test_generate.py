"""Tests for data/generate.py (Claude's code, not a student-owned file).

These check that the fake letters follow the rules in generator_design.md.
"""

import csv
import random
from datetime import timedelta

from data import generate as g


def many_facts(letter_type, count=300):
    return [g.make_facts(letter_type, random.Random(i)) for i in range(count)]


def test_discontinuance_is_a_month_end_at_least_10_days_after_notice():
    for facts in many_facts("MC_239A"):
        disc = facts["discontinuance_date"]
        assert (disc + timedelta(days=1)).day == 1, "should be the last day of a month"
        assert (disc - facts["notice_date"]).days >= 10


def test_hard_case_exactly_10_days_is_exactly_10_days():
    hits = [f for f in many_facts("MC_239A", 2000) if f["hard_case"] == "effective_exactly_10_days"]
    assert hits, "expected at least one of this hard case in 2000 letters"
    for facts in hits:
        assert (facts["discontinuance_date"] - facts["notice_date"]).days == 10


def test_mc355_gives_30_days():
    for facts in many_facts("MC355"):
        assert (facts["due_date"] - facts["notice_date"]).days == 30


def test_case_numbers_are_7_to_9_characters_with_a_county_code():
    for letter_type in g.LETTER_TYPES:
        for facts in many_facts(letter_type, 100):
            number = facts["case_number"]
            assert 7 <= len(number) <= 9
            assert number[:2] in ("41", "43")


def test_calsaws_share_is_about_30_percent():
    layouts = [f["layout"] for f in many_facts("MC_239A", 2000)]
    share = layouts.count("calsaws") / len(layouts)
    assert 0.25 < share < 0.35


def test_generate_writes_images_and_labels(tmp_path):
    g.generate(per_type=1, seed=5, out_dir=tmp_path)
    images = sorted((tmp_path / "images").glob("*.jpg"))
    assert len(images) == 3
    with open(tmp_path / "labels.csv") as f:
        rows = list(csv.DictReader(f))
    assert len(rows) == 3
    assert list(rows[0].keys()) == g.LABEL_COLUMNS
    assert {r["letter_type"] for r in rows} == set(g.LETTER_TYPES)


def test_same_seed_makes_the_same_letters(tmp_path):
    first = g.generate(per_type=2, seed=9, out_dir=tmp_path / "a")
    second = g.generate(per_type=2, seed=9, out_dir=tmp_path / "b")
    assert first == second


def test_long_handwritten_text_is_shrunk_not_dropped():
    # PyMuPDF silently writes nothing when text overflows a box. fill_box must
    # shrink the text instead, for every pen.
    import pymupdf
    long_reason = g.make_reason(random.Random(1), many=True)
    for pen_seed in range(20):
        pen = g.pick_pen(random.Random(pen_seed), can_handwrite=True)
        page = pymupdf.open().new_page()
        g.fill_box(page, (48, 440, 564, 486), long_reason, 9, pen)
        assert "following information" in page.get_text().replace("\xa0", " ")


def test_about_half_are_handwritten_and_calsaws_never_is():
    facts = many_facts("MC_239A", 2000) + many_facts("MC355", 1000)
    for f in facts:
        if f["layout"] == "calsaws":
            assert f["pen"]["writing"] == "printed"
    fillable = [f for f in facts if f["layout"] != "calsaws"]
    share = sum(f["pen"]["writing"] == "handwritten" for f in fillable) / len(fillable)
    assert 0.45 < share < 0.55


def test_every_value_actually_lands_on_the_page():
    # Catches values that silently fail to draw (this happened once on the
    # 2007 form). Checks each letter type, layout, and pen.
    seen = set()
    for letter_type in g.LETTER_TYPES:
        for i in range(400):
            facts = g.make_facts(letter_type, random.Random(f"land-{i}"))
            kind = (letter_type, facts["layout"], facts["pen"]["writing"])
            if kind in seen:
                continue
            seen.add(kind)
            text = g.build_letter(facts)[0].get_text().replace("\xa0", " ")
            assert facts["case_number"] in text, kind
            assert facts["worker_name"] in text, kind
            assert facts["notice_for"] in text, kind
    # 2007 and CalSAWS for MC 239 A, printed and handwritten where allowed.
    assert len(seen) == 7


def test_perspective_math_maps_corners_exactly():
    src = [(0, 0), (100, 0), (100, 80), (0, 80)]
    out = [(5, 3), (97, 2), (99, 78), (2, 81)]
    a, b, c, d, e, f, g_, h = g.perspective_coeffs(out, src)
    for (x, y), (u, v) in zip(out, src):
        w = g_ * x + h * y + 1
        assert abs((a * x + b * y + c) / w - u) < 1e-6
        assert abs((d * x + e * y + f) / w - v) < 1e-6


def test_every_photo_effect_produces_a_picture():
    from PIL import Image
    for letter_type in g.LETTER_TYPES:
        for i, effect in enumerate(g.PHOTO_EFFECTS):
            rng = random.Random(f"photo-{letter_type}-{i}")
            facts = g.make_facts(letter_type, rng)
            photo = g.make_photo(g.draw_letter(facts), effect, facts, rng)
            assert isinstance(photo, Image.Image) and photo.mode == "RGB"
            assert photo.width > 600 and photo.height > 600, effect


def test_hard_case_photos_work_too():
    for letter_type, hard in [("MC210_RV", "diagonal_lines"), ("MC355", "shifted_page")]:
        for i in range(300):
            rng = random.Random(f"hard-{i}")
            facts = g.make_facts(letter_type, rng)
            if facts["hard_case"] == hard:
                g.make_photo(g.draw_letter(facts), "tilt", facts, rng)
                break
        else:
            raise AssertionError(f"never generated {hard}")


def test_stamp_is_a_valid_png():
    import io
    from PIL import Image
    from datetime import date
    png = g.stamp_png("Santa Clara", date(2026, 9, 4), random.Random(3))
    img = Image.open(io.BytesIO(png))
    assert img.mode == "RGBA" and img.width > 800
