"""Tests for evaluate.py (Claude's code). These use a small made-up rules
file, so they test the counting itself, not Neil's rules. Neil's own tests of
his rules are in test_deadlines.py."""

from datetime import date

from core.rules.evaluate import evaluate, load_rules, problems_in

FAKE = {
    "rules": [
        {"id": "ten_after", "applies_to": ["MC355"], "anchor": "notice_date", "offset_days": 10,
         "direction": "after", "label": "L", "citation": "C"},
        {"id": "day_before", "applies_to": ["MC_239A"], "anchor": "effective_date", "offset_days": 1,
         "direction": "before", "label": "L", "citation": "C"},
        {"id": "moves", "applies_to": ["MC_239A"], "anchor": "notice_date", "offset_days": 0,
         "direction": "after", "label": "L", "citation": "C", "next_business_day": True},
    ],
    "holidays": [{"date": "2026-10-12", "name": "Columbus Day"}],
}
TODAY = date(2026, 10, 7)


def one(rule_id, letter_type, facts, today=TODAY):
    return next(d for d in evaluate(FAKE, letter_type, facts, today) if d["id"] == rule_id)


def test_counts_after_and_before():
    assert one("ten_after", "MC355", {"notice_date": "2026-09-25"})["date"] == "2026-10-05"
    assert one("day_before", "MC_239A", {"effective_date": "2026-10-31"})["date"] == "2026-10-30"


def test_crosses_month_and_year_ends():
    assert one("ten_after", "MC355", {"notice_date": "2026-12-28"})["date"] == "2027-01-07"
    assert one("day_before", "MC_239A", {"effective_date": "2028-03-01"})["date"] == "2028-02-29"


def test_only_rules_for_this_letter_type():
    assert [d["id"] for d in evaluate(FAKE, "MC355", {}, TODAY)] == ["ten_after"]
    assert evaluate(FAKE, "OTHER", {}, TODAY) == []


def test_saturday_then_holiday_moves_to_tuesday():
    # Oct 10 2026 is a Saturday, Oct 11 a Sunday, Oct 12 a holiday.
    d = one("moves", "MC_239A", {"notice_date": "2026-10-10"})
    assert d["date"] == "2026-10-13" and d["moved_from"] == "2026-10-10"


def test_a_weekday_does_not_move():
    d = one("moves", "MC_239A", {"notice_date": "2026-10-08"})
    assert d["date"] == "2026-10-08" and d["moved_from"] is None


def test_days_left_and_status():
    assert one("ten_after", "MC355", {"notice_date": "2026-09-30"})["days_left"] == 3
    assert one("ten_after", "MC355", {"notice_date": "2026-09-27"})["status"] == "today"
    passed = one("ten_after", "MC355", {"notice_date": "2026-09-01"})
    assert passed["status"] == "passed" and passed["days_left"] == -26


def test_missing_or_broken_dates_are_unknown():
    for bad in [None, "", "10/04/2026", "2026-02-30", "soon"]:
        d = one("ten_after", "MC355", {"notice_date": bad})
        assert d["status"] == "unknown" and d["date"] is None


def test_today_can_be_text():
    assert evaluate(FAKE, "MC355", {"notice_date": "2026-09-30"}, "2026-10-07")[0]["days_left"] == 3


def test_problems_are_found():
    broken = {"rules": [{"id": "x", "applies_to": ["MC_210RV"], "anchor": "notice", "offset_days": "9",
                         "direction": "later", "label": "L", "citation": "C", "next_business_day": "true"}]}
    found = " ".join(problems_in(broken))
    for word in ["applies_to", "anchor", "offset_days", "direction", "next_business_day"]:
        assert word in found


def test_neils_rules_file_has_no_typos():
    # Checks the real deadlines.json, so a typo shows up here instead of as a
    # silently wrong countdown on the phone.
    assert problems_in(load_rules()) == []
