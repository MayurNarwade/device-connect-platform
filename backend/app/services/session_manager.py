from ..core.redis import get_redis
import uuid
import json

async def join_session(session_id: str, device_name: str = ""):
    redis = await get_redis()
    exists = await redis.exists(f"session:{session_id}")
    if not exists:
        return None
    # Check if already full (2 devices)
    status = await redis.hget(f"session:{session_id}", "status")
    if status == "active":
        return None  # Already two devices
    # Assign device id
    device_id = str(uuid.uuid4())[:8]
    device_info = json.dumps({"id": device_id, "name": device_name})
    # Determine role: if device_a empty, this is device_a else device_b
    if not await redis.hget(f"session:{session_id}", "device_a"):
        await redis.hset(f"session:{session_id}", "device_a", device_info)
        my_role = "host"
    else:
        await redis.hset(f"session:{session_id}", "device_b", device_info)
        my_role = "guest"
    # If both present, mark active
    if await redis.hget(f"session:{session_id}", "device_a") and await redis.hget(f"session:{session_id}", "device_b"):
        await redis.hset(f"session:{session_id}", "status", "active")
    return device_id, my_role

async def get_session_info(session_id: str):
    redis = await get_redis()
    return await redis.hgetall(f"session:{session_id}")

async def end_session(session_id: str):
    redis = await get_redis()
    await redis.delete(f"session:{session_id}")