'use client';

import { useSession, signOut } from "next-auth/react";
import { LogOut, Music } from "lucide-react";
import WeatherWidget from "@/app/components/WeatherWidget";
import NowPlaying from "@/app/components/NowPlaying";
import RecentlyPlayed from "@/app/components/RecentlyPlayed";
import Login from "@/app/components/Login";
import { useEffect } from "react";

export default function Home() {
  const { data: session } = useSession();

  // Poll the server to save currently playing track
  useEffect(() => {
    if (!session?.accessToken) return;

    const interval = setInterval(async () => {
      try {
        await fetch("/api/track");
      } catch (err) {
        console.error("Error saving currently playing track:", err);
      }
    }, 30000); // every 30 seconds

    return () => clearInterval(interval);
  }, [session?.accessToken]);

  if (!session) return <Login />;

  return (
    <main className="min-h-screen p-8 bg-gray-900">
      <div className="max-w-4xl mx-auto space-y-6">
        <Header name={session.user?.name || "Guest"} onLogout={() => signOut()} />

        {/* Weather */}
        <WeatherWidget location="Tokyo" latitude={35.6762} longitude={139.6503} />

        {/* Spotify sections */}
        {session.accessToken && (
          <>
            <NowPlaying accessToken={session.accessToken} />
            <RecentlyPlayed accessToken={session.accessToken} />
          </>
        )}
      </div>
    </main>
  );
}

function Header({ name, onLogout }: { name: string; onLogout: () => void }) {
  return (
    <div className="flex items-center justify-between bg-black/40 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
      <div className="flex items-center gap-3">
        <Music className="w-8 h-8 text-green-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">Spotify Predictor</h1>
          <p className="text-gray-400 text-sm">Welcome, {name}</p>
        </div>
      </div>
      <button
        onClick={onLogout}
        className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg border border-red-500/30"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </button>
    </div>
  );
}
