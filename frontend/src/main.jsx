import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// Global styles
const style = document.createElement("style");
style.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Inter:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html { font-size: 16px; }

  body {
    font-family: 'Inter', sans-serif;
    background: #050510;
    color: #e0f8ff;
    -webkit-font-smoothing: antialiased;
    min-height: 100vh;
  }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #080818; }
  ::-webkit-scrollbar-thumb { background: rgba(0,188,212,0.3); border-radius: 3px; }

  /* Hover effects on track cards */
  [data-card]:hover { border-color: rgba(0,188,212,0.35) !important; transform: translateY(-2px); }
  [data-card]:hover [data-overlay] { opacity: 1 !important; }

  /* Input focus ring */
  input:focus { border-color: rgba(0,188,212,0.5) !important; box-shadow: 0 0 0 3px rgba(0,188,212,0.1); }

  /* Button hover brightness */
  button:not(:disabled):hover { filter: brightness(1.15); }
  button:disabled { opacity: 0.5; cursor: not-allowed !important; }
`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);