from core.rules.evaluate import evaluate, load_rules

RULES = load_rules()

def test_renewal_due_date():
    results = evaluate(RULES, "MC210_RV", {"due_date": "2026-11-15"}, "2026-10-07")
    by_id = {r["id"]: r for r in results}
    assert by_id["renewal_request"]["date"] == "2026-11-15"
    

def test_no_renewal_due_date():
    results = evaluate(RULES, "MC210_RV", {"due_date": None}, "2026-10-07")
    by_id = {r["id"]: r for r in results}
    assert by_id["renewal_request"]["date"] is None
    assert by_id["renewal_request"]["status"] == "unknown"
    
def test_request_info_due_date():
    results = evaluate(RULES, "MC355", {"due_date": "2026-11-15"}, "2026-10-07")
    by_id = {r["id"]: r for r in results}
    assert by_id["document_request"]["date"] == "2026-11-15"
    

def test_request_info_no_due_date():
    results = evaluate(RULES, "MC355", {"due_date": None}, "2026-10-07")
    by_id = {r["id"]: r for r in results}
    assert by_id["document_request"]["date"] is None
    assert by_id["document_request"]["status"] == "unknown"

def test_cure_period():
    results = evaluate(RULES, "MC_239A", {"notice_date": "2026-09-01"}, "2026-10-07")
    by_id = {r["id"]: r for r in results}
    assert by_id["document_request_coverage_stopped"]["date"] == "2026-11-29"
    
def test_cure_period_over_january():
    results = evaluate(RULES, "MC_239A", {"notice_date": "2026-12-15"}, "2026-10-07")
    by_id = {r["id"]: r for r in results}
    assert by_id["document_request_coverage_stopped"]["date"] == "2027-03-14"
    
def test_hearing_deadline():
    results = evaluate(RULES, "MC_239A", {"notice_date": "2026-09-01"}, "2026-10-07")
    by_id = {r["id"]: r for r in results}
    assert by_id["hearing_request"]["date"] == "2026-11-30"
    assert by_id["hearing_request"]["moved_from"] == "2026-11-29"
    
def test_hearing_deadline_weekend_holiday():
    results = evaluate(RULES, "MC_239A", {"notice_date": "2026-10-19"}, "2026-10-07")
    by_id = {r["id"]: r for r in results}
    assert by_id["hearing_request"]["date"] == "2027-01-19"
    assert by_id["hearing_request"]["moved_from"] == "2027-01-16"
    
def test_hearing_deadline_holiday_weekday_weekend():
    results = evaluate(RULES, "MC_239A", {"notice_date": "2026-08-29"}, "2026-10-07")
    by_id = {r["id"]: r for r in results}
    assert by_id["hearing_request"]["date"] == "2026-11-27"
    assert by_id["hearing_request"]["moved_from"] == "2026-11-26"

def test_hearing_coverage():
    results = evaluate(RULES, "MC_239A", {"effective_date": "2026-10-20"}, "2026-10-07")
    by_id = {r["id"]: r for r in results}
    assert by_id["hearing_coverage"]["date"] == "2026-10-19"
    
def test_hearing_coverage_different_month():
    results = evaluate(RULES, "MC_239A", {"effective_date": "2026-11-01"}, "2026-10-07")
    by_id = {r["id"]: r for r in results}
    assert by_id["hearing_coverage"]["date"] == "2026-10-31"

def test_hearing_coverage_leap_year():
    results = evaluate(RULES, "MC_239A", {"effective_date": "2028-03-01"}, "2026-10-07")
    by_id = {r["id"]: r for r in results}
    assert by_id["hearing_coverage"]["date"] == "2028-02-29"
    
def test_hearing_coverage_non_leap_year():
    results = evaluate(RULES, "MC_239A", {"effective_date": "2027-03-01"}, "2026-10-07")
    by_id = {r["id"]: r for r in results}
    assert by_id["hearing_coverage"]["date"] == "2027-02-28"
    
def test_demo():
    results = evaluate(RULES, "MC_239A", {"effective_date": "2026-10-31", "notice_date": "2026-10-01"}, "2026-10-07")
    by_id = {r["id"]: r for r in results}
    assert by_id["hearing_request"]["date"] == "2026-12-29"
    assert by_id["document_request_coverage_stopped"]["date"] == "2026-12-29"
    assert by_id["hearing_coverage"]["date"] == "2026-10-30"
    
def test_demo_no_effective_date():
    results = evaluate(RULES, "MC_239A", {"notice_date": "2026-10-01"}, "2026-10-07")
    by_id = {r["id"]: r for r in results}
    assert by_id["hearing_request"]["date"] == "2026-12-29"
    assert by_id["hearing_coverage"]["status"] == "unknown"
    
def test_deadline_already_passed():
    results = evaluate(RULES, "MC_239A", {"notice_date": "2026-10-01"}, "2027-01-08")
    by_id = {r["id"]: r for r in results}
    assert by_id["hearing_request"]["days_left"] == -10
    assert by_id["hearing_request"]["status"] == "passed"
    
def test_deadline_today():
    results = evaluate(RULES, "MC_239A", {"notice_date": "2026-10-01"}, "2026-12-29")
    by_id = {r["id"]: r for r in results}
    assert by_id["hearing_request"]["days_left"] == 0
    assert by_id["hearing_request"]["status"] == "today"
    
def test_exact_counting():
    results = evaluate(RULES, "MC_239A", {"notice_date": "2026-01-01"}, "2026-10-07")
    by_id = {r["id"]: r for r in results}
    assert by_id["hearing_request"]["date"] == "2026-04-01"
    assert by_id["hearing_request"]["moved_from"] == "2026-03-31"
    assert by_id["document_request_coverage_stopped"]["date"] == "2026-03-31"

def test_deadline_weekend():
    results = evaluate(RULES, "MC210_RV", {"due_date": "2026-10-17"}, "2026-10-07")
    by_id = {r["id"]: r for r in results}
    assert by_id["renewal_request"]["date"] == "2026-10-17"
    assert by_id["renewal_request"]["moved_from"] is None
    
def test_deadline_other():
    results = evaluate(RULES, "OTHER", {"due_date": "2026-10-17"}, "2026-10-07")
    assert results == []