// src/app/api/track/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { saveCurrentlyPlaying } from "@/app/components/utils/saveCurrentlyPlaying";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  await saveCurrentlyPlaying(session.accessToken);
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
