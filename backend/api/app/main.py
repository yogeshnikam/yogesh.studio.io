from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.health import router as health_router
from app.api.routes.rooms import router as rooms_router
from app.api.websocket import router as ws_router
from app.core.config import get_settings
from app.db import mongodb, redis_client


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    await mongodb.connect_mongodb()
    await redis_client.connect_redis()
    yield
    await redis_client.close_redis()
    await mongodb.close_mongodb()


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title=settings.app_name, lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health_router)
    app.include_router(rooms_router, prefix=settings.api_prefix)
    app.include_router(ws_router)

    return app


app = create_app()
