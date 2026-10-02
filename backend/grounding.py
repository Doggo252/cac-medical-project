"""The grounding check: an explanation may only mention dates that are in the
confirmed facts.

The AI writes the plain-language explanation, and an AI can make things up. A
wrong date is the most dangerous thing it could invent, because a person might
act on it. So after the AI answers, this code finds every date in its text and
checks each one against the facts the user confirmed. Any date that is not
there means the whole explanation is thrown away.
"""

import re
from datetime import date

MONTHS = {
    # English, with common short forms
    "january": 1, "jan": 1, "february": 2, "feb": 2, "march": 3, "mar": 3, "april": 4, "apr": 4,
    "may": 5, "june": 6, "jun": 6, "july": 7, "jul": 7, "august": 8, "aug": 8,
    "september": 9, "sept": 9, "sep": 9, "october": 10, "oct": 10, "november": 11, "nov": 11,
    "december": 12, "dec": 12,
    # Spanish
    "enero": 1, "febrero": 2, "marzo": 3, "abril": 4, "mayo": 5, "junio": 6, "julio": 7,
    "agosto": 8, "septiembre": 9, "setiembre": 9, "octubre": 10, "noviembre": 11, "diciembre": 12,
}
MONTH_WORD = "(?P<month>" + "|".join(sorted(MONTHS, key=len, reverse=True)) + r")\.?"

# Each pattern finds one way of writing a date. Year is optional in the word
# forms, because people write "October 4" as well as "October 4, 2026".
PATTERNS = [
    # 2026-10-04
    re.compile(r"\b(?P<year>\d{4})-(?P<m>\d{1,2})-(?P<day>\d{1,2})\b"),
    # 10/04/2026 or 10/4/26
    re.compile(r"\b(?P<m>\d{1,2})/(?P<day>\d{1,2})/(?P<year>\d{4}|\d{2})\b"),
    # October 4, 2026 / October 4th / Oct. 4, 2026
    re.compile(rf"\b{MONTH_WORD}\s+(?P<day>\d{{1,2}})(?:st|nd|rd|th)?\b(?:,?\s+(?P<year>\d{{4}}))?", re.I),
    # 4 October 2026 / 4 de octubre de 2026 / 4 de octubre del 2026
    re.compile(rf"\b(?P<day>\d{{1,2}})(?:st|nd|rd|th|º|°)?\s+(?:de\s+)?{MONTH_WORD}(?:\s+(?:de\s+|del\s+)?(?P<year>\d{{4}}))?", re.I),
]


def dates_in_text(text):
    """Every date mentioned in the text, as (year or None, month, day)."""
    found = set()
    for pattern in PATTERNS:
        for match in pattern.finditer(text):
            parts = match.groupdict()
            month = int(parts["m"]) if parts.get("m") else MONTHS[parts["month"].lower()]
            day = int(parts["day"])
            year = parts.get("year")
            if year is not None:
                year = int(year)
                if year < 100:
                    year += 2000
            if 1 <= month <= 12 and 1 <= day <= 31:
                found.add((year, month, day))
    return found


def fact_dates(facts):
    """Every date in the confirmed facts (the values written YYYY-MM-DD)."""
    dates = set()
    for value in facts.values():
        if isinstance(value, str):
            try:
                dates.add(date.fromisoformat(value))
            except ValueError:
                pass
    return dates


def invented_dates(text, facts):
    """Dates in the text that are not in the facts. Empty means the text is
    grounded. A date written without a year counts as grounded if its month
    and day match a fact."""
    allowed = fact_dates(facts)
    allowed_full = {(d.year, d.month, d.day) for d in allowed}
    allowed_no_year = {(d.month, d.day) for d in allowed}
    invented = []
    for year, month, day in sorted(dates_in_text(text), key=lambda d: (d[0] or 0, d[1], d[2])):
        ok = (month, day) in allowed_no_year if year is None else (year, month, day) in allowed_full
        if not ok:
            invented.append(f"{year or '????'}-{month:02d}-{day:02d}")
    return invented
