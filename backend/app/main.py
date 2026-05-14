from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import health, session, turn
from .ws.signaling import router as ws_router
from .core.redis import init_redis, close_redis

app = FastAPI(title="AetherLink Signaling")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["health"])
app.include_router(session.router, prefix="/api", tags=["session"])
app.include_router(turn.router, prefix="/api", tags=["turn"])
app.include_router(ws_router)

@app.on_event("startup")
async def startup():
    await init_redis()

@app.on_event("shutdown")
async def shutdown():
    await close_redis()