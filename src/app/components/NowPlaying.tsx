'use client';
import { useState, useEffect } from "react";
import { RefreshCw, Music } from "lucide-react";
import { getCurrentlyPlaying } from "@/app/components/utils/spotify";
import { extractColors } from "@/app/components/utils/colorUtils";
import PlaybackControls from "./PlaybackControls";
import DownloadStoryButton from "./DownloadStoryButton";

export default function NowPlaying({ accessToken }: { accessToken: string }) {
  const [song, setSong] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [dominantColor, setDominantColor] = useState('#8b5cf6');
  const [accentColor, setAccentColor] = useState('#ec4899');

  const fetchNowPlaying = async () => {
    setLoading(true);
    const data = await getCurrentlyPlaying(accessToken);
    setSong(data);
    if (data?.item?.album?.images?.[0]?.url) {
      extractColors(data.item.album.images[0].url, setDominantColor, setAccentColor);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, 8000);
    return () => clearInterval(interval);
  }, []);

  if (!song?.is_playing || !song.item) {
    return (
      <div className="text-center py-12 bg-black/40 rounded-3xl border border-white/10">
        <div className="w-24 h-24 mx-auto bg-gray-800/50 rounded-full flex items-center justify-center">
          <Music className="w-12 h-12 text-gray-600" />
        </div>
        <p className="text-gray-400 text-lg">No song is currently playing</p>
      </div>
    );
  }

  return (
    <div
      className="p-8 rounded-3xl border border-white/10"
      style={{ background: `linear-gradient(135deg, ${dominantColor}, ${accentColor})` }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl text-white font-bold">Now Playing</h2>
        <button
          onClick={fetchNowPlaying}
          disabled={loading}
          className="flex items-center gap-2 text-green-400 bg-green-500/20 px-3 py-2 rounded-lg"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <img
          src={song.item.album.images[0].url}
          className="w-48 h-48 rounded-xl object-cover"
          alt="Album cover"
        />
        <div className="flex-1 text-white">
          <h3 className="text-3xl font-bold">{song.item.name}</h3>
          <p className="text-lg text-gray-200">{song.item.artists.map((a:{name:string}) => a.name).join(", ")}</p>
          <PlaybackControls accessToken={accessToken} song={song} refresh={fetchNowPlaying} />
          <DownloadStoryButton song={song} dominantColor={dominantColor} accentColor={accentColor} />
        </div>
      </div>
    </div>
  );
}
