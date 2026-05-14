from fastapi import Request, HTTPException
from .redis import get_redis
import time

RATE_LIMITS = {
    "otp_create": (10, 60),   # 10 per minute
    "otp_join": (5, 60),
    "turn": (20, 60)
}

async def check_rate_limit(request: Request, action: str):
    redis = await get_redis()
    key = f"ratelimit:{action}:{request.client.host}"
    max_requests, window = RATE_LIMITS.get(action, (5, 60))
    current = await redis.get(key)
    if current and int(current) >= max_requests:
        raise HTTPException(429, "Rate limit exceeded")
    pipe = redis.pipeline()
    pipe.incr(key)
    pipe.expire(key, window)
    await pipe.execute()