from fastapi import APIRouter

from app.db import mongodb, redis_client

router = APIRouter(tags=["health"])


@router.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "yogesh.studio-api"}


@router.get("/health/ready")
async def readiness() -> dict[str, object]:
    mongo_ok = await mongodb.ping_mongodb()
    redis_ok = await redis_client.ping_redis()
    ready = mongo_ok and redis_ok
    return {
        "ready": ready,
        "checks": {
            "mongodb": mongo_ok,
            "redis": redis_ok,
        },
    }
