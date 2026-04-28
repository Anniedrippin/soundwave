from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Playlist, PlaylistTrack

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("username", "email", "is_staff", "created_at")
    search_fields = ("username", "email")
    fieldsets = BaseUserAdmin.fieldsets + (("Profile",{"fields": ("bio", "avatar_url")}),
    )

class PlaylistInline(admin.TabularInline):
    model = PlaylistTrack
    extra = 0
    fields = ("position", "title", "artist","track_id","duration_ms")
    ordering = ("position",)

@admin.register(Playlist)
class PlaylistAdmin(admin.ModelAdmin):
    list_display = ("name", "user", "track_count", "created_at")
    list_filter = ("created_at",)
    search_fields = ("name","user__username")
    inlines = [PlaylistInline]
    readonly_fields = ("created_at","updated_at")

@admin.register(PlaylistTrack)
class PlaylistTrackAdmin(admin.ModelAdmin):
    list_display = ("title","artist","playlist","position","added_at")
    list_filter = ("playlist",)
    search_fields = ("title", "artist")
