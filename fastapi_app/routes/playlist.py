from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text 

from fastapi_app.core.db import get_db
from fastapi_app.core.security import get_current_user
from fastapi_app.schemas.playlist import PlaylistCreate, PlaylistTrackSchema, PlaylistTrackAdd, PlaylistSchema

router = APIRouter(prefix="/playlists", tags=["playlists"])

@router.get("/", response_model=list[PlaylistSchema])
async def get_playlists(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all playlists for the current user."""
    result = await db.execute(
        text(
            """
            SELECT p.id, p.name, p.description, p.created_at,
                   pt.id as track_row_id, pt.track_id, pt.title, pt.artist,
                   pt.artwork_url, pt.duration_ms, pt.position
            FROM core_playlist p
            LEFT JOIN core_playlisttrack pt ON pt.playlist_id = p.id
            WHERE p.user_id = :user_id
            ORDER BY p.created_at DESC, pt.position ASC
            """
        ),
        {"user_id": current_user["id"]},
    )
    rows = result.fetchall()
 
    playlists: dict[int, dict] = {}
    for row in rows:
        if row.id not in playlists:
            playlists[row.id] = {
                "id": row.id,
                "name": row.name,
                "description": row.description or "",
                "created_at": row.created_at,
                "tracks": [],
            }
        if row.track_row_id:
            playlists[row.id]["tracks"].append(
                {
                    "id": row.track_row_id,
                    "track_id": row.track_id,
                    "title": row.title,
                    "artist": row.artist,
                    "artwork_url": row.artwork_url or "",
                    "duration_ms": row.duration_ms or 0,
                    "position": row.position,
                }
            )
    return list(playlists.values())
 
 
@router.post("/",response_model=PlaylistSchema, status_code=201)
async def create_playlist(
    payload: PlaylistCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession =Depends(get_db),
):
    """create a new empty playlist"""
    result = await db.execute(
        text(
            """  INSERT INTO core_playlist (name, description, user_id, created_at, updated_at)
            VALUES (:name, :description, :user_id, NOW(), NOW())
            RETURNING id, name, description, created_at
            """
        ),
        {"name": payload.name, "description": payload.description, "user_id": current_user["id"]},        
    )
    await db.commit()
    row = result.fetchone()
    return {"id": row.id, "name": row.name, "description": row.description or "","created_at": row.created_at, "tracks":[]}

@router.post("/{playlist_id}/tracks", status_code=201)
async def add_track_to_playlist(
    playlist_id: int,
    payload: PlaylistTrackAdd,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """add a track to a playlist"""
    check = await db.execute(
        text(
            "SELECT id FROM core_playlist WHERE id = :pid AND user_id= :uid"
        ),
        {"pid": playlist_id, "uid":current_user["id"]},
    )
    if not check.fetchone():
        raise HTTPException(status_code=404, detail="playlist not found")
    
    pos_result = await db.execute(
        text("SELECT COALESCE (MAX(position), 0) + 1 FROM core_playlisttrack WHERE playlist_id = :pid"),
        {"pid": playlist_id},
         )
    next_pos = pos_result.scalar()

    await db.execute(
            text(
                """
                INSERT INTO core_playlisttrack
              (playlist_id, track_id, title, artist, artwork_url, duration_ms, position, added_at)
            VALUES (:pid, :tid, :title, :artist, :artwork, :duration, :pos, NOW())
                """
            ),
            {
                "pid": playlist_id,
                "tid": payload.track_id,
                "title": payload.title,
                "artist": payload.artist,
                "artwork": payload.artwork_url,
                "duration": payload.duration_ms,
                "pos": next_pos,

            },

        )
    await db.commit()
    return {"message":"Track added", "position": next_pos}
    
@router.delete("/{playlist_id}/tracks/{track_row_id}", status_code=204)
async def remove_track(
    playlist_id: int,
    track_row_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession= Depends(get_db),
):
    """remove a track from a playlist"""
    await db.execute(
        text(
            """
            DELETE FROM core_playlisttrack pt
            USING core_playlist p 
            WHERE pt.id = :trid AND pt.playlist_id= :pid
            AND p.id = :pid AND p.user_id= :uid            
            """
        ),
        {"trid": track_row_id, "pid": playlist_id, "uid":current_user["id"]},
    )
    await db.commit()

@router.delete("/{playlist_id}", status_code=204)
async def delete_playlist(
    playlist_id: int,
    current_user: dict= Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await db.execute(
        text("DELETE FROM core_playlisttrack WHERE playlist_id= :pid"),
        {"pid": playlist_id},
    )
    await db.execute(
        text("DELETE FROM core_playlist WHERE id= :pid AND user_id= :uid"),
        {"pid": playlist_id, "uid": current_user["id"]},

    )
    await db.commit()