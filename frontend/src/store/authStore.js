import { create } from "zustand";
import { authAPI } from "../api";

// Lazy import to avoid circular dependency (authStore <-> playlistStore)
const getPlaylistStore = () => import("./playlistStore").then((m) => m.default);

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem("token") || null,
  isLoading: false,
  error: null,

  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authAPI.login({ username, password });
      localStorage.setItem("token", data.access_token);
      set({
        token: data.access_token,
        user: { id: data.user_id, username: data.username },
        isLoading: false,
      });
      // Load this user's playlists right after login
      const store = await getPlaylistStore();
      store.getState().load();
      return true;
    } catch (err) {
      set({
        error: err.response?.data?.detail || "Login failed",
        isLoading: false,
      });
      return false;
    }
  },

  register: async (username, email, password) => {
    set({ isLoading: true, error: null });
    try {
      await authAPI.register({ username, email, password });
      set({ isLoading: false });
      return true;
    } catch (err) {
      set({
        error: err.response?.data?.detail || "Registration failed",
        isLoading: false,
      });
      return false;
    }
  },

  logout: async () => {
    localStorage.removeItem("token");
    // Clear playlist state immediately so stale data is never shown
    const store = await getPlaylistStore();
    store.getState().clear();
    set({ user: null, token: null });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
