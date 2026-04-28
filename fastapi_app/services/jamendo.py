import httpx
from typing import Optional

from fastapi_app.core.config import settings 

JAMENDO_API_URL = "https://api.jamendo.com/v3.0"

class JamendoService:
    def __init__(self):
        self.client_id = settings.JAMENDO_CLIENT_ID
        self.base_params = {
            "client_id": self.client_id,
            "format": "json",
        }

    async def search_tracks(self, query: str, limit:int =20, offset: int = 0) ->dict:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{JAMENDO_API_URL}/tracks",
                params={
                    **self.base_params,
                    "search": query,
                    "limit": limit,
                    "offset": offset,
                    "include": "musicinfo licenses",
                    "audioformat": "mp32",
                    "imagesize": 500,
                },
                timeout=10,
            )
            resp.raise_for_status()
            data = resp.json()
        
        results = data.get("results",[])
        tracks = [self._normalize_track(item) for item in results]
        return {
            "tracks": tracks,
            "total": data.get("headers", {}).get("results_count", len(tracks)),
        }
    
    async def get_track(self, track_id: int)-> dict:
        async with httpx.AsyncClient() as client:
            resp - await client.get(
                f"{JAMENDO_API_URL}/tracks",
                params={
                    **self.base_params,
                    "id": track_id,
                    "include": "musicinfo licenses",
                    "audioformat": "mp32",
                    "imagesize": 500,
                },
                timeout=10,
            )
            resp.raise_for_status()
            results = resp.json().get("results", [])
            if not results:
                raise ValueError(f"Track {track_id} not found")
            return self._normalize_track(results[0])
        
    async def get_stream_url(self, track_id: int) -> Optional[str]:
        
        return(
             f"https://mp3l.jamendo.com/"
            f"?trackid={track_id}&format=mp32&from=app-{self.client_id}"
        )
    
    async def get_tracks_by_tag(
            self, tag: str, limit: int =20, offset:int = 0
    )-> dict:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{JAMENDO_API_URL}/tracks",
                params={
                    **self.base_params,
                    "tags": tag,
                    "limit": limit,
                    "offset": offset,
                    "include": "musicinfo licenses",
                    "audioformat": "mp32",
                    "imagesize": 500,
                    "order": "popularity_total",
                },
                timeout=10,
            )
            resp.raise_for_status()
            data = resp.json()
        
        results = data.get("results",[])
        return {
            "tracks": [self._normalize_track(item) for item in results],
            "total": data.get("headers", {}).get("results_count", len(results)),
        }
    
    def _normalize_track(self, item: dict) -> dict:
        duration_sec = int(item.get("duration", 0))
        musicinfo = item.get("musicinfo", {})
        tags = musicinfo.get("tags", {})
        genre_list = tags.get("genres", []) or tags.get("vartags", [])
        genre = genre_list[0] if genre_list else "Unknown"
        return {
            "id": item.get("id"),
            "title": item.get("name", "Unknown Title"),
            "artist": item.get("artist_name", "Unknown Artist"),
            "artist_avatar": "",
            "duration_ms": duration_sec * 1000,
            "artwork_url": item.get("image", ""),
            "genre": genre,
            "plays" : item.get("stats", {}).get("listened", 0) if isinstance(item.get("stats"),dict)else 0,
            "likes" : item.get("stats", {}).get("favorited", 0) if isinstance(item.get("stats"),dict) else 0,
            "permalink_url": item.get("shareurl", ""),
            "streamable": True,
            "audio_url": item.get("audio", ""),
                                                            
        }
jamendo_service = JamendoService()