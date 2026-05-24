from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env", "../../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "yogesh.studio API"
    debug: bool = True
    api_prefix: str = "/api/v1"
    cors_origins: str = "http://localhost:3000,http://localhost:8081"

    mongodb_uri: str = "mongodb://localhost:27017/yogesh_studio"
    redis_url: str = "redis://localhost:6379/0"

    livekit_url: str = "ws://localhost:7880"
    livekit_api_key: str = "devkey"
    livekit_api_secret: str = "secret"

    jwt_secret: str = "change-me-in-production"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
