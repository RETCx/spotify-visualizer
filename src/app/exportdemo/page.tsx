'use client';

import { Download } from 'lucide-react';

type SpotifyArtist = { name: string };
type SpotifyAlbum = { images: { url: string }[]; name: string };
type SpotifyTrack = {
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  duration_ms: number;
};
type SpotifyCurrentlyPlaying = {
  is_playing: boolean;
  progress_ms: number;
  item: SpotifyTrack | null;
};

interface DownloadStoryButtonProps {
  song: SpotifyCurrentlyPlaying | null;
  dominantColor: string;
  accentColor: string;
}

export default function DownloadStoryButton({
  song,
  dominantColor,
  accentColor,
}: DownloadStoryButtonProps) {
  const loadFont = async (fontName: string, fontUrl: string) => {
    const font = new FontFace(fontName, `url(${fontUrl})`);
    await font.load();
    document.fonts.add(font);
  };

  // Helper function to convert color to RGBA with specified alpha
  const toRGBA = (color: string, alpha: number): string => {
    // Handle hex color
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      const r = parseInt(hex.length === 3 ? hex[0] + hex[0] : hex.slice(0, 2), 16);
      const g = parseInt(hex.length === 3 ? hex[1] + hex[1] : hex.slice(2, 4), 16);
      const b = parseInt(hex.length === 3 ? hex[2] + hex[2] : hex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    // Handle rgb color
    if (color.startsWith('rgb(')) {
      const [r, g, b] = color.match(/\d+/g)!.map(Number);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    // Fallback to original color if parsing fails
    return color;
  };

  const downloadIGStory = async () => {
    if (!song?.item) {
      alert("No song is currently playing!");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      alert("Failed to create canvas context.");
      return;
    }

    // Load custom font (e.g., Montserrat)
    try {
      await loadFont(
        "Montserrat",
        "https://fonts.googleapis.com/css2?family=Montserrat:wght@700&display=swap"
      );
    } catch (error) {
      console.warn("Failed to load custom font, falling back to sans-serif.");
    }

    // Background: Radial gradient for modern look
    const gradient = ctx.createRadialGradient(540, 960, 0, 540, 960, 960);
    gradient.addColorStop(0, dominantColor);
    gradient.addColorStop(0.7, accentColor);
    gradient.addColorStop(1, toRGBA(accentColor, 0.6)); // Convert accentColor to RGBA with 60% opacity
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1920);

    // Vignette effect
    const vignette = ctx.createRadialGradient(540, 960, 400, 540, 960, 960);
    vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
    vignette.addColorStop(1, "rgba(0, 0, 0, 0.5)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, 1080, 1920);

    // Load and draw album art
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = song.item.album.images[0].url;

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to load album image."));
    }).catch((error) => {
      alert(error.message);
      return;
    });

    const imgSize = 800;
    const imgX = (1080 - imgSize) / 2;
    const imgY = 300;

    // Draw album art with rounded corners and glow
    ctx.save();
    ctx.beginPath();
    const radius = 40;
    ctx.moveTo(imgX + radius, imgY);
    ctx.lineTo(imgX + imgSize - radius, imgY);
    ctx.quadraticCurveTo(imgX + imgSize, imgY, imgX + imgSize, imgY + radius);
    ctx.lineTo(imgX + imgSize, imgY + imgSize - radius);
    ctx.quadraticCurveTo(imgX + imgSize, imgY + imgSize, imgX + imgSize - radius, imgY + imgSize);
    ctx.lineTo(imgX + radius, imgY + imgSize);
    ctx.quadraticCurveTo(imgX, imgY + imgSize, imgX, imgY + imgSize - radius);
    ctx.lineTo(imgX, imgY + radius);
    ctx.quadraticCurveTo(imgX, imgY, imgX + radius, imgY);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
    ctx.restore();

    // Add border and glow around album art
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 10;
    ctx.stroke();
    ctx.shadowColor = "rgba(255, 255, 255, 0.4)";
    ctx.shadowBlur = 30;
    ctx.stroke();

    // Reset shadow for text
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;

    // Song name text with word wrap
    ctx.fillStyle = "white";
    ctx.font = "bold 70px Montserrat, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const maxWidth = 950;
    const words = song.item.name.split(" ");
    let line = "";
    let textY = 1200;
    const lineHeight = 90;

    words.forEach((word, index) => {
      const testLine = line + word + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && index > 0) {
        ctx.fillText(line.trim(), 540, textY);
        line = word + " ";
        textY += lineHeight;
      } else {
        line = testLine;
      }
    });
    ctx.fillText(line.trim(), 540, textY);

    // Artist name
    ctx.font = "bold 50px Montserrat, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fillText(song.item.artists.map((a) => a.name).join(", "), 540, textY + 80);

    // Album name
    ctx.font = "italic 40px Montserrat, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.fillText(song.item.album.name, 540, textY + 140);

    // Progress bar
    const progressBarWidth = 800;
    const progressBarHeight = 10;
    const progressBarX = (1080 - progressBarWidth) / 2;
    const progressBarY = textY + 220;
    const progress = song.progress_ms / song.item.duration_ms;

    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.fillRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight);
    ctx.fillStyle = "white";
    ctx.fillRect(progressBarX, progressBarY, progressBarWidth * progress, progressBarHeight);

    // Spotify branding
    ctx.font = "bold 35px Montserrat, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.fillText("Now Playing on Spotify", 540, 1800);

    // Download image
    canvas.toBlob((blob) => {
      if (!blob) {
        alert("Failed to create image.");
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `spotify_story_${song.item!.name.replace(/[^a-z0-9]/gi, "_")}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, "image/png", 0.95);
  };

  if (!song?.is_playing || !song.item) return null;

  return (
    <button
      onClick={downloadIGStory}
      className="group relative flex items-center gap-3 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 bg-[length:200%_100%] hover:bg-right text-white font-bold px-8 py-4 rounded-2xl transition-all duration-500 hover:scale-105 shadow-2xl hover:shadow-pink-500/60 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      <Download className="w-6 h-6 relative z-10 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
      <span className="relative z-10 text-lg tracking-wide">Download IG Story</span>
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl bg-pink-400/50" />
    </button>
  );
}