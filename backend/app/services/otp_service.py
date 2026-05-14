from ..core.redis import get_redis
from ..core.security import generate_otp
from ..core.config import OTP_TTL_SECONDS
import uuid

async def create_otp_session():
    redis = await get_redis()
    session_id = str(uuid.uuid4())
    otp = generate_otp()
    # Store OTP -> session_id
    await redis.setex(f"otp:{otp}", OTP_TTL_SECONDS, session_id)
    # Create session hash
    await redis.hset(f"session:{session_id}", mapping={
        "status": "waiting",
        "device_a": "",
        "device_b": "",
        "created_at": str(await redis.time())
    })
    await redis.expire(f"session:{session_id}", OTP_TTL_SECONDS + 300)
    return session_id, otp

async def validate_otp(otp: str):
    redis = await get_redis()
    session_id = await redis.get(f"otp:{otp}")
    if not session_id:
        return None
    # Single use: delete OTP key
    await redis.delete(f"otp:{otp}")
    return session_id