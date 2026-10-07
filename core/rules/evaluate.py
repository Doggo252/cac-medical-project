"""Turns Neil's deadline rules (deadlines.json) into real dates.

Neil wrote the rules as data. This reads them. The phone runs the TypeScript
copy in app/src/deadlines.ts; this Python copy exists so Neil's tests in
test_deadlines.py can run. The two must always give the same answers.

It is a pure function: the same inputs always give the same output, and
today's date is passed in, never read from the clock.
"""

import json
import re
from datetime import date, timedelta
from pathlib import Path

RULES_FILE = Path(__file__).parent / "deadlines.json"

# The facts a rule may count from: the field names in prompts/extract.md.
ANCHORS = {"notice_date", "effective_date", "due_date"}
LETTER_TYPES = {"MC_239A", "MC355", "MC210_RV"}
ISO_DATE = re.compile(r"\d{4}-\d{2}-\d{2}")


def load_rules(path=RULES_FILE):
    with open(path) as f:
        return json.load(f)


def to_date(value):
    """'2026-10-04' becomes a date. Anything else (missing, null, a typo,
    February 30) becomes None."""
    if isinstance(value, date):
        return value
    if not isinstance(value, str) or not ISO_DATE.fullmatch(value):
        return None
    try:
        return date.fromisoformat(value)
    except ValueError:
        return None


def next_business_day(day, holidays):
    """Moves past Saturdays, Sundays and holidays (Gov Code 6707)."""
    while day.weekday() >= 5 or day in holidays:
        day += timedelta(days=1)
    return day


def evaluate(rules_file, letter_type, facts, today):
    """Every deadline that applies to this letter.

    rules_file: the contents of deadlines.json (see load_rules)
    letter_type: "MC_239A", "MC355", "MC210_RV" or "OTHER"
    facts: the confirmed facts, with dates written YYYY-MM-DD
    today: today's date, as a date or "YYYY-MM-DD"

    Each deadline comes back as a dict:
      id, label, citation   copied from the rule
      date                  "YYYY-MM-DD", or None if the anchor date is missing
      days_left             whole days from today, negative once it has passed
      status                "upcoming", "today", "passed", or "unknown"
      moved_from            the date before moving off a weekend or holiday
    """
    today = to_date(today)
    holidays = {to_date(h["date"]) for h in rules_file.get("holidays", [])}
    deadlines = []
    for rule in rules_file["rules"]:
        if letter_type not in rule["applies_to"]:
            continue
        result = {"id": rule["id"], "label": rule["label"], "citation": rule["citation"],
                  "date": None, "days_left": None, "status": "unknown", "moved_from": None}
        start = to_date(facts.get(rule["anchor"]))
        if start is not None:
            step = timedelta(days=rule["offset_days"])
            day = start + step if rule["direction"] == "after" else start - step
            if rule.get("next_business_day"):
                moved = next_business_day(day, holidays)
                if moved != day:
                    result["moved_from"] = day.isoformat()
                day = moved
            days_left = (day - today).days
            result["date"] = day.isoformat()
            result["days_left"] = days_left
            result["status"] = "passed" if days_left < 0 else "today" if days_left == 0 else "upcoming"
        deadlines.append(result)
    return deadlines


def problems_in(rules_file):
    """Typos in deadlines.json that would silently break a countdown. An empty
    list means the file is fine."""
    problems = []
    needed = {"id", "applies_to", "anchor", "offset_days", "direction", "label", "citation"}
    seen = set()
    for i, rule in enumerate(rules_file.get("rules", [])):
        name = rule.get("id", f"rule #{i + 1}")
        missing = needed - set(rule)
        if missing:
            problems.append(f"{name}: missing {sorted(missing)}")
            continue
        if name in seen:
            problems.append(f"{name}: two rules have this id")
        seen.add(name)
        bad_types = [t for t in rule["applies_to"] if t not in LETTER_TYPES]
        if not isinstance(rule["applies_to"], list) or bad_types:
            problems.append(f"{name}: applies_to must be a list of {sorted(LETTER_TYPES)}, got {rule['applies_to']}")
        if rule["anchor"] not in ANCHORS:
            problems.append(f"{name}: anchor must be one of {sorted(ANCHORS)}, got {rule['anchor']!r}")
        if not isinstance(rule["offset_days"], int) or isinstance(rule["offset_days"], bool):
            problems.append(f"{name}: offset_days must be a whole number")
        if rule["direction"] not in ("before", "after"):
            problems.append(f"{name}: direction must be 'before' or 'after'")
        if "next_business_day" in rule and not isinstance(rule["next_business_day"], bool):
            problems.append(f"{name}: next_business_day must be true or false, without quotes")
    for h in rules_file.get("holidays", []):
        if to_date(h.get("date")) is None:
            problems.append(f"holiday {h}: date must be YYYY-MM-DD")
    return problems
