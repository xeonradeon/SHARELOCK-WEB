import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json(
      { detail: "Username tidak valid" },
      { status: 400 }
    );
  }

  // Simulate delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Mock response for AI Studio Preview.
  // When deployed to Vercel, this file should be deleted or Vercel Rewrites configured properly 
  // to prioritize api/index.py
  return NextResponse.json({
    username: username,
    total: 25,
    found: 4,
    not_found: 20,
    unknown: 1,
    time: "2.3s",
    results: [
      { site: "GitHub", url: `https://github.com/${username}`, status: "found" },
      { site: "Twitter", url: `https://twitter.com/${username}`, status: "found" },
      { site: "Instagram", url: `https://instagram.com/${username}`, status: "found" },
      { site: "Facebook", url: "", status: "not_found" },
      { site: "Reddit", url: `https://reddit.com/user/${username}`, status: "found" },
      { site: "TikTok", url: "", status: "not_found" },
      { site: "Pinterest", url: "", status: "not_found" },
      { site: "Snapchat", url: "", status: "not_found" },
      { site: "Twitch", url: "", status: "unknown" },
    ],
  });
}
