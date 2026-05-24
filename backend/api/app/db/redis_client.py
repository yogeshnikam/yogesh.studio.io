import redis.asyncio as redis

from app.core.config import get_settings

_redis: redis.Redis | None = None


async def connect_redis() -> None:
    global _redis
    settings = get_settings()
    _redis = redis.from_url(
        settings.redis_url,
        decode_responses=True,
        socket_connect_timeout=3,
    )


async def close_redis() -> None:
    global _redis
    if _redis is not None:
        await _redis.aclose()
        _redis = None


def get_redis() -> redis.Redis:
    if _redis is None:
        raise RuntimeError("Redis is not connected")
    return _redis


async def ping_redis() -> bool:
    try:
        client = get_redis()
        return await client.ping()
    except Exception:
        return False
