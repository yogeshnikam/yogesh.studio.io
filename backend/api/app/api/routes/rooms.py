from fastapi import APIRouter, Depends, HTTPException, status

from app.core.config import Settings, get_settings
from app.db.mongodb import get_database
from app.models.room import (
    LiveKitTokenRequest,
    LiveKitTokenResponse,
    RoomCreate,
    RoomResponse,
)
from app.services import livekit_tokens, rooms as room_service

router = APIRouter(prefix="/rooms", tags=["rooms"])


@router.post("", response_model=RoomResponse, status_code=status.HTTP_201_CREATED)
async def create_room(payload: RoomCreate) -> RoomResponse:
    db = get_database()
    return await room_service.create_room(db, payload)


@router.get("/{room_id}", response_model=RoomResponse)
async def get_room(room_id: str) -> RoomResponse:
    db = get_database()
    room = await room_service.get_room(db, room_id)
    if room is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")
    return room


@router.post("/{room_id}/token", response_model=LiveKitTokenResponse)
async def issue_token(
    room_id: str,
    payload: LiveKitTokenRequest,
    settings: Settings = Depends(get_settings),
) -> LiveKitTokenResponse:
    db = get_database()
    room = await room_service.get_room(db, room_id)
    if room is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

    token = livekit_tokens.create_room_token(
        settings,
        room_name=room.name,
        identity=payload.identity,
        name=payload.name,
        can_publish=payload.can_publish,
    )
    return LiveKitTokenResponse(
        token=token,
        livekit_url=settings.livekit_url,
        room_name=room.name,
    )
