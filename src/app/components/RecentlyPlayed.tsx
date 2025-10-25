'use client';
import { useState, useEffect } from "react";
import { getRecentlyPlayed } from "@/app/components/utils/spotify";

export default function RecentlyPlayed({ accessToken }: { accessToken: string }) {
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    getRecentlyPlayed(accessToken).then(setRecent);
  }, []);

  return (
    <div className="bg-black/40 rounded-2xl p-6 border border-white/10">
      <h2 className="text-2xl text-white font-bold mb-4">Recently Played</h2>
      {recent.length ? recent.map(({ track, played_at }, i) => (
        <div key={i} className="flex items-center gap-4 mb-3 bg-gray-800/30 rounded-lg p-3">
          <img src={track.album.images[2]?.url} className="w-12 h-12 rounded-lg" />
          <div className="flex-1">
            <p className="text-white">{track.name}</p>
            <p className="text-sm text-gray-400">{track.artists.map((a:{name:string}) => a.name).join(", ")}</p>
          </div>
          <p className="text-gray-500 text-sm">
            {new Date(played_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      )) : (
        <p className="text-gray-400">No recent tracks</p>
      )}
    </div>
  );
}
