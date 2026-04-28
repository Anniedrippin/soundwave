// import axios from "axios";

// const api = axios.create({
//   baseURL: "/api",
//   // baseURL: "http://127.0.0.1:8001",
//   headers: { "Content-Type": "application/json" },
// });

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// api.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     if (err.response?.status === 401) {
//       localStorage.removeItem("token");
//       if (window.location.pathname !== "/login") {
//         window.location.href = "/login";
//       }
//     }
//     return Promise.reject(err);
//   },
// );

// export const authAPI = {
//   register: (data) => api.post("/auth/register", data),
//   login: (data) => api.post("/auth/login", data),
//   me: () => api.get("/auth/me"),
// };

// export const musicAPI = {
//   search: (q, limit = 20, offset = 0) =>
//     api.get("/music/search", { params: { q, limit, offset } }),
//   browseByTag: (tag, limit = 20, offset = 0) =>
//     api.get("/music/browse", { params: { tag, limit, offset } }),
//   getTrack: (id) => api.get(`/music/track/${id}`),
//   getStreamUrl: (id) => api.get(`/music/stream/${id}`),
// };

// export const playlistAPI = {
//   getAll: () => api.get("/playlists/"),
//   create: (data) => api.post("/playlists/", data),
//   delete: (id) => api.delete(`/playlists/${id}`),
//   addTrack: (playlistId, track) =>
//     api.post(`/playlists/${playlistId}/tracks`, track),
//   removeTrack: (playlistId, trackRowId) =>
//     api.delete(`/playlists/${playlistId}/tracks/${trackRowId}`),
// };
// export default api;

import axios from "axios";

// In production (Render static site), VITE_API_URL is set to the FastAPI service URL.
// In local dev, requests go to /api which Vite proxies to localhost:8000.
const BASE_URL = import.meta.env.VITE_API_URL
  ? `https://${import.meta.env.VITE_API_URL}`
  : "/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
};

// ── Music ─────────────────────────────────────────────────────────────────────
export const musicAPI = {
  search: (q, limit = 20, offset = 0) =>
    api.get("/music/search", { params: { q, limit, offset } }),
  browseByTag: (tag, limit = 20, offset = 0) =>
    api.get("/music/browse", { params: { tag, limit, offset } }),
  getTrack: (id) => api.get(`/music/track/${id}`),
  getStreamUrl: (id) => api.get(`/music/stream/${id}`),
};

// ── Playlists ─────────────────────────────────────────────────────────────────
export const playlistAPI = {
  getAll: () => api.get("/playlists/"),
  create: (data) => api.post("/playlists/", data),
  delete: (id) => api.delete(`/playlists/${id}`),
  addTrack: (playlistId, track) =>
    api.post(`/playlists/${playlistId}/tracks`, track),
  removeTrack: (playlistId, trackRowId) =>
    api.delete(`/playlists/${playlistId}/tracks/${trackRowId}`),
};

export default api;
