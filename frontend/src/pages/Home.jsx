import { useState } from "react";
import { Play, Plus, Clock, Hash } from "lucide-react";
import SearchBar from "../components/SearchBar";
import { musicAPI } from "../api";
import usePlayerStore from "../store/playerStore";
import useAuthStore from "../store/authStore";
import usePlaylistStore from "../store/playlistStore";

function msToMin(ms) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}

const GENRE_TAGS = [
  "pop", "rock", "electronic", "jazz", "classical",
  "hiphop", "ambient", "folk", "metal", "lounge",
];

function TrackCard({ track, onPlay, onAddToPlaylist }) {
  const { currentTrack, isPlaying } = usePlayerStore();
  const isActive = currentTrack?.id === track.id;

  return (
    <div
      style={{ ...styles.card, ...(isActive ? styles.cardActive : {}) }}
      onMouseEnter={(e) => { e.currentTarget.querySelector("[data-overlay]").style.opacity = 1; }}
      onMouseLeave={(e) => { e.currentTarget.querySelector("[data-overlay]").style.opacity = 0; }}
    >
      <div style={styles.artworkWrapper}>
        {track.artwork_url ? (
          <img src={track.artwork_url} alt="" style={styles.artwork} />
        ) : (
          <div style={styles.artworkPlaceholder}>♪</div>
        )}
        <button
          data-overlay
          style={styles.playOverlay}
          onClick={() => onPlay(track)}
        >
          {isActive && isPlaying ? "⏸" : "▶"}
        </button>
      </div>

      <div style={styles.cardBody}>
        <div style={styles.trackTitle} title={track.title}>{track.title}</div>
        <div style={styles.trackArtist}>{track.artist}</div>
        <div style={styles.cardFooter}>
          <span style={styles.duration}><Clock size={11} /> {msToMin(track.duration_ms)}</span>
          {track.genre && <span style={styles.genre}>{track.genre}</span>}
          <button style={styles.addBtn} onClick={() => onAddToPlaylist(track)} title="Add to playlist">
            <Plus size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [activeTag, setActiveTag] = useState(null);
  const [addModal, setAddModal] = useState(null);

  const { setQueue } = usePlayerStore();
  const { user } = useAuthStore();
  const { playlists, addTrack } = usePlaylistStore();

  const handleSearch = async (q) => {
    if (!q) { setResults([]); setSearched(false); setActiveTag(null); return; }
    setLoading(true);
    setActiveTag(null);
    try {
      const { data } = await musicAPI.search(q, 24);
      setResults(data.tracks);
      setSearched(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleBrowseTag = async (tag) => {
    if (activeTag === tag) return;
    setLoading(true);
    setActiveTag(tag);
    setSearched(true);
    try {
      const { data } = await musicAPI.browseByTag(tag, 24);
      setResults(data.tracks);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (track) => {
    const idx = results.findIndex((t) => t.id === track.id);
    setQueue(results, idx >= 0 ? idx : 0);
  };

  const openAddToPlaylist = async (track) => {
    if (!user) { alert("Please log in to add tracks to playlists"); return; }
    // playlists are already in the store — no extra API call needed
    setAddModal(track);
  };

  const confirmAdd = async (playlistId) => {
    // addTrack calls the API and then reloads the store — panel updates instantly
    await addTrack(playlistId, addModal);
    setAddModal(null);
  };

  return (
    <div style={styles.page}>
      {/* Hero */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Find Your Sound</h1>
        <p style={styles.heroSub}>
          Free, legal music powered by{" "}
          <a href="https://www.jamendo.com" target="_blank" rel="noreferrer" style={styles.jamendoLink}>
            Jamendo
          </a>{" "}
          · Creative Commons licensed
        </p>
        <SearchBar onSearch={handleSearch} isLoading={loading} />
      </div>

      {/* Genre browse chips */}
      <div style={styles.tagsRow}>
        <Hash size={14} style={{ color: "#4a8899", flexShrink: 0 }} />
        <span style={styles.tagsLabel}>Browse:</span>
        {GENRE_TAGS.map((tag) => (
          <button
            key={tag}
            style={{ ...styles.tagChip, ...(activeTag === tag ? styles.tagChipActive : {}) }}
            onClick={() => handleBrowseTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Results */}
      {searched && (
        <div style={styles.results}>
          <div style={styles.resultsMeta}>
            {loading
              ? "Loading…"
              : results.length > 0
                ? `${results.length} tracks${activeTag ? ` in #${activeTag}` : ""}`
                : "No tracks found — try a different search"}
          </div>
          <div style={styles.grid}>
            {results.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                onPlay={handlePlay}
                onAddToPlaylist={openAddToPlaylist}
              />
            ))}
          </div>
        </div>
      )}

      {!searched && (
        <div style={styles.emptyHero}>
          <div style={styles.waveArt}>〜〜〜</div>
          <p style={styles.emptyText}>Search above or pick a genre to start exploring</p>
        </div>
      )}

      {/* Add to Playlist Modal */}
      {addModal && (
        <div style={styles.modalOverlay} onClick={() => setAddModal(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalTitle}>Add "{addModal.title}" to…</div>
            {playlists.length === 0 && (
              <div style={styles.modalEmpty}>No playlists yet. Create one first.</div>
            )}
            {playlists.map((pl) => (
              <button key={pl.id} style={styles.modalItem} onClick={() => confirmAdd(pl.id)}>
                {pl.name}
                <span style={styles.modalCount}>{pl.tracks.length} tracks</span>
              </button>
            ))}
            <button onClick={() => setAddModal(null)} style={styles.modalCancel}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#050510", paddingBottom: 220 },
  hero: {
    textAlign: "center", padding: "60px 24px 32px",
    background: "radial-gradient(ellipse at 50% 0%, rgba(0,188,212,0.12) 0%, transparent 70%)",
  },
  heroTitle: {
    color: "#e0f8ff", fontSize: "clamp(2rem, 5vw, 3.5rem)",
    fontWeight: 800, margin: "0 0 8px",
    fontFamily: "'Space Mono', monospace",
    letterSpacing: "-0.03em",
  },
  heroSub: { color: "#4a8899", marginBottom: 28, fontSize: 15 },
  jamendoLink: { color: "#00bcd4", textDecoration: "none", fontWeight: 600 },
  tagsRow: {
    display: "flex", alignItems: "center", flexWrap: "wrap",
    gap: 8, padding: "12px 28px 20px",
    maxWidth: 1200, margin: "0 auto",
  },
  tagsLabel: { color: "#3a6878", fontSize: 12, marginRight: 2 },
  tagChip: {
    background: "rgba(0,188,212,0.07)",
    border: "1px solid rgba(0,188,212,0.18)",
    borderRadius: 20, color: "#4a8899",
    padding: "4px 12px", fontSize: 12,
    cursor: "pointer", transition: "all 0.15s",
  },
  tagChipActive: {
    background: "rgba(0,188,212,0.2)",
    borderColor: "rgba(0,188,212,0.5)",
    color: "#b0e8f0",
  },
  results: { maxWidth: 1200, margin: "0 auto", padding: "0 24px" },
  resultsMeta: { color: "#4a8899", fontSize: 13, marginBottom: 16 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: 16,
  },
  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(0,188,212,0.12)",
    borderRadius: 12, overflow: "hidden",
    transition: "border-color 0.2s, transform 0.15s",
  },
  cardActive: {
    borderColor: "rgba(0,188,212,0.5)",
    boxShadow: "0 0 20px rgba(0,188,212,0.15)",
  },
  artworkWrapper: { position: "relative", aspectRatio: "1", background: "#0a0a1a" },
  artwork: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  artworkPlaceholder: {
    width: "100%", height: "100%", display: "flex",
    alignItems: "center", justifyContent: "center",
    fontSize: 40, color: "#1a4a55",
  },
  playOverlay: {
    position: "absolute", inset: 0,
    background: "rgba(0,0,0,0.45)",
    border: "none", color: "#fff",
    fontSize: 24, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    opacity: 0, transition: "opacity 0.15s",
  },
  cardBody: { padding: "10px 12px 12px" },
  trackTitle: {
    color: "#d0f0fa", fontSize: 13, fontWeight: 600,
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  trackArtist: { color: "#4a8899", fontSize: 12, marginTop: 2 },
  cardFooter: { display: "flex", alignItems: "center", gap: 6, marginTop: 8 },
  duration: { display: "flex", alignItems: "center", gap: 3, color: "#3a6878", fontSize: 11, fontFamily: "monospace" },
  genre: {
    background: "rgba(0,188,212,0.1)", color: "#4ab8cc",
    fontSize: 10, padding: "2px 6px", borderRadius: 4,
    border: "1px solid rgba(0,188,212,0.2)",
  },
  addBtn: {
    marginLeft: "auto", background: "rgba(0,188,212,0.1)",
    border: "1px solid rgba(0,188,212,0.2)",
    color: "#4ab8cc", borderRadius: 6,
    padding: "3px 6px", cursor: "pointer",
    display: "flex", alignItems: "center",
  },
  emptyHero: { textAlign: "center", padding: "60px 24px" },
  waveArt: { fontSize: 48, color: "rgba(0,188,212,0.2)", letterSpacing: "0.3em", marginBottom: 16 },
  emptyText: { color: "#2a5868", fontSize: 15 },
  modalOverlay: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 200,
  },
  modal: {
    background: "#080818", border: "1px solid rgba(0,188,212,0.25)",
    borderRadius: 14, padding: "20px", width: 300,
    maxHeight: 400, overflowY: "auto",
    boxShadow: "0 16px 48px rgba(0,0,0,0.7)",
  },
  modalTitle: { color: "#b0e8f0", fontSize: 14, fontWeight: 600, marginBottom: 14 },
  modalEmpty: { color: "#3a6878", fontSize: 13, padding: "8px 0" },
  modalItem: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    width: "100%", background: "rgba(0,188,212,0.06)",
    border: "1px solid rgba(0,188,212,0.15)",
    borderRadius: 8, padding: "9px 12px",
    color: "#b0e8f0", fontSize: 13,
    cursor: "pointer", marginBottom: 6,
  },
  modalCount: { color: "#3a6878", fontSize: 11 },
  modalCancel: {
    width: "100%", marginTop: 8, background: "none",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8, padding: "8px",
    color: "#5ba8b8", cursor: "pointer", fontSize: 13,
  },
};