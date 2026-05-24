import asyncio

from app.core.config import get_settings
from app.db import mongodb

get_settings.cache_clear()


async def main() -> None:
    settings = get_settings()
    print("Database:", settings.mongodb_uri.split("@")[-1].split("?")[0])
    await mongodb.connect_mongodb()
    try:
        db = mongodb.get_database()
        await db.command("ping")
        print("MongoDB ping: ok")
    except Exception as exc:
        print("MongoDB ping: failed")
        print(type(exc).__name__ + ":", exc)
    await mongodb.close_mongodb()


if __name__ == "__main__":
    asyncio.run(main())
