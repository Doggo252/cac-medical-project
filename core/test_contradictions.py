from core.contradictions import check_rule_1, check_rule_2
def event(date, kind, proof=""):
    return {
        "date": date,
        "type": kind,
        "description": "",
        "subject": "",
        "proof": proof
    }
    
def test_rule_1_clear_case():
    events = [event("2026-10-20", "papers_received", "receipt"), event("2026-11-01", "coverage_denied")]
    finding = check_rule_1(events, "2026-10-31")
    assert finding["rule"] == 1
    assert finding["date"] == "2026-10-20"
    assert finding["needs_proof"] == False
    
def test_rule_1_clean_case():
    events = [event("2026-11-05", "papers_received", "receipt"), event("2026-11-10", "coverage_denied")]
    finding = check_rule_1(events, "2026-10-31")
    assert finding is None

def test_rule_1_edge_case():
    events = [event("2026-10-31", "papers_received", "receipt"), event("2026-11-01", "coverage_denied")]
    finding = check_rule_1(events, "2026-10-31")
    assert finding["date"] == "2026-10-31"
    
def test_rule_1_sent_no_proof_case():
    events = [event("2026-10-20", "papers_sent"), event("2026-11-01", "coverage_denied")]
    finding = check_rule_1(events, "2026-10-31")
    assert finding["date"] == "2026-10-20"
    assert finding["needs_proof"] == True
    
def test_rule_2_clear_case():
    events = [event("2026-11-15", "papers_received", "receipt")]
    finding = check_rule_2(events, "2026-10-01", "2026-10-31")
    assert finding["rule"] == 2
    assert finding["date"] == "2026-11-15"
    
def test_rule_2_clean_case():
    events = [event("2026-11-15", "papers_received"), event("2026-12-01", "coverage_restored")]
    finding = check_rule_2(events, "2026-10-01", "2026-10-31")
    assert finding is None

def test_rule_2_edge_case():
    events = [event("2026-12-29", "papers_received")]
    finding = check_rule_2(events, "2026-10-01", "2026-10-31")
    assert finding["date"] == "2026-12-29"

def test_rule_2_edge_late_case():
    events = [event("2026-12-30", "papers_received")]
    finding = check_rule_2(events, "2026-10-01", "2026-10-31")
    assert finding is None
    
def test_both_rules_no_events_case():
    events = []
    finding1 = check_rule_1(events, "2026-10-31")
    finding2 = check_rule_2(events, "2026-10-01", "2026-10-31")
    assert finding1 is None
    assert finding2 is None
    
def test_rule_1_different_order_case():
    events = [event("2026-11-01", "coverage_denied"), event("2026-10-20", "papers_received", "receipt"), ]
    finding = check_rule_1(events, "2026-10-31")
    assert finding["date"] == "2026-10-20"