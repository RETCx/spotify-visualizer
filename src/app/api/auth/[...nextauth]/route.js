// app/api/auth/[...nextauth]/route.js (or pages/api/auth/[...nextauth].js)

import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";

// The scope we need to read the currently playing song
const scopes = [
  "user-read-email",
  "user-read-currently-playing",
  "user-read-recently-played",
  "user-modify-playback-state"
].join(",");

const handler = NextAuth({
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      // Request the correct permissions from the user
      authorization: `https://accounts.spotify.com/authorize?scope=${scopes}`,
    }),
  ],
  // These callbacks are crucial for getting the access token
  callbacks: {
    async jwt({ token, account }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token from the JWT
      session.accessToken = token.accessToken;
      return session;
    },
  },
});

export { handler as GET, handler as POST };