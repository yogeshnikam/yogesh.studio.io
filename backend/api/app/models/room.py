from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class RoomCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    host_identity: str = Field(min_length=1, max_length=120)


class RoomResponse(BaseModel):
    id: str
    name: str
    host_identity: str
    status: Literal["idle", "live", "ended"] = "idle"
    created_at: datetime


class LiveKitTokenRequest(BaseModel):
    identity: str = Field(min_length=1, max_length=120)
    name: str | None = None
    can_publish: bool = True


class LiveKitTokenResponse(BaseModel):
    token: str
    livekit_url: str
    room_name: str
