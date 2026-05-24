from datetime import UTC, datetime
from uuid import uuid4

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.room import RoomCreate, RoomResponse


async def create_room(db: AsyncIOMotorDatabase, payload: RoomCreate) -> RoomResponse:
    room_id = str(uuid4())
    doc = {
        "_id": room_id,
        "name": payload.name,
        "host_identity": payload.host_identity,
        "status": "idle",
        "created_at": datetime.now(UTC),
    }
    await db.rooms.insert_one(doc)
    return RoomResponse(
        id=room_id,
        name=payload.name,
        host_identity=payload.host_identity,
        status="idle",
        created_at=doc["created_at"],
    )


async def get_room(db: AsyncIOMotorDatabase, room_id: str) -> RoomResponse | None:
    doc = await db.rooms.find_one({"_id": room_id})
    if not doc:
        return None
    return RoomResponse(
        id=doc["_id"],
        name=doc["name"],
        host_identity=doc["host_identity"],
        status=doc.get("status", "idle"),
        created_at=doc["created_at"],
    )
