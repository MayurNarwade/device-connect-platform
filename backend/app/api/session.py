from fastapi import APIRouter, Request, HTTPException
from ..models.schemas import SessionJoinRequest, SessionJoinResponse
from ..services.otp_service import create_otp_session, validate_otp
from ..services.session_manager import join_session
from ..core.security import create_session_token
from ..core.rate_limit import check_rate_limit

router = APIRouter()

@router.post("/session", response_model=SessionJoinResponse)
async def create_session(request: Request):
    await check_rate_limit(request, "otp_create")
    session_id, otp = await create_otp_session()
    # Host automatically joins so they can receive signaling events
    result = await join_session(session_id, device_name="Host Device")
    if not result:
        raise HTTPException(status_code=500, detail="Failed to initialize session")
    device_id, role = result
    token = create_session_token(session_id, device_id)
    return SessionJoinResponse(
        sessionId=session_id,
        deviceId=device_id,
        token=token,
        otp=otp          # so the frontend can display the code
    )

@router.post("/session/join", response_model=SessionJoinResponse)
async def join(request: Request, body: SessionJoinRequest):
    await check_rate_limit(request, "otp_join")
    session_id = await validate_otp(body.otp)
    if not session_id:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    result = await join_session(session_id)
    if not result:
        raise HTTPException(status_code=400, detail="Session full or no longer available")
    device_id, role = result
    token = create_session_token(session_id, device_id)
    return SessionJoinResponse(sessionId=session_id, deviceId=device_id, token=token)