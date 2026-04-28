from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PlaylistCreate(BaseModel):
    name: str
    description: Optional[str]= ""

class PlaylistTrackAdd(BaseModel):
    track_id: int
    title: str
    artist: str
    artwork_url: Optional[str]= ""
    duration_ms: Optional[int]= 0

class PlaylistTrackSchema(BaseModel):
    id: int
    track_id: int
    title: str
    artist: str
    artwork_url: Optional[str] = ""
    duration_ms: int
    position: int

    class Config:
        from_attributes = True

class PlaylistSchema(BaseModel):
    id: int
    name: str
    description: Optional[str] = ""
    created_at: datetime
    tracks: list[PlaylistTrackSchema]=[]

    class Config:
        from_attributes =True
