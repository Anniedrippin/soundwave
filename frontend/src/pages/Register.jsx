import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Music } from "lucide-react";
import useAuthStore from "../store/authStore";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [localError, setLocalError] = useState("");
  const { register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    clearError();
    setLocalError("");
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setLocalError("Passwords do not match");
      return;
    }
    if (form.password.length < 8) {
      setLocalError("Password must be at least 8 characters");
      return;
    }
    const ok = await register(form.username, form.email, form.password);
    if (ok) navigate("/login");
  };

  const displayError = localError || error;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <Music size={28} style={{ color: "#00bcd4" }} />
          <span style={styles.logoText}>Soundwave</span>
        </div>

        <h2 style={styles.title}>Create account</h2>
        <p style={styles.sub}>Start your music journey</p>

        {displayError && <div style={styles.error}>{displayError}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {[
            { name: "username", label: "Username", type: "text", placeholder: "cooluser42" },
            { name: "email", label: "Email", type: "email", placeholder: "you@example.com" },
            { name: "password", label: "Password", type: "password", placeholder: "Min 8 characters" },
            { name: "confirm", label: "Confirm Password", type: "password", placeholder: "Repeat password" },
          ].map(({ name, label, type, placeholder }) => (
            <div key={name} style={styles.field}>
              <label style={styles.label}>{label}</label>
              <input
                name={name} type={type}
                value={form[name]} onChange={handleChange}
                required placeholder={placeholder}
                style={styles.input}
                autoComplete={name === "confirm" ? "new-password" : undefined}
              />
            </div>
          ))}

          <button type="submit" disabled={isLoading} style={styles.submitBtn}>
            {isLoading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{" "}
          <Link to="/login" style={styles.footerLink}>Sign in</Link>
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
  form: { display: "flex", flexDirection: "column", gap: 14 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { color: "#6ec8d8", fontSize: 13, fontWeight: 500 },
  input: {
    background: "rgba(0,188,212,0.06)",
    border: "1px solid rgba(0,188,212,0.2)",
    borderRadius: 8, color: "#e0f8ff",
    padding: "10px 12px", fontSize: 14,
    outline: "none", width: "100%", boxSizing: "border-box",
    fontFamily: "inherit",
  },
  submitBtn: {
    background: "linear-gradient(135deg,#006978,#00bcd4)",
    border: "none", color: "#fff",
    padding: "12px", borderRadius: 8,
    fontSize: 15, fontWeight: 600,
    cursor: "pointer", marginTop: 4,
  },
  footer: { color: "#3a6878", fontSize: 13, textAlign: "center", marginTop: 20 },
  footerLink: { color: "#00bcd4", textDecoration: "none", fontWeight: 500 },
};