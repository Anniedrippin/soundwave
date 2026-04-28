from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text

from fastapi_app.core.security import hash_password, verify_password, create_access_token


class AuthService:
    async def register_user(
        self, db: AsyncSession, username: str, email: str, password: str
    ) -> dict:
        """Create a new user via raw SQL (mirrors Django model schema)."""
        hashed = hash_password(password)

        result = await db.execute(
            text(
                """
                INSERT INTO core_user
                  (username, email, password, is_active, is_staff, is_superuser,
                   first_name, last_name,bio, avatar_url,date_joined, created_at)
                VALUES
                  (:username, :email, :password, true, false, false, '', '', '', '',NOW(), NOW())
                RETURNING id, username, email
                """
            ),
            {"username": username, "email": email, "password": hashed},
        )
        await db.commit()
        row = result.fetchone()
        return {"id": row.id, "username": row.username, "email": row.email}

    async def authenticate_user(
        self, db: AsyncSession, username: str, password: str
    ) -> dict | None:
        """Verify credentials and return user dict or None."""
        result = await db.execute(
            text(
                "SELECT id, username, email, password FROM core_user WHERE username = :username"
            ),
            {"username": username},
        )
        row = result.fetchone()
        if not row or not verify_password(password, row.password):
            return None
        return {"id": row.id, "username": row.username, "email": row.email}

    def generate_token(self, user: dict) -> str:
        return create_access_token({"sub": str(user["id"]), "username": user["username"]})


auth_service = AuthService()