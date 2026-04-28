import { create } from "zustand";
import { playlistAPI } from "../api";

const usePlaylistStore = create((set, get) => ({
  playlists: [],
  loading: false,

  // Fetch playlists for the current user. Silently clears on 401.
  load: async () => {
    set({ loading: true });
    try {
      const { data } = await playlistAPI.getAll();
      set({ playlists: data, loading: false });
    } catch {
      // Not logged in or token expired — clear stale data
      set({ playlists: [], loading: false });
    }
  },

  // Call this on logout or account switch to immediately wipe local state
  clear: () => set({ playlists: [] }),

  create: async (name, description = "") => {
    await playlistAPI.create({ name, description });
    await get().load();
  },

  delete: async (id) => {
    await playlistAPI.delete(id);
    await get().load();
  },

  addTrack: async (playlistId, track) => {
    await playlistAPI.addTrack(playlistId, {
      track_id: track.id,
      title: track.title,
      artist: track.artist,
      artwork_url: track.artwork_url || "",
      duration_ms: track.duration_ms || 0,
    });
    // Reload so the panel reflects the new track immediately
    await get().load();
  },

  removeTrack: async (playlistId, trackRowId) => {
    await playlistAPI.removeTrack(playlistId, trackRowId);
    await get().load();
  },
}));

export default usePlaylistStore;
