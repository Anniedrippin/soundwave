import { create } from "zustand";
import { musicAPI } from "../api";

const usePlayerStore = create((set, get) => ({
  currentTrack: null,
  queue: [],
  queueIndex: -1,
  isPlaying: false,
  isLoading: false,
  volume: 0.8,
  progress: 0,
  streamUrl: null,
  error: null,

  playTrack: async (track) => {
    set({ isLoading: true, error: null, currentTrack: track, streamUrl: null });
    try {
      let url = track.audio_url || null;
      if (!url) {
        const { data } = await musicAPI.getStreamUrl(track.id);
        url = data.stream_url;
      }
      set({ streamUrl: url, isPlaying: true, isLoading: false, progress: 0 });
    } catch (err) {
      set({
        error: err.response?.data?.detail || "Could not load stream",
        isLoading: false,
        isPlaying: false,
      });
    }
  },

  setQueue: (tracks, startIndex = 0) => {
    set({ queue: tracks, queueIndex: startIndex });
    get().playTrack(tracks[startIndex]);
  },

  playNext: () => {
    const { queue, queueIndex } = get();
    const next = queueIndex + 1;
    if (next < queue.length) {
      set({ queueIndex: next });
      get().playTrack(queue[next]);
    }
  },

  playPrev: () => {
    const { queue, queueIndex } = get();
    const prev = queueIndex - 1;
    if (prev >= 0) {
      set({ queueIndex: prev });
      get().playTrack(queue[prev]);
    }
  },

  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
  setIsPlaying: (v) => set({ isPlaying: v }),
  setVolume: (v) => set({ volume: v }),
  setProgress: (v) => set({ progress: v }),
  clearError: () => set({ error: null }),
}));

export default usePlayerStore;
