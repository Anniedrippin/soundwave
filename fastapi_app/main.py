# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware

# from fastapi_app.routes import auth, music, playlist

# app = FastAPI(
#     title="Soundwave API",
#     description="Music streaming app powered by SoundCloud",
#     version="1.0.0",
# )

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:5173", "http://localhost:3000"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# app.include_router(auth.router)
# app.include_router(music.router)
# app.include_router(playlist.router)


# @app.get("/health")
# async def health():
#     return {"status": "ok", "service": "soundwave-fastapi"}
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from fastapi_app.routes import auth, music, playlist
from fastapi_app.core.config import settings

app = FastAPI(
    title="Soundwave API",
    description="Music streaming app powered by Jamendo",
    version="1.0.0",
)

# Allow both local dev and the deployed Render frontend URL
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    settings.FRONTEND_URL,
]
# Remove duplicates
allowed_origins = list(set(allowed_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(music.router)
app.include_router(playlist.router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "soundwave-fastapi"}