from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter()

class IceServer(BaseModel):
    urls: List[str]
    username: str = None
    credential: str = None

class TurnCredentialsResponse(BaseModel):
    iceServers: List[IceServer]

@router.get("/turn/credentials", response_model=TurnCredentialsResponse)
async def get_turn_credentials():
    # For now, return only STUN (no TURN). You can add TURN later.
    return TurnCredentialsResponse(
        iceServers=[
            IceServer(urls=["stun:stun.l.google.com:19302"])
        ]
    )
