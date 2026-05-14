import os
import logging

logger = logging.getLogger("aetherlink.redis")
redis_pool = None

# Check if Redis URL is provided
REDIS_URL = os.getenv("REDIS_URL")

async def init_redis():
    global redis_pool
    if not REDIS_URL:
        logger.warning("REDIS_URL not set – running without Redis")
        return
    try:
        import redis.asyncio as aioredis
        redis_pool = aioredis.from_url(REDIS_URL, encoding="utf-8", decode_responses=True)
        await redis_pool.ping()
        logger.info("Redis connected successfully at %s", REDIS_URL)
    except Exception as e:
        logger.critical("Failed to connect to Redis: %s", e)
        raise RuntimeError(f"Cannot connect to Redis: {e}")

async def close_redis():
    global redis_pool
    if redis_pool:
        await redis_pool.close()
        logger.info("Redis connection closed")

async def get_redis():
    if redis_pool is None:
        raise RuntimeError("Redis not initialised. Did you call init_redis()?")
    return redis_pool
