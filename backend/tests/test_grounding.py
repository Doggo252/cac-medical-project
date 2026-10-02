"""The safety rule from CLAUDE.md: an explanation is rejected if it contains a
date that is not in the confirmed facts."""

from backend.grounding import dates_in_text, invented_dates

FACTS = {"letter_type": "MC355", "notice_date": "2026-09-20", "due_date": "2026-10-04", "ask": "proof of income"}


def test_finds_dates_written_many_ways():
    assert dates_in_text("by 2026-10-04") == {(2026, 10, 4)}
    assert dates_in_text("by 10/04/2026 or 10/4/26") == {(2026, 10, 4)}
    assert dates_in_text("by October 4, 2026") == {(2026, 10, 4)}
    assert dates_in_text("by October 4th, 2026") == {(2026, 10, 4)}
    assert dates_in_text("by Oct. 4, 2026") == {(2026, 10, 4)}
    assert dates_in_text("by 4 October 2026") == {(2026, 10, 4)}
    assert dates_in_text("antes del 4 de octubre de 2026") == {(2026, 10, 4)}
    assert dates_in_text("antes del 4 de octubre del 2026") == {(2026, 10, 4)}
    assert dates_in_text("by October 4") == {(None, 10, 4)}


def test_a_grounded_explanation_passes():
    text = "The county needs proof of income. Send it by October 4th, 2026."
    assert invented_dates(text, FACTS) == []


def test_grounded_in_spanish_passes():
    text = "El condado necesita comprobante de ingresos. Envielo antes del 4 de octubre de 2026."
    assert invented_dates(text, FACTS) == []


def test_an_invented_date_is_caught():
    text = "Send your papers by October 14, 2026."
    assert invented_dates(text, FACTS) == ["2026-10-14"]


def test_right_day_wrong_year_is_caught():
    assert invented_dates("Send it by October 4, 2027.", FACTS) == ["2027-10-04"]


def test_a_date_without_a_year_must_match_a_fact():
    assert invented_dates("Send it by October 4.", FACTS) == []
    assert invented_dates("Send it by October 9.", FACTS) == ["????-10-09"]


def test_no_dates_in_facts_means_any_date_is_invented():
    # The test from plan v3: a letter with no effective date must not get one.
    facts = {"letter_type": "MC_239A", "effective_date": None}
    assert invented_dates("Your coverage ends on October 31, 2026.", facts) == ["2026-10-31"]
    assert invented_dates("Your coverage is ending. Call your worker.", facts) == []


def test_ordinary_numbers_are_not_dates():
    assert invented_dates("You have 30 days. Call (408) 758-3862. May we help?", FACTS) == []
