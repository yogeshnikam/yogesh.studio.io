from urllib.parse import urlparse

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import get_settings

_client: AsyncIOMotorClient | None = None


async def connect_mongodb() -> None:
    global _client
    settings = get_settings()
    _client = AsyncIOMotorClient(
        settings.mongodb_uri,
        serverSelectionTimeoutMS=3000,
    )


async def close_mongodb() -> None:
    global _client
    if _client is not None:
        _client.close()
        _client = None


def _database_name() -> str:
    settings = get_settings()
    parsed = urlparse(settings.mongodb_uri)
    name = (parsed.path or "").strip("/")
    return name or "yogesh_studio"


def get_database() -> AsyncIOMotorDatabase:
    if _client is None:
        raise RuntimeError("MongoDB is not connected")
    return _client[_database_name()]


async def ping_mongodb() -> bool:
    try:
        db = get_database()
        await db.command("ping")
        return True
    except Exception:
        return False
