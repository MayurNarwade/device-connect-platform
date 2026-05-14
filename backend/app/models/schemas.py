from pydantic import BaseModel, Field

class SessionCreateResponse(BaseModel):
    sessionId: str
    otp: str
    expiresIn: int
    token: str   # for host to connect via WebSocket

class SessionJoinRequest(BaseModel):
    otp: str = Field(..., min_length=6, max_length=6)

class SessionJoinResponse(BaseModel):
    sessionId: str
    deviceId: str
    token: str
    otp: str | None = None

class TurnCredentialsResponse(BaseModel):
    username: str
    credential: str
    ttl: int
    urls: list[str]
