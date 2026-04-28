import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Music, Eye, EyeOff } from "lucide-react";
import useAuthStore from "../store/authStore";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    clearError();
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await login(form.username, form.password);
    if (ok) navigate("/");
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <Music size={28} style={{ color: "#00bcd4" }} />
          <span style={styles.logoText}>Soundwave</span>
        </div>

        <h2 style={styles.title}>Welcome back</h2>
        <p style={styles.sub}>Sign in to your account</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Username</label>
            <input
              name="username" type="text"
              value={form.username} onChange={handleChange}
              required autoFocus
              style={styles.input}
              placeholder="your_username"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <div style={styles.pwWrapper}>
              <input
                name="password"
                type={showPw ? "text" : "password"}
                value={form.password} onChange={handleChange}
                required
                style={{ ...styles.input, paddingRight: 40 }}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                style={styles.eyeBtn}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={isLoading} style={styles.submitBtn}>
            {isLoading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account?{" "}
          <Link to="/register" style={styles.footerLink}>Register</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
    background: "#050510",
    backgroundImage: "radial-gradient(ellipse at 50% 20%, rgba(0,188,212,0.1) 0%, transparent 60%)",
    padding: 24,
  },
  card: {
    width: "100%", maxWidth: 380,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(0,188,212,0.2)",
    borderRadius: 16, padding: "36px 32px",
    boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
  },
  logo: { display: "flex", alignItems: "center", gap: 8, marginBottom: 24 },
  logoText: { color: "#b0e8f0", fontSize: 20, fontWeight: 700, fontFamily: "'Space Mono', monospace" },
  title: { color: "#e0f8ff", fontSize: 22, fontWeight: 700, margin: "0 0 4px" },
  sub: { color: "#4a8899", fontSize: 14, marginBottom: 24 },
  error: {
    background: "rgba(229,57,53,0.1)", border: "1px solid rgba(229,57,53,0.3)",
    color: "#ef9a9a", borderRadius: 8, padding: "10px 12px",
    fontSize: 13, marginBottom: 16,
  },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { color: "#6ec8d8", fontSize: 13, fontWeight: 500 },
  input: {
    background: "rgba(0,188,212,0.06)",
    border: "1px solid rgba(0,188,212,0.2)",
    borderRadius: 8, color: "#e0f8ff",
    padding: "10px 12px", fontSize: 14,
    outline: "none", width: "100%", boxSizing: "border-box",
    transition: "border-color 0.2s",
    fontFamily: "inherit",
  },
  pwWrapper: { position: "relative" },
  eyeBtn: {
    position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
    background: "none", border: "none", color: "#4a8899",
    cursor: "pointer", display: "flex", padding: 4,
  },
  submitBtn: {
    background: "linear-gradient(135deg,#006978,#00bcd4)",
    border: "none", color: "#fff",
    padding: "12px", borderRadius: 8,
    fontSize: 15, fontWeight: 600,
    cursor: "pointer", marginTop: 4,
    transition: "opacity 0.15s",
    letterSpacing: "0.02em",
  },
  footer: { color: "#3a6878", fontSize: 13, textAlign: "center", marginTop: 20 },
  footerLink: { color: "#00bcd4", textDecoration: "none", fontWeight: 500 },
};