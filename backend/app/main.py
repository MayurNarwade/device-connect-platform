import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from .api import health, session, turn
from .ws.signaling import router as ws_router

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:8000").split(",")

app = FastAPI(title="AetherLink Signaling")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(session.router, prefix="/api", tags=["session"])
app.include_router(turn.router, prefix="/api", tags=["turn"])
app.include_router(ws_router)   # WebSocket route at /ws/signal

@app.on_event("startup")
async def startup():
    print("🚀 AetherLink backend started")
    # No Redis needed for basic operation

@app.on_event("shutdown")
async def shutdown():
    print("🛑 AetherLink backend shutting down")
