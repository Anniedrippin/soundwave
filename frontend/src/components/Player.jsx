import { useEffect, useRef, useState } from "react";
import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, Loader
} from "lucide-react";
import usePlayerStore from "../store/playerStore";
import Visualizer from "./Visualizer";

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function Player() {
  const audioRef = useRef(null);
  const {
    currentTrack, streamUrl, isPlaying, isLoading,
    volume, progress,
    togglePlay, setIsPlaying, setVolume, setProgress,
    playNext, playPrev,
  } = usePlayerStore();

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Sync play/pause state to <audio>
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !streamUrl) return;
    audio.src = streamUrl;
    audio.load();
    audio.play().catch(() => setIsPlaying(false));
  }, [streamUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    isPlaying ? audio.play().catch(() => {}) : audio.pause();
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentTime(audio.currentTime);
    setProgress(audio.currentTime / (audio.duration || 1));
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = ratio * duration;
  };

  if (!currentTrack) return null;

  return (
    <div style={styles.wrapper}>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
        onEnded={playNext}
        crossOrigin="anonymous"
      />

      {/* Visualizer */}
      <div style={styles.vizWrapper}>
        <Visualizer audioRef={audioRef} isPlaying={isPlaying} />
      </div>

      {/* Track info */}
      <div style={styles.trackInfo}>
        {currentTrack.artwork_url && (
          <img src={currentTrack.artwork_url} alt="" style={styles.artwork} />
        )}
        <div style={styles.meta}>
          <div style={styles.title}>{currentTrack.title}</div>
          <div style={styles.artist}>{currentTrack.artist}</div>
        </div>
      </div>

      {/* Seek bar */}
      <div style={styles.seekRow}>
        <span style={styles.time}>{formatTime(currentTime)}</span>
        <div style={styles.seekBar} onClick={handleSeek}>
          <div style={{ ...styles.seekFill, width: `${progress * 100}%` }} />
          <div style={{ ...styles.seekThumb, left: `${progress * 100}%` }} />
        </div>
        <span style={styles.time}>{formatTime(duration)}</span>
      </div>

      {/* Controls */}
      <div style={styles.controls}>
        <button style={styles.btn} onClick={playPrev} title="Previous">
          <SkipBack size={20} />
        </button>

        <button style={styles.playBtn} onClick={togglePlay} disabled={isLoading}>
          {isLoading
            ? <Loader size={22} style={{ animation: "spin 1s linear infinite" }} />
            : isPlaying
              ? <Pause size={22} />
              : <Play size={22} />
          }
        </button>

        <button style={styles.btn} onClick={playNext} title="Next">
          <SkipForward size={20} />
        </button>

        {/* Volume */}
        <div style={styles.volGroup}>
          <button style={styles.btn} onClick={() => setVolume(volume === 0 ? 0.8 : 0)}>
            {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input
            type="range" min={0} max={1} step={0.02}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            style={styles.volSlider}
          />
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const styles = {
  wrapper: {
    position: "fixed",
    bottom: 0, left: 0, right: 0,
    background: "linear-gradient(180deg, #0a0a14 0%, #050510 100%)",
    borderTop: "1px solid rgba(0,200,220,0.2)",
    padding: "12px 24px 16px",
    zIndex: 100,
    boxShadow: "0 -8px 32px rgba(0,180,220,0.15)",
  },
  vizWrapper: { marginBottom: 10 },
  trackInfo: { display: "flex", alignItems: "center", gap: 12, marginBottom: 8 },
  artwork: { width: 44, height: 44, borderRadius: 6, objectFit: "cover", border: "1px solid rgba(0,200,220,0.3)" },
  meta: { flex: 1, minWidth: 0 },
  title: { color: "#e0f8ff", fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  artist: { color: "#6ec8d8", fontSize: 12, marginTop: 2 },
  seekRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 10 },
  time: { color: "#5ba8b8", fontSize: 11, minWidth: 36, fontFamily: "monospace" },
  seekBar: {
    flex: 1, height: 4, background: "rgba(0,200,220,0.15)",
    borderRadius: 2, cursor: "pointer", position: "relative",
  },
  seekFill: {
    position: "absolute", top: 0, left: 0, height: "100%",
    background: "linear-gradient(90deg, #00b8d4, #00e5ff)",
    borderRadius: 2, transition: "width 0.1s linear",
  },
  seekThumb: {
    position: "absolute", top: "50%",
    transform: "translate(-50%, -50%)",
    width: 10, height: 10, borderRadius: "50%",
    background: "#00e5ff", boxShadow: "0 0 6px #00e5ff",
    pointerEvents: "none",
  },
  controls: { display: "flex", alignItems: "center", justifyContent: "center", gap: 16 },
  btn: {
    background: "none", border: "none", color: "#6ec8d8",
    cursor: "pointer", padding: 6, borderRadius: 6,
    display: "flex", alignItems: "center",
    transition: "color 0.15s",
  },
  playBtn: {
    width: 44, height: 44, borderRadius: "50%",
    background: "linear-gradient(135deg, #0097a7, #00bcd4)",
    border: "none", color: "#fff",
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 0 16px rgba(0,188,212,0.5)",
    transition: "transform 0.1s",
  },
  volGroup: { display: "flex", alignItems: "center", gap: 4, marginLeft: 8 },
  volSlider: { width: 70, accentColor: "#00bcd4", cursor: "pointer" },
};