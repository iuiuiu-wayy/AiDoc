from functools import lru_cache
from typing import Literal
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    AUTH0_CLIENT_ID: str
    AUTH0_CLIENT_SECRET: str
    AUTH0_BASE_URL: str
    AUTH0_AUDIENCE: str
    SECRET_KEY: str
    REDIRECT_PROTOCOL: Literal["http", "https"] = "http"
    USERS_TOKEN_ISSUER: str
    DATABASE_URL: str
    QDRANT_URL: str
    UI_POSTFIX: str = "ui"
    API_POSTFIX: str = "api"


@lru_cache()
def get_settings():
    return Settings()
