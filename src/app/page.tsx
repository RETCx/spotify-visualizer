'use client';

import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Music, RefreshCw, LogOut, Play } from "lucide-react";

// ----- Types for Spotify API -----
type SpotifyArtist = {
  name: string;
};

type SpotifyAlbum = {
  images: { url: string }[];
  name: string;
};

type SpotifyTrack = {
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  duration_ms: number; // add this
};


type SpotifyCurrentlyPlaying = {
  is_playing: boolean;
  progress_ms: number;
  item: SpotifyTrack | null;
};

export default function Home() {
  const { data: session } = useSession();
  const [song, setSong] = useState<SpotifyCurrentlyPlaying | null>(null);
  const [loading, setLoading] = useState(false);

  const formatMsToMinutes = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // ----- Fetch currently playing song -----
  const getCurrentlyPlaying = async () => {
    if (!session?.accessToken) return;
    setLoading(true);

    try {
      const res = await fetch(
        "https://api.spotify.com/v1/me/player/currently-playing",
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

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

  useEffect(() => {
    getCurrentlyPlaying();
  }, [session]);

  useEffect(() => {
    if (!song || !song.is_playing) return;

    const interval = setInterval(() => {
      setSong(prev => prev ? { ...prev, progress_ms: prev.progress_ms + 1000 } : prev);
    }, 1000);

    return () => clearInterval(interval);
  }, [song]);

  // ----- Login Screen -----
  if (!session) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-green-900 flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-8 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Music className="w-16 h-16 text-green-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-2">
            Spotify Predictor
          </h1>
          <p className="text-gray-300 text-lg max-w-md mx-auto">
            Connect your Spotify account to see what you're listening to in real-time
          </p>
          <button
            onClick={() => signIn("spotify")}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-4 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/50"
          >
            Login with Spotify
          </button>
        </div>
      </main>
    );
  }

  // ----- Logged-in Screen -----
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
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

        {/* Now Playing Card */}
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-lg rounded-3xl p-8 border border-white/10 shadow-2xl">
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

          {loading && !song ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
              <p className="text-gray-400 mt-4">Loading...</p>
            </div>
          ) : song?.is_playing && song.item ? (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                {/* Album Art */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-purple-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                  <img
                    src={song.item.album.images[0]?.url}
                    alt={song.item.album.name}
                    className="relative w-48 h-48 md:w-64 md:h-64 rounded-2xl shadow-2xl object-cover"
                  />
                </div>

                {/* Track Info */}
                <div className="flex-1 text-center md:text-left space-y-3">
                  <h3 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                    {song.item.name}
                  </h3>
                  <p className="text-xl text-gray-300">
                    {song.item.artists.map((artist: SpotifyArtist) => artist.name).join(", ")}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {song.item.album.name}
                  </p>
                  
                  {/* Progress Indicator */}
                  <div className="pt-4 space-y-2">
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>{formatMsToMinutes(song.progress_ms)}</span>
                      <span className="text-green-400 font-medium">● LIVE</span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-400 to-green-500 h-full rounded-full transition-all duration-500 ease-linear"
                        style={{ width: `${(song.progress_ms / song.item?.duration_ms!) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
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
      </div>
    </main>
  );
}