from fastapi import APIRouter, Request
from ..core.rate_limit import check_rate_limit
from ..services.turn_credentials import generate_turn_credentials
from ..models.schemas import TurnCredentialsResponse

router = APIRouter()

@router.get("/turn/credentials", response_model=TurnCredentialsResponse)
async def get_turn_credentials(request: Request):
    await check_rate_limit(request, "turn")
    creds = generate_turn_credentials()
    return TurnCredentialsResponse(**creds)