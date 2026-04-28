import { Link, useNavigate } from "react-router-dom";
import { Music, LogOut, User } from "lucide-react";
import useAuthStore from "../store/authStore";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>
        <Music size={20} style={{ color: "#00bcd4" }} />
        <span>Soundwave</span>
      </Link>

      <div style={styles.right}>
        {user ? (
          <>
            <div style={styles.userChip}>
              <User size={14} />
              <span>{user.username}</span>
            </div>
            <button onClick={handleLogout} style={styles.logoutBtn} title="Logout">
              <LogOut size={16} />
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.primaryLink}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 28px",
    background: "rgba(5,5,16,0.95)",
    borderBottom: "1px solid rgba(0,188,212,0.15)",
    position: "sticky", top: 0, zIndex: 50,
    backdropFilter: "blur(12px)",
  },
  logo: {
    display: "flex", alignItems: "center", gap: 8,
    color: "#b0e8f0", textDecoration: "none",
    fontSize: 18, fontWeight: 700,
    letterSpacing: "-0.02em",
    fontFamily: "'Space Mono', monospace",
  },
  right: { display: "flex", alignItems: "center", gap: 12 },
  userChip: {
    display: "flex", alignItems: "center", gap: 6,
    color: "#6ec8d8", fontSize: 13,
    background: "rgba(0,188,212,0.1)",
    padding: "4px 10px", borderRadius: 20,
    border: "1px solid rgba(0,188,212,0.2)",
  },
  logoutBtn: {
    background: "none", border: "none",
    color: "#5ba8b8", cursor: "pointer",
    padding: 6, display: "flex",
    borderRadius: 6,
  },
  link: { color: "#6ec8d8", textDecoration: "none", fontSize: 14 },
  primaryLink: {
    color: "#fff", textDecoration: "none", fontSize: 14,
    background: "linear-gradient(135deg,#006978,#00bcd4)",
    padding: "6px 14px", borderRadius: 8,
    fontWeight: 600,
  },
};