import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Player from "./components/Player";
import PlaylistPanel from "./components/PlaylistPanel";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import usePlayerStore from "./store/playerStore";

const AUTH_PATHS = ["/login", "/register"];

function AppLayout() {
  const { currentTrack } = usePlayerStore();
  const { pathname } = useLocation();
  const isAuthPage = AUTH_PATHS.includes(pathname);

  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>

      {/* Hide playlist button and player on login/register pages */}
      {!isAuthPage && <PlaylistPanel />}
      {!isAuthPage && currentTrack && <Player />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}