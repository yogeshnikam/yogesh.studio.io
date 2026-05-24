import json
from typing import Any

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.db import redis_client

router = APIRouter()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    """Cross-device real-time channel (Phase 2: ping + Redis presence stub)."""
    await websocket.accept()
    channel = "presence:global"
    try:
        redis = redis_client.get_redis()
        await redis.sadd(channel, websocket.client.host or "unknown")
        await websocket.send_json(
            {"type": "connected", "message": "yogesh.studio websocket ready"}
        )

        while True:
            raw = await websocket.receive_text()
            try:
                data: dict[str, Any] = json.loads(raw)
            except json.JSONDecodeError:
                await websocket.send_json(
                    {"type": "error", "message": "Expected JSON payload"}
                )
                continue

            msg_type = data.get("type", "ping")
            if msg_type == "ping":
                await websocket.send_json({"type": "pong"})
            else:
                await websocket.send_json(
                    {"type": "echo", "received": data}
                )
    except WebSocketDisconnect:
        pass
    finally:
        try:
            redis = redis_client.get_redis()
            await redis.srem(channel, websocket.client.host or "unknown")
        except Exception:
            pass
