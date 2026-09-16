"""Checks that the backend starts and answers /health."""

from fastapi.testclient import TestClient

from backend.main import app

client = TestClient(app)


def test_health_says_ok():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_health_never_leaks_a_key():
    # /health may say whether a key was found. It must never send the key.
    body = client.get("/health").json()
    for key, value in body.items():
        assert not isinstance(value, str) or "sk-" not in value
    assert set(body) == {"status", "service", "anthropic_key_loaded", "fax_key_loaded"}
