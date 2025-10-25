export async function getCurrentlyPlaying(token: string) {
  const res = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 204) return null;

  const data = await res.json();

  console.log("Currently Playing Data:", data);

  return res.ok ? data : null;
}

export async function getRecentlyPlayed(token: string) {
  const res = await fetch("https://api.spotify.com/v1/me/player/recently-played?limit=10", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.items || [];
}


