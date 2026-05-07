import os
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

project_root = Path(__file__).resolve().parent.parent

server_env = project_root / ".env"
root_env = project_root.parent / ".env"

if server_env.exists():
    load_dotenv(server_env)
elif root_env.exists():
    load_dotenv(root_env)

from config import settings  # noqa: E402
from routers import action_items, health, search, summarize, transcribe  # noqa: E402

os.makedirs(settings.upload_dir, exist_ok=True)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    os.makedirs(settings.upload_dir, exist_ok=True)
    yield


app = FastAPI(title="MeetingMind API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(transcribe.router)
app.include_router(action_items.router)
app.include_router(search.router)
app.include_router(summarize.router)
