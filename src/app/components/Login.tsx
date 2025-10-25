"use client";

import { signIn } from "next-auth/react"
import { Music } from "lucide-react";

interface LoginPageProps {
  searchParams?: { [key: string]: string | string[] };
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  // safely get error from searchParams
  const error = searchParams?.error as string | undefined;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-900 via-black to-green-900">
      <Music className="w-16 h-16 text-green-400 mx-auto" />
      <h1 className="text-5xl md:text-6xl font-bold text-white mt-4">Spotify Predictor</h1>

      {error && (
        <div className="mt-4 p-3 bg-red-500 text-white rounded-md text-center">
          <p>Login failed. Please try again.</p>
        </div>
      )}

      <p className="text-gray-300 text-lg mt-2 max-w-md text-center">
        Connect your Spotify account to continue.
      </p>

      <button
        onClick={() => signIn("spotify", { callbackUrl: "/" })}
        className="mt-6 bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-4 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/50"
      >
        Login with Spotify
      </button>
    </main>
  );
}
