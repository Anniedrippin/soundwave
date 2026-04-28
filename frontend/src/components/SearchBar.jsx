import { useState } from "react";
import { Search, X } from "lucide-react";

export default function SearchBar({ onSearch, isLoading }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  };

  const clear = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.wrapper}>
        <Search size={18} style={styles.icon} />
        <input
          type="text"
          placeholder="Search songs, artists, genres…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={styles.input}
          autoComplete="off"
          spellCheck={false}
        />
        {query && (
          <button type="button" onClick={clear} style={styles.clearBtn}>
            <X size={14} />
          </button>
        )}
        <button
          type="submit"
          disabled={!query.trim() || isLoading}
          style={styles.submitBtn}
        >
          {isLoading ? "…" : "Search"}
        </button>
      </div>
    </form>
  );
}

const styles = {
  form: { width: "100%", maxWidth: 680, margin: "0 auto" },
  wrapper: {
    display: "flex", alignItems: "center",
    background: "rgba(0,180,220,0.07)",
    border: "1px solid rgba(0,180,220,0.25)",
    borderRadius: 10,
    padding: "0 12px",
    gap: 8,
    transition: "border-color 0.2s",
  },
  icon: { color: "#4ab8cc", flexShrink: 0 },
  input: {
    flex: 1, border: "none", background: "transparent",
    color: "#e0f8ff", fontSize: 15, padding: "12px 0",
    outline: "none",
    fontFamily: "'Space Mono', monospace",
  },
  clearBtn: {
    background: "none", border: "none",
    color: "#4a8899", cursor: "pointer",
    padding: 4, display: "flex",
  },
  submitBtn: {
    background: "linear-gradient(135deg, #006978, #00bcd4)",
    border: "none", color: "#fff",
    padding: "6px 16px", borderRadius: 6,
    cursor: "pointer", fontSize: 13, fontWeight: 600,
    letterSpacing: "0.04em",
    transition: "opacity 0.15s",
  },
};