from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import secrets
import os
from datetime import datetime, timedelta
import jwt

router = APIRouter()

# Simple in‑memory storage
sessions = {}   # session_id -> {"otp": str, "devices": [{"device_id": str, "name": str}]}

class SessionJoinResponse(BaseModel):
    sessionId: str
    deviceId: str
    token: str
    otp: str = None   # only for host

class SessionJoinRequest(BaseModel):
    otp: str

def create_session_token(session_id: str, device_id: str) -> str:
    payload = {
        "session_id": session_id,
        "device_id": device_id,
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    secret = os.getenv("SECRET_KEY", "default-secret-change-me")
    return jwt.encode(payload, secret, algorithm="HS256")

@router.post("/session", response_model=SessionJoinResponse)
async def create_session():
    session_id = secrets.token_hex(16)
    otp = secrets.token_hex(3).upper()[:6]   # 6‑digit OTP
    device_id = secrets.token_hex(8)
    
    sessions[session_id] = {
        "otp": otp,
        "devices": [{"device_id": device_id, "name": "Host Device"}]
    }
    
    token = create_session_token(session_id, device_id)
    return SessionJoinResponse(
        sessionId=session_id,
        deviceId=device_id,
        token=token,
        otp=otp
    )

@router.post("/session/join", response_model=SessionJoinResponse)
async def join_session(join: SessionJoinRequest):
    for sid, data in sessions.items():
        if data["otp"] == join.otp:
            # Check if already two devices (host + one guest)
            if len(data["devices"]) >= 2:
                raise HTTPException(status_code=400, detail="Session full")
            device_id = secrets.token_hex(8)
            data["devices"].append({"device_id": device_id, "name": "Guest Device"})
            token = create_session_token(sid, device_id)
            return SessionJoinResponse(
                sessionId=sid,
                deviceId=device_id,
                token=token
            )
    raise HTTPException(status_code=400, detail="Invalid or expired OTP")
