from livekit.api import AccessToken, VideoGrants

from app.core.config import Settings


def create_room_token(
    settings: Settings,
    *,
    room_name: str,
    identity: str,
    name: str | None = None,
    can_publish: bool = True,
) -> str:
    grants = VideoGrants(
        room_join=True,
        room=room_name,
        can_publish=can_publish,
        can_subscribe=True,
    )
    token = AccessToken(settings.livekit_api_key, settings.livekit_api_secret)
    token.with_identity(identity)
    if name:
        token.with_name(name)
    token.with_grants(grants)
    return token.to_jwt()
