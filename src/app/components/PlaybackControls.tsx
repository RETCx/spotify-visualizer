'use client';
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";

export default function PlaybackControls({ accessToken, song, refresh }: any) {
  const control = async (action: string) => {
    await fetch(`https://api.spotify.com/v1/me/player/${action}`, {
      method: action === "play" || action === "pause" ? "PUT" : "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    setTimeout(refresh, 1000);
  };

  return (
    <div className="flex gap-4 mt-4">
      <button onClick={() => control("previous")} className="btn-control"><SkipBack /></button>
      <button onClick={() => control(song.is_playing ? "pause" : "play")} className="btn-control">
        {song.is_playing ? <Pause /> : <Play />}
      </button>
      <button onClick={() => control("next")} className="btn-control"><SkipForward /></button>
    </div>
  );
}
