import { useEffect, useRef } from "react";

/**
 * Visualizer — renders a Windows Media Player-style bar/wave animation.
 * Connects to the <audio> element via Web Audio API's AnalyserNode.
 */
export default function Visualizer({ audioRef, isPlaying }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const audioCtxRef = useRef(null);

  // Wire up AudioContext whenever the audio element is ready
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setup = () => {
      if (audioCtxRef.current) return; // already set up
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;

      const source = ctx.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(ctx.destination);

      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      sourceRef.current = source;
    };

    audio.addEventListener("play", setup, { once: true });
    return () => audio.removeEventListener("play", setup);
  }, [audioRef]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      const analyser = analyserRef.current;
      const W = canvas.width;
      const H = canvas.height;

      ctx.clearRect(0, 0, W, H);

      if (!analyser || !isPlaying) {
        // Draw idle flat line
        drawIdle(ctx, W, H);
        return;
      }

      const bufferLength = analyser.frequencyBinCount; // 128
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      drawBars(ctx, dataArray, bufferLength, W, H);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={120}
      style={{
        width: "100%",
        height: "120px",
        borderRadius: "8px",
        background: "#000",
        display: "block",
      }}
    />
  );
}

// ── Drawing helpers ────────────────────────────────────────────────────────────

function drawBars(ctx, dataArray, bufferLength, W, H) {
  const barCount = 64; // use first 64 bins for cleaner look
  const barWidth = (W / barCount) * 0.8;
  const gap = (W / barCount) * 0.2;

  for (let i = 0; i < barCount; i++) {
    const value = dataArray[i] / 255; // 0–1
    const barH = value * H;
    const x = i * (barWidth + gap);
    const y = H - barH;

    // WMP-style color gradient: teal → cyan → white at peaks
    const r = Math.floor(0 + value * 80);
    const g = Math.floor(200 + value * 55);
    const b = Math.floor(200 + value * 55);

    // Gradient fill per bar
    const grad = ctx.createLinearGradient(x, y, x, H);
    grad.addColorStop(0, `rgb(${r}, ${g}, ${b})`);
    grad.addColorStop(0.5, `rgb(0, 180, 200)`);
    grad.addColorStop(1, `rgb(0, 80, 100)`);

    ctx.fillStyle = grad;
    ctx.fillRect(x, y, barWidth, barH);

    // Peak dot
    ctx.fillStyle = `rgba(255,255,255,0.9)`;
    ctx.fillRect(x, y, barWidth, 2);
  }
}

function drawIdle(ctx, W, H) {
  // Gentle sine wave when paused
  const time = Date.now() / 1000;
  ctx.beginPath();
  ctx.strokeStyle = "rgba(0,180,200,0.4)";
  ctx.lineWidth = 2;
  for (let x = 0; x < W; x++) {
    const y = H / 2 + Math.sin((x / W) * Math.PI * 6 + time) * 6;
    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();
}