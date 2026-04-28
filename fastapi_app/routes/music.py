from fastapi import APIRouter, Query,HTTPException, Depends
from fastapi_app.schemas.music import SearchResponse, TrackSchema, StreamResponse
from fastapi_app.core.security import get_current_user
from fastapi_app.services.jamendo import jamendo_service

router = APIRouter(prefix="/music", tags=["music"])

@router.get("/search", response_model=SearchResponse)
async def searach_tracks(
    q:str =Query(...,min_length=1, description="Search query"),
    limit: int = Query(20, ge=1, le=50),
    offset: int = Query(0, ge=0),
):
    """Search jamendo tracks by query string"""
    try:
        return await jamendo_service.search_tracks(q, limit=limit, offset=offset)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Jamendo API error : {str(e)}")
    
@router.get("/browse", response_model=SearchResponse)
async def browse_by_tag(
    tag: str = Query(..., description="Genre or mood tag e.g. 'rock','jazz','ambient'"),
    limit: int = Query(20, ge=1, le=50),
    offset: int = Query(0, ge=0),
):
    """Browse jamendo tracks by genre /mood tag"""
    try:
        return await jamendo_service.get_tracks_by_tag(tag, limit=limit, offset=offset)
    except Exception as e:
        raise  HTTPException(status_code=502, detail=f"Jamendo api error: {str(e)}")
    
@router.get("/stream/{track_id}", response_model=StreamResponse)
async def get_stream_url(
    track_id: int,
    current_user: dict = Depends(get_current_user),
):
    """ Get a direct MP3 stream URL for a Jamendo track.
    Requires authentication. All Jamendo tracks are freely streamable."""
    url = await jamendo_service.get_stream_url(track_id)
    if not url:
        raise HTTPException(status_code=404, detail="stream url unavailable")
    return StreamResponse(track_id=track_id, stream_url=url)