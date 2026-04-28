from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    """extends user model"""
    bio = models.TextField(blank = True, default="")
    avatar_url = models.URLField(blank = True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table= "core_user"
        verbose_name= "User"

    def __str__(self):
        return self.username

class Playlist(models.Model):
    """a named collection of tracks owned by a user"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="playlists")
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "core_playlist"
        ordering = ["-created_at"]
        verbose_name = "Playlist"

    def __str__(self):
        return f"{self.name} ({self.user.username})"
    
    @property
    def track_count(self):
        return self.tracks.count()

class PlaylistTrack(models.Model):
    playlist = models.ForeignKey(Playlist, on_delete=models.CASCADE, related_name="tracks")
    track_id = models.BigIntegerField(help_text="jamendo track ID")
    title = models.CharField(max_length=500)
    artist = models.CharField(max_length=300)
    artwork_url = models.URLField(blank=True, default="")
    duration_ms = models.IntegerField(default=0)
    position = models.PositiveIntegerField(default=0)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "core_playlisttrack"
        ordering = ["position"]
        verbose_name = "Playlist Track"

    def __str__(self):
        return f"{self.title}- {self.artist} (#{self.position})"
    