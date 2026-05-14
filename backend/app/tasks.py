from arq import cron
from .core.redis import get_redis
from .core.config import OTP_TTL_SECONDS
import asyncio

async def cleanup_expired(ctx):
    """Remove expired OTP and session keys (Redis TTL handles most, but extra safety)."""
    redis = get_redis()
    # No explicit cleanup needed because keys have TTL, but can implement additional sweep.
    pass

class WorkerSettings:
    functions = [cleanup_expired]
    cron_jobs = [
        cron(cleanup_expired, hour=None, minute=30, run_at_startup=False),
    ]
    redis_settings = 'REDIS_URL'