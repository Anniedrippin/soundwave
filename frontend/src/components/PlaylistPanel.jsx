import { useState } from "react";
import { ListMusic, Plus, Trash2, Music, ChevronDown, ChevronUp, Loader } from "lucide-react";
import usePlaylistStore from "../store/playlistStore";
import usePlayerStore from "../store/playerStore";
import useAuthStore from "../store/authStore";

function msToMin(ms) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}

export default function PlaylistPanel() {
  const { playlists, loading, create, delete: deletePlaylist } = usePlaylistStore();
  const { setQueue } = usePlayerStore();
  const { user } = useAuthStore();

  const [expanded, setExpanded] = useState({});
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [open, setOpen] = useState(false);

  // Don't render at all if not logged in
  if (!user) return null;

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await create(newName.trim());
    setNewName("");
    setCreating(false);
  };

  const playPlaylist = (tracks) => {
    if (!tracks.length) return;
    setQueue(tracks.map((t) => ({
      id: t.track_id,
      title: t.title,
      artist: t.artist,
      artwork_url: t.artwork_url,
      duration_ms: t.duration_ms,
      audio_url: "",
    })));
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={styles.fab} title="My Playlists">
        <ListMusic size={20} />
        {playlists.length > 0 && (
          <span style={styles.badge}>{playlists.length}</span>
        )}
      </button>
    );
  }

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <span style={styles.headerTitle}>
          <ListMusic size={16} /> My Playlists
          {loading && <Loader size={12} style={{ marginLeft: 6, animation: "spin 1s linear infinite" }} />}
        </span>
        <button onClick={() => setOpen(false)} style={styles.closeBtn}>✕</button>
      </div>

      <div style={styles.body}>
        {playlists.map((pl) => (
          <div key={pl.id} style={styles.playlist}>
            <div
              style={styles.playlistHeader}
              onClick={() => setExpanded((e) => ({ ...e, [pl.id]: !e[pl.id] }))}
            >
              <span style={styles.plName}>{pl.name}</span>
              <div style={styles.plActions}>
                <span style={styles.plCount}>{pl.tracks.length} tracks</span>
                <button
                  style={styles.iconBtn}
                  onClick={(e) => { e.stopPropagation(); playPlaylist(pl.tracks); }}
                  title="Play playlist"
                >▶</button>
                <button
                  style={{ ...styles.iconBtn, color: "#e57373" }}
                  onClick={(e) => { e.stopPropagation(); deletePlaylist(pl.id); }}
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
                {expanded[pl.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
            </div>

            {expanded[pl.id] && (
              <div style={styles.trackList}>
                {pl.tracks.length === 0
                  ? <div style={styles.empty}>No tracks yet</div>
                  : pl.tracks.map((t) => (
                    <div key={t.id} style={styles.trackRow}>
                      <Music size={12} style={{ color: "#4ab8cc", flexShrink: 0 }} />
                      <span style={styles.trackTitle}>{t.title}</span>
                      <span style={styles.trackDur}>{msToMin(t.duration_ms)}</span>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        ))}

        {playlists.length === 0 && !creating && !loading && (
          <div style={styles.emptyState}>No playlists yet. Create one!</div>
        )}

        {creating ? (
          <div style={styles.createForm}>
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="Playlist name…"
              style={styles.input}
            />
            <button onClick={handleCreate} style={styles.confirmBtn}>Add</button>
            <button onClick={() => setCreating(false)} style={styles.cancelBtn}>✕</button>
          </div>
        ) : (
          <button onClick={() => setCreating(true)} style={styles.newBtn}>
            <Plus size={14} /> New Playlist
          </button>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const styles = {
  fab: {
    position: "fixed", bottom: 230, right: 24,
    width: 48, height: 48, borderRadius: "50%",
    background: "linear-gradient(135deg,#006978,#00bcd4)",
    border: "none", color: "#fff",
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 4px 16px rgba(0,188,212,0.4)",
    zIndex: 99,
  },
  badge: {
    position: "absolute", top: 4, right: 4,
    background: "#e91e63", color: "#fff",
    fontSize: 10, borderRadius: "50%",
    width: 16, height: 16, display: "flex",
    alignItems: "center", justifyContent: "center",
    fontWeight: 700,
  },
  panel: {
    position: "fixed", bottom: 190, right: 16,
    width: 300, maxHeight: 420,
    background: "#070712",
    border: "1px solid rgba(0,188,212,0.25)",
    borderRadius: 12,
    display: "flex", flexDirection: "column",
    boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
    zIndex: 99,
    overflow: "hidden",
  },
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "10px 14px",
    borderBottom: "1px solid rgba(0,188,212,0.15)",
    background: "rgba(0,188,212,0.06)",
  },
  headerTitle: { display: "flex", alignItems: "center", gap: 6, color: "#b0e8f0", fontSize: 13, fontWeight: 600 },
  closeBtn: { background: "none", border: "none", color: "#5ba8b8", cursor: "pointer", fontSize: 14 },
  body: { overflowY: "auto", flex: 1, padding: "8px 0" },
  playlist: { borderBottom: "1px solid rgba(0,188,212,0.08)" },
  playlistHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "8px 14px", cursor: "pointer",
  },
  plName: { color: "#d0f0fa", fontSize: 13, fontWeight: 500, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  plActions: { display: "flex", alignItems: "center", gap: 6, flexShrink: 0 },
  plCount: { color: "#4a8899", fontSize: 11 },
  iconBtn: { background: "none", border: "none", color: "#4ab8cc", cursor: "pointer", padding: 2, display: "flex", alignItems: "center" },
  trackList: { padding: "4px 14px 8px", display: "flex", flexDirection: "column", gap: 4 },
  trackRow: { display: "flex", alignItems: "center", gap: 6 },
  trackTitle: { flex: 1, color: "#7ab8c8", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  trackDur: { color: "#3a6878", fontSize: 11, fontFamily: "monospace" },
  empty: { color: "#3a6878", fontSize: 12, padding: "4px 0" },
  emptyState: { color: "#3a6878", fontSize: 13, textAlign: "center", padding: "20px 14px" },
  createForm: { display: "flex", gap: 6, padding: "8px 14px" },
  input: {
    flex: 1, background: "rgba(0,188,212,0.08)",
    border: "1px solid rgba(0,188,212,0.2)",
    borderRadius: 6, color: "#d0f0fa",
    padding: "5px 8px", fontSize: 13, outline: "none",
  },
  confirmBtn: { background: "#006978", border: "none", color: "#fff", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 12 },
  cancelBtn: { background: "none", border: "none", color: "#5ba8b8", cursor: "pointer", fontSize: 13 },
  newBtn: {
    display: "flex", alignItems: "center", gap: 6,
    margin: "8px 14px",
    background: "rgba(0,188,212,0.08)",
    border: "1px dashed rgba(0,188,212,0.25)",
    borderRadius: 8, color: "#4ab8cc",
    padding: "7px 12px", cursor: "pointer",
    fontSize: 12, width: "calc(100% - 28px)",
    justifyContent: "center",
  },
};