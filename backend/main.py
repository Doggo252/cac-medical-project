"""ReplyBy backend.

This exists for one reason: some things cannot happen on the phone. The
Anthropic API key and the fax API key must never ship inside the app, because
anyone can read an app's code. So the phone talks to this server, and this
server is the only thing that holds the keys.

Endpoints arrive over the next few weeks:
  /extract     redacted letter text in, structured facts out   (week 2)
  /explain     confirmed facts in, plain-language summary out  (week 3)
  /draft       timeline facts in, draft letter out             (week 4)
  /fax         send a signed packet                            (week 5)
  /fax/status  check on a sent fax                             (week 5)

Run it from the repository root:
    .venv/bin/uvicorn backend.main:app --reload
"""

import json
import os
from datetime import date
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend import llm
from backend.grounding import invented_dates
from backend.redact import redact

# Read backend/.env into environment variables. Doing it by explicit path means
# it works no matter which folder the server was started from.
load_dotenv(Path(__file__).parent / ".env")

app = FastAPI(title="ReplyBy backend")

# The app runs on a different address than this server (the phone loads it from
# the Vite dev server), and browsers block those calls unless the server says
# they are allowed. In development that means the local network. Before the app
# is deployed, ALLOWED_ORIGINS gets set to the real address.
allowed = os.getenv("ALLOWED_ORIGINS", "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in allowed.split(",")],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    """Says the server is up, and whether it found its keys.

    It reports only whether each key is present, never the key itself.
    """
    return {
        "status": "ok",
        "service": "replyby-backend",
        "llm_key_loaded": bool(os.getenv("GEMINI_API_KEY")),
        "fax_key_loaded": bool(os.getenv("FAX_API_KEY")),
    }


# Reader A ------------------------------------------------------------------

PROMPTS = Path(__file__).parent.parent / "prompts"

# The fields Neil's prompt (prompts/extract.md) asks the model for. Keep this
# list the same as the JSON shape in that file. Anything the model leaves out
# comes back as null, and anything extra is dropped.
EXTRACT_FIELDS = [
    "letter_type", "notice_date", "effective_date", "ask", "appeal_language",
    "case_number", "worker_name", "worker_phone", "due_date", "certainty",
]


class LetterText(BaseModel):
    text: str


@app.post("/extract")
def extract(letter: LetterText):
    """Reader A: the AI reads the letter text and returns its facts."""
    # The phone already scrubbed the text. Scrub it again here, in case of a
    # bug in the app.
    clean, blanked = redact(letter.text)
    prompt = (PROMPTS / "extract.md").read_text().replace("{text}", clean)
    try:
        answer = llm.ask_for_json(prompt)
    except llm.LLMError as error:
        raise HTTPException(status_code=503, detail=str(error))
    if not isinstance(answer, dict):
        raise HTTPException(status_code=503, detail="model did not return an object")
    facts = {field: answer.get(field) for field in EXTRACT_FIELDS}
    return {"facts": facts, "redacted": blanked}


# Plain-language explanation ---------------------------------------------------

LANGUAGES = ["english", "spanish"]
URGENCY_LEVELS = ["low", "med", "high", "already passed", "no due date"]
# How many times to ask the model before giving up on a grounded answer.
EXPLAIN_TRIES = 2


class ExplainRequest(BaseModel):
    facts: dict
    language: str = "english"


def today():
    """Today's date. A function of its own so tests can set the date."""
    return date.today()


@app.post("/explain")
def explain(request: ExplainRequest):
    """Writes a short plain-language explanation of the letter from the facts
    the user confirmed, using Neil's prompt (prompts/explain.md)."""
    if request.language not in LANGUAGES:
        raise HTTPException(status_code=400, detail=f"language must be one of {LANGUAGES}")
    # The case number is never needed to explain a letter, so it is not sent.
    facts = {**request.facts, "case_number": None}
    prompt = ((PROMPTS / "explain.md").read_text()
              .replace("{facts}", json.dumps(facts, indent=2))
              .replace("{language}", request.language)
              .replace("{date}", today().isoformat()))

    problem = "the model gave no usable answer"
    for _ in range(EXPLAIN_TRIES):
        try:
            answer = llm.ask_for_json(prompt)
        except llm.LLMError as error:
            raise HTTPException(status_code=503, detail=str(error))
        text = answer.get("simplification") if isinstance(answer, dict) else None
        urgency = answer.get("urgency") if isinstance(answer, dict) else None
        if not isinstance(text, str) or urgency not in URGENCY_LEVELS:
            problem = "the model did not follow the answer format"
            continue
        # The safety rule: no date that is not in the confirmed facts.
        invented = invented_dates(text, facts)
        if invented:
            problem = f"the explanation mentioned a date that is not in the letter: {invented}"
            continue
        return {"explanation": text, "urgency": urgency, "language": request.language}
    raise HTTPException(status_code=502, detail=problem)
