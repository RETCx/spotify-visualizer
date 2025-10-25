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

    // Background: Multi-layered gradient for depth
    const gradient = ctx.createLinearGradient(0, 0, 0, 1920);
    gradient.addColorStop(0, dominantColor);
    gradient.addColorStop(0.4, accentColor);
    gradient.addColorStop(1, toRGBA(dominantColor, 0.8));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1920);

    // Add radial overlay for depth
    const radialOverlay = ctx.createRadialGradient(540, 600, 200, 540, 960, 1200);
    radialOverlay.addColorStop(0, toRGBA(accentColor, 0.3));
    radialOverlay.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radialOverlay;
    ctx.fillRect(0, 0, 1080, 1920);

    // Decorative circles for visual interest
    const drawDecorativeCircle = (x: number, y: number, radius: number, opacity: number) => {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.fill();
    };
    
    drawDecorativeCircle(150, 200, 80, 0.05);
    drawDecorativeCircle(900, 300, 120, 0.04);
    drawDecorativeCircle(200, 1700, 100, 0.06);
    drawDecorativeCircle(850, 1600, 90, 0.05);

    // Vignette effect
    const vignette = ctx.createRadialGradient(540, 960, 300, 540, 960, 1100);
    vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
    vignette.addColorStop(1, "rgba(0, 0, 0, 0.6)");
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
    const imgY = 280;

    // Glass morphism background for album art
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 60;
    ctx.shadowOffsetY = 20;
    const glassRadius = 50;
    ctx.beginPath();
    ctx.moveTo(imgX + glassRadius, imgY - 20);
    ctx.lineTo(imgX + imgSize - glassRadius, imgY - 20);
    ctx.quadraticCurveTo(imgX + imgSize, imgY - 20, imgX + imgSize, imgY - 20 + glassRadius);
    ctx.lineTo(imgX + imgSize, imgY + imgSize - glassRadius);
    ctx.quadraticCurveTo(imgX + imgSize, imgY + imgSize, imgX + imgSize - glassRadius, imgY + imgSize);
    ctx.lineTo(imgX + glassRadius, imgY + imgSize);
    ctx.quadraticCurveTo(imgX, imgY + imgSize, imgX, imgY + imgSize - glassRadius);
    ctx.lineTo(imgX, imgY - 20 + glassRadius);
    ctx.quadraticCurveTo(imgX, imgY - 20, imgX + glassRadius, imgY - 20);
    ctx.closePath();
    ctx.fill();
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Draw album art with rounded corners
    ctx.save();
    ctx.beginPath();
    const radius = 45;
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

    // Enhanced border with gradient
    ctx.save();
    ctx.beginPath();
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
    
    const borderGradient = ctx.createLinearGradient(imgX, imgY, imgX + imgSize, imgY + imgSize);
    borderGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
    borderGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
    borderGradient.addColorStop(1, 'rgba(255, 255, 255, 0.6)');
    ctx.strokeStyle = borderGradient;
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.restore();

    // Reset shadow for text
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;

    // Song name text with word wrap and shadow
    ctx.fillStyle = "white";
    ctx.font = "bold 64px Montserrat, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    // Add text shadow for better readability
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 25;
    ctx.shadowOffsetY = 5;
    
    const maxWidth = 950;
    const words = song.item.name.split(" ");
    let line = "";
    let textY = 1220;
    const lineHeight = 80;

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

    // Artist name with subtle glow
    ctx.font = "600 44px Montserrat, sans-serif";
    ctx.shadowBlur = 20;
    ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.fillText(song.item.artists.map((a) => a.name).join(", "), 540, textY + 65);

    // Album name
    ctx.font = "italic 36px Montserrat, sans-serif";
    ctx.shadowBlur = 15;
    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    ctx.fillText(song.item.album.name, 540, textY + 115);

    // Modern progress bar with glow
    const progressBarWidth = 850;
    const progressBarHeight = 6;
    const progressBarX = (1080 - progressBarWidth) / 2;
    const progressBarY = textY + 190;
    const progress = song.progress_ms / song.item.duration_ms;

    // Progress bar background
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
    ctx.beginPath();
    ctx.roundRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight, progressBarHeight / 2);
    ctx.fill();
    
    // Progress bar fill with glow
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 20;
    const progressFill = ctx.createLinearGradient(progressBarX, 0, progressBarX + progressBarWidth * progress, 0);
    progressFill.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    progressFill.addColorStop(1, 'rgba(255, 255, 255, 1)');
    ctx.fillStyle = progressFill;
    ctx.beginPath();
    ctx.roundRect(progressBarX, progressBarY, progressBarWidth * progress, progressBarHeight, progressBarHeight / 2);
    ctx.fill();
    
    // Progress indicator dot
    ctx.shadowBlur = 25;
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(progressBarX + progressBarWidth * progress, progressBarY + progressBarHeight / 2, 10, 0, Math.PI * 2);
    ctx.fill();

    // Time stamps
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.font = "32px Montserrat, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.textAlign = "left";
    const formatTime = (ms: number) => {
      const minutes = Math.floor(ms / 60000);
      const seconds = Math.floor((ms % 60000) / 1000);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };
    ctx.fillText(formatTime(song.progress_ms), progressBarX, progressBarY + 50);
    ctx.textAlign = "right";
    ctx.fillText(formatTime(song.item.duration_ms), progressBarX + progressBarWidth, progressBarY + 50);
    ctx.textAlign = "center";

    // Spotify logo and branding
    ctx.font = "bold 38px Montserrat, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
    ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
    ctx.shadowBlur = 15;
    
    // Draw Spotify icon (simplified)
    const spotifyIconX = 430;
    const spotifyIconY = 1775;
    const spotifyIconSize = 45;
    
    ctx.fillStyle = "#1DB954";
    ctx.beginPath();
    ctx.arc(spotifyIconX, spotifyIconY, spotifyIconSize / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Spotify arcs (simplified logo)
    ctx.strokeStyle = "rgba(0, 0, 0, 0.9)";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    
    ctx.beginPath();
    ctx.arc(spotifyIconX, spotifyIconY - 2, 15, 0.8, Math.PI - 0.8);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(spotifyIconX, spotifyIconY + 3, 12, 0.9, Math.PI - 0.9);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(spotifyIconX, spotifyIconY + 8, 9, 1, Math.PI - 1);
    ctx.stroke();
    
    // Text next to logo
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
    ctx.textAlign = "left";
    ctx.font = "600 36px Montserrat, sans-serif";
    ctx.fillText("Now Playing", spotifyIconX + 40, spotifyIconY + 5);

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