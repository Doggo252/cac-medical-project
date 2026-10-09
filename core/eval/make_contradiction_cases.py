"""Makes random timelines, runs Neil's county-mistake rules on them, and saves
the answers. The phone's copy (app/src/contradictions.ts) is tested against
this file, so the two can never quietly disagree.

Run it again whenever core/contradictions.py changes:
    .venv/bin/python core/eval/make_contradiction_cases.py
"""

import json
import random
import sys
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
from core.contradictions import KINDS, check_rule_1, check_rule_2  # noqa: E402

# The kinds the rules care about come up more often, so every branch gets tested.
KIND_POOL = KINDS + ["papers_sent", "papers_received", "coverage_denied"] * 2

OUT = ROOT / "app" / "src" / "fixtures" / "contradiction_cases.json"


def day(start, offset):
    return (start + timedelta(days=offset)).isoformat()


def main(count=400, seed=7):
    rng = random.Random(seed)
    cases = []
    for _ in range(count):
        notice = date(2026, 1, 1) + timedelta(days=rng.randrange(0, 900))
        effective = notice + timedelta(days=rng.randrange(10, 45))
        events = []
        for _ in range(rng.randrange(0, 6)):
            # Most events land near the deadlines, where the rules are decided.
            events.append({
                "date": day(notice, rng.randrange(-5, 130)),
                "type": rng.choice(KIND_POOL),
                "description": "",
                "subject": "",
                "proof": rng.choice(["", "", "receipt.jpg"]),
            })
        cases.append({
            "events": events,
            "notice_date": notice.isoformat(),
            "effective_date": effective.isoformat(),
            "rule_1": check_rule_1(events, effective.isoformat()),
            "rule_2": check_rule_2(events, notice.isoformat(), effective.isoformat()),
        })
    OUT.write_text(json.dumps(cases))
    fired = sum(1 for c in cases if c["rule_1"]), sum(1 for c in cases if c["rule_2"])
    print(f"Saved {count} cases to {OUT.relative_to(ROOT)}. Rule 1 fired {fired[0]} times, Rule 2 {fired[1]} times.")


if __name__ == "__main__":
    main()
