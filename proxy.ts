import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  // Use fetch to hit the session endpoint provided by better-auth
  const response = await fetch(new URL("/api/auth/get-session", request.url), {
    headers: {
      cookie: request.headers.get("cookie") || "",
    },
  });

  const session = await response.json();

  if (!session) {
    const url = new URL("/sign-in", request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/transcribe/:path*",
    "/history/:path*",
    "/summarization/:path*",
    "/post-meeting/:path*",
    "/search/:path*",
    "/live-transcription/:path*"
  ],
};
