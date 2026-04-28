# from pydantic_settings import BaseSettings


# class Settings(BaseSettings):
#     # Database
#     DATABASE_URL: str

#     # Jamendo
#     JAMENDO_CLIENT_ID: str = "fedb555f"
#     JAMENDO_CLIENT_SECRET: str = "d4307b3a8b137a284f17b2be698fb95b"

#     # JWT
#     SECRET_KEY: str
#     ALGORITHM: str = "HS256"
#     ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

#     class Config:
#         env_file = ".env"


# settings = Settings()
import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database — Render provides postgresql://, asyncpg needs postgresql+asyncpg://
    DATABASE_URL: str = "postgresql+asyncpg://user:pass@localhost/soundwave"

    # Jamendo
    JAMENDO_CLIENT_ID: str = "fedb555f"
    JAMENDO_CLIENT_SECRET: str = "d4307b3a8b137a284f17b2be698fb95b"

    # JWT
    SECRET_KEY: str = "changeme"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Frontend origin for CORS (set this to your Render static site URL)
    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"

    @property
    def async_database_url(self) -> str:
        """Ensure the URL uses the asyncpg driver prefix."""
        url = self.DATABASE_URL
        if url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        return url


settings = Settings()