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

import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
        "anthropic_key_loaded": bool(os.getenv("ANTHROPIC_API_KEY")),
        "fax_key_loaded": bool(os.getenv("FAX_API_KEY")),
    }
