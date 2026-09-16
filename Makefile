# Two commands. Run both before every commit.
#
#   make test-py   the Python side: backend, and the rules and classifier tests
#   make test-js   the app side
#
# Setup, done once:
#   make setup

PY := .venv/bin/python

.PHONY: setup test-py test-js test dev-app dev-backend

setup:
	python3 -m venv .venv
	$(PY) -m pip install --upgrade pip
	$(PY) -m pip install -r backend/requirements.txt
	npm --prefix app install

test-py:
	$(PY) -m pytest -q

test-js:
	npm --prefix app run test

test: test-py test-js

# The app, reachable from your phone on the same wifi. Vite prints the address.
dev-app:
	npm --prefix app run dev

dev-backend:
	.venv/bin/uvicorn backend.main:app --reload
