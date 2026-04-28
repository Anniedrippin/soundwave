# from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
# from sqlalchemy.orm import DeclarativeBase
# from fastapi_app.core.config import settings

# engine = create_async_engine(settings.DATABASE_URL, echo=False)
# AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

# class Base(DeclarativeBase):
#     pass

# async def get_db() -> AsyncSession:
#     async with AsyncSessionLocal() as session:
#         try:
#             yield session
#         finally:
#             await session.close()
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from fastapi_app.core.config import settings

engine = create_async_engine(
    settings.async_database_url,
    echo=False,
    connect_args={"ssl": "require"} if "render.com" in settings.DATABASE_URL else {},
)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()