import fs from "fs";
import path from "path";
import { getCurrentlyPlaying } from "./spotify";
import { formatSpotifyTrack } from "./apiHelpers";

const HISTORY_PATH = path.join(
  process.cwd(),
  "src",
  "app",
  "components",
  "utils",
  "data",
  "trackHistory.json"
);

export async function saveCurrentlyPlaying(token: string) {
  try {
    const data = await getCurrentlyPlaying(token);
    if (!data) {
      console.log("⚠️ Nothing is playing right now.");
      return;
    }

    const formatted = formatSpotifyTrack(data);

    // Read current history
    let history: any[] = [];
    if (fs.existsSync(HISTORY_PATH)) {
      const content = fs.readFileSync(HISTORY_PATH, "utf-8");
      history = content ? JSON.parse(content) : [];
    }

    // Detect repeats or restarts
    const lastTrack = history[history.length - 1];
    const isSameSong = lastTrack?.spotify_track_uri === formatted.spotify_track_uri;
    const restarted = isSameSong && formatted.ms_played < (lastTrack.ms_played || 0);

    if (!isSameSong || restarted) {
      // Append new track
      history.push(formatted);

      fs.mkdirSync(path.dirname(HISTORY_PATH), { recursive: true });
      fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2), "utf-8");

      console.log(
        restarted
          ? `🔁 Track restarted: ${formatted.master_metadata_track_name}`
          : `✅ New track added: ${formatted.master_metadata_track_name}`
      );
    } else {
      console.log("🎵 Same track still playing — skipping save.");
    }
  } catch (error) {
    console.error("❌ Error saving track:", error);
  }
}
