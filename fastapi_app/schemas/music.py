from pydantic import BaseModel
from typing import Optional

class TrackSchema(BaseModel):
    id: int
    title: str
    artist: str
    artist_avatar: Optional[str] = ""
    duration_ms: int
    artwork_url: Optional[str] = ""
    genre: Optional[str] = ""
    plays: Optional[int] = 0
    likes: Optional[int] = 0
    permalink_url: Optional[str] = ""
    streamable: bool = True
    audio_url: Optional[str] = ""

class SearchResponse(BaseModel):
    tracks: list[TrackSchema]
    total: int

class StreamResponse(BaseModel):
    track_id: int
    stream_url: str