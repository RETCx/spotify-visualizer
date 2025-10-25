export function formatSpotifyTrack(data: any) {
  const track = data.item;
  return {
    ts: new Date(data.timestamp).toISOString(),
    platform: data.device?.type.toLowerCase() || "unknown",
    ms_played: data.progress_ms,
    conn_country: "TH",
    ip_addr: "171.99.160.215",
    master_metadata_track_name: track?.name || null,
    master_metadata_album_artist_name: track?.artists?.map((a: any) => a.name).join(", ") || null,
    master_metadata_album_album_name: track?.album?.name || null,
    spotify_track_uri: track?.uri || null,
    episode_name: null,
    episode_show_name: null,
    spotify_episode_uri: null,
    reason_start: "trackdone",
    reason_end: "trackdone",
    shuffle: data.shuffle_state,
    skipped: false,
    offline: false,
    offline_timestamp: 1730059784,
    incognito_mode: false
  };
}
