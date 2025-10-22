'use client';

import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Music, RefreshCw, LogOut, Play, Pause, SkipBack, SkipForward } from "lucide-react";
import DownloadStoryButton from '@/app/exportdemo/page';
import Login from './login/login';


// ----- Types for Spotify API -----
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
type SpotifyRecentlyPlayed = {
  items: { track: SpotifyTrack; played_at: string }[];
};

export default function Home() {
  const { data: session } = useSession();
  const [song, setSong] = useState<SpotifyCurrentlyPlaying | null>(null);
  const [recentlyPlayed, setRecentlyPlayed] = useState<SpotifyRecentlyPlayed | null>(null);
  const [loading, setLoading] = useState(false);
  const [dominantColor, setDominantColor] = useState('#8b5cf6');
  const [accentColor, setAccentColor] = useState('#ec4899');

  // ----- Format milliseconds to mm:ss -----
  const formatMsToMinutes = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // ----- Extract colors from album image -----
  const extractColors = (imageUrl: string) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; 
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

      let r = 0, g = 0, b = 0;
      const pixelCount = data.length / 4;

      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
      }

      r = Math.min(255, Math.floor((r / pixelCount) * 1.3));
      g = Math.min(255, Math.floor((g / pixelCount) * 1.3));
      b = Math.min(255, Math.floor((b / pixelCount) * 1.3));

      setDominantColor(`rgb(${r}, ${g}, ${b})`);
      setAccentColor(`rgb(${Math.min(255, Math.floor((255 - r) * 0.7 + r * 0.3))}, ${Math.min(255, Math.floor((255 - g) * 0.7 + g * 0.3))}, ${Math.min(255, Math.floor((255 - b) * 0.7 + b * 0.3))})`);
    };
  };

  // ----- Fetch currently playing song -----
  const getCurrentlyPlaying = async () => {
    if (!session?.accessToken) return;
    setLoading(true);

    try {
      const res = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });

      if (res.status === 204) {
        setSong(null);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        console.error("Failed to fetch currently playing song");
        setSong(null);
        setLoading(false);
        return;
      }

      const data: SpotifyCurrentlyPlaying = await res.json();
      setSong(data);
    } catch (error) {
      console.error(error);
      setSong(null);
    } finally {
      setLoading(false);
    }
  };

  // ----- Fetch recently played tracks -----
  const getRecentlyPlayed = async () => {
    if (!session?.accessToken) return;

    try {
      const res = await fetch("https://api.spotify.com/v1/me/player/recently-played?limit=10", {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });

      if (!res.ok) {
        console.error("Failed to fetch recently played tracks");
        setRecentlyPlayed(null);
        return;
      }

      const data: SpotifyRecentlyPlayed = await res.json();
      setRecentlyPlayed(data);
    } catch (error) {
      console.error(error);
      setRecentlyPlayed(null);
    }
  };

  // ----- Playback control functions -----
  const togglePlayPause = async () => {
    if (!session?.accessToken) return;

    try {
      await fetch("https://api.spotify.com/v1/me/player/" + (song?.is_playing ? "pause" : "play"), {
        method: "PUT",
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      getCurrentlyPlaying();
    } catch (error) {
      console.error("Failed to toggle play/pause", error);
    }
  };

  const skipToNext = async () => {
    if (!session?.accessToken) return;

    try {
      await fetch("https://api.spotify.com/v1/me/player/next", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      setTimeout(getCurrentlyPlaying, 1000); // Delay to allow Spotify to update
    } catch (error) {
      console.error("Failed to skip to next track", error);
    }
  };

  const skipToPrevious = async () => {
    if (!session?.accessToken) return;

    try {
      await fetch("https://api.spotify.com/v1/me/player/previous", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      setTimeout(getCurrentlyPlaying, 1000); // Delay to allow Spotify to update
    } catch (error) {
      console.error("Failed to skip to previous track", error);
    }
  };

  // ----- Update song progress every second -----
  useEffect(() => {
    if (!song?.is_playing) return;

    const interval = setInterval(() => {
      setSong(prev => prev ? { ...prev, progress_ms: prev.progress_ms + 1000 } : prev);
    }, 1000);

    return () => clearInterval(interval);
  }, [song]);

  // ----- Auto-refresh every 15s for new songs and recently played -----
  useEffect(() => {
    getCurrentlyPlaying();
    getRecentlyPlayed();
    const interval = setInterval(() => {
      getCurrentlyPlaying();
      getRecentlyPlayed();
    }, 15000);
    return () => clearInterval(interval);
  }, [session]);

  // ----- Extract colors whenever song image changes -----
  useEffect(() => {
    const imgUrl = song?.item?.album.images[0]?.url;
    if (imgUrl) extractColors(imgUrl);
  }, [song?.item?.album.images[0]?.url]);

  // ----- Login Screen -----
  if (!session) {
    return <Login />;
  }

  // ----- Logged-in Screen -----
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between bg-black/40 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-3">
            <Music className="w-8 h-8 text-green-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Spotify Predictor</h1>
              <p className="text-gray-400 text-sm">Welcome, {session.user?.name}</p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition-all duration-300 border border-red-500/30"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

{/* Now Playing */}
        <div
          className="backdrop-blur-lg rounded-3xl p-8 border border-white/10 shadow-2xl transition-all duration-1000"
          style={{ background: `linear-gradient(135deg, ${dominantColor}, ${accentColor})` }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Play className="w-6 h-6 text-green-400" />
              Now Playing
            </h2>
            <button
              onClick={getCurrentlyPlaying}
              disabled={loading}
              className="flex items-center gap-2 bg-green-500/20 hover:bg-green-500/30 disabled:bg-gray-500/20 text-green-400 disabled:text-gray-400 px-4 py-2 rounded-lg transition-all duration-300 border border-green-500/30 disabled:border-gray-500/30"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {song?.is_playing && song.item ? (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                {/* Album Art */}
                <div className="relative group flex-shrink-0">
                  <div
                    className="absolute inset-0 rounded-2xl blur-xl opacity-50 transition-all duration-1000"
                    style={{ background: `linear-gradient(135deg, ${dominantColor}, ${accentColor})` }}
                  ></div>
                  <img
                    src={song.item.album.images[0]?.url}
                    alt={song.item.album.name}
                    className="relative w-48 h-48 md:w-64 md:h-64 rounded-2xl shadow-2xl object-cover"
                  />
                </div>

                {/* Track Info */}
                <div className="flex-1 text-center md:text-left space-y-3 min-w-0">
                  <h3 className="text-3xl md:text-4xl font-bold text-white leading-tight break-words">
                    {song.item.name}
                  </h3>
                  <p className="text-xl text-gray-300">
                    {song.item.artists.map(a => a.name).join(", ")}
                  </p>
                  <p className="text-gray-400 text-sm">{song.item.album.name}</p>

                  {/* Playback Controls */}
                  <div className="flex justify-center md:justify-start gap-4 pt-4">
                    <button
                      onClick={skipToPrevious}
                      className="p-3 rounded-full bg-gray-800/50 hover:bg-gray-700/50 text-white transition-all duration-300 hover:scale-110"
                      title="Previous Track"
                    >
                      <SkipBack className="w-6 h-6" />
                    </button>
                    <button
                      onClick={togglePlayPause}
                      className="p-3 rounded-full bg-green-500/50 hover:bg-green-500/70 text-white transition-all duration-300 hover:scale-110"
                      title={song.is_playing ? "Pause" : "Play"}
                    >
                      {song.is_playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </button>
                    <button
                      onClick={skipToNext}
                      className="p-3 rounded-full bg-gray-800/50 hover:bg-gray-700/50 text-white transition-all duration-300 hover:scale-110"
                      title="Next Track"
                    >
                      <SkipForward className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="pt-4 space-y-2">
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>{formatMsToMinutes(song.progress_ms)}</span>
                      <span className="text-green-400 font-medium">● LIVE</span>
                      <span>{formatMsToMinutes(song.item.duration_ms)}</span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 ease-linear"
                        style={{
                          width: `${(song.progress_ms / song.item.duration_ms) * 100}%`,
                          background: `linear-gradient(to right, ${dominantColor}, ${accentColor})`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Download Button - Properly positioned below content */}
              <div className="flex justify-center md:justify-end pt-4 border-t border-white/10">
                <DownloadStoryButton 
                  song={song} 
                  dominantColor={dominantColor} 
                  accentColor={accentColor} 
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-12 space-y-4">
              <div className="w-24 h-24 mx-auto bg-gray-800/50 rounded-full flex items-center justify-center">
                <Music className="w-12 h-12 text-gray-600" />
              </div>
              <p className="text-gray-400 text-lg">No song is currently playing</p>
              <p className="text-gray-500 text-sm">Start playing music on Spotify to see it here</p>
            </div>
          )}
        </div>

        {/* Recently Played Tracks */}
        <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6">Recently Played</h2>
          {recentlyPlayed?.items?.length ? (
            <div className="space-y-4">
              {recentlyPlayed.items.map(({ track, played_at }, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-all duration-300"
                >
                  <img
                    src={track.album.images[2]?.url}
                    alt={track.album.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-white font-medium">{track.name}</p>
                    <p className="text-sm text-gray-400">{track.artists.map(a => a.name).join(", ")}</p>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(played_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center">No recently played tracks found</p>
          )}
        </div>
      </div>
    </main>
  );
}