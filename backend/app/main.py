import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from .api import health, session, turn
from .ws.signaling import router as ws_router
from .core.redis import init_redis, close_redis

# Allowed origins – read from env, default to localhost for dev
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:8000").split(",")

app = FastAPI(title="AetherLink Signaling")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,      # ✅ restrict to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["health"])
app.include_router(session.router, prefix="/api", tags=["session"])
app.include_router(turn.router, prefix="/api", tags=["turn"])
app.include_router(ws_router)   # WebSocket routes

@app.on_event("startup")
async def startup():
    await init_redis()

@app.on_event("shutdown")
async def shutdown():
    await close_redis()
