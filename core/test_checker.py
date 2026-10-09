from core.checker import check

def test_correct_form_passes():
    facts = {"notice_date": "2026-11-03", "worker_phone": "6506789101"}
    form  = {"notice_date": "November 3rd, 2026", "worker_phone": "(650)-678-9101"}
    assert check(form, facts) == []

def test_planted_wrong_date_blocks():
    facts = {"notice_date": "2026-10-03"}
    form  = {"notice_date": "2026-10-01"}
    assert len(check(form, facts)) == 1
    assert check(form, facts)[0]["field"] == "notice_date"
    
def test_date_formats_match():
    facts = {"notice_date": "2026-10-01"}
    form  = {"notice_date": "10/01/2026"}
    assert check(form, facts) == []

    facts = {"notice_date": "2026-10-01"}
    form  = {"notice_date": "October 1, 2026"}
    assert check(form, facts) == []

def test_near_miss_caught():
    facts = {"notice_date": "2026-03-04"}
    form  = {"notice_date": "2026-04-03"}
    assert len(check(form, facts)) == 1
    
def test_blank_field_caught():
    facts = {"worker_name": "John Smith"}
    form  = {"worker_name": "   "}
    assert len(check(form, facts)) == 1

def test_two_mismatches():
    facts = {"notice_date": "2026-10-01", "worker_phone": "4085550123"}
    form  = {"notice_date": "2026-10-05", "worker_phone": "4085550999"}
    assert len(check(form, facts)) == 2

def test_none_fact_skipped():
    facts = {"notice_date": None}
    form  = {"notice_date": "2026-10-01"}
    assert check(form, facts) == []
    
def test_garbage_date_caught():
    facts = {"notice_date": "2026-10-01"}
    form  = {"notice_date": "sometime soon"}
    assert len(check(form, facts)) == 1
