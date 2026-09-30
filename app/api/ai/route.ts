import { NextResponse } from "next/server";
import { askAi, isAiConfigured } from "@/lib/integrations/ai";
import { getCurrentUser } from "@/lib/auth/session";

/**
 * POST /api/ai — { prompt: string }
 * Auth: any signed-in user (demo cookie or Supabase session).
 * Returns 501 with setup instructions until AI_API_KEY is set.
 */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAiConfigured()) {
    return NextResponse.json(
      {
        error: "AI is not configured.",
        hint: "Set AI_API_KEY in .env.local (see HACKATHON.md → Connect AI).",
      },
      { status: 501 },
    );
  }

  let prompt: string | undefined;
  try {
    const body = (await request.json()) as { prompt?: string };
    prompt = body.prompt?.trim();
  } catch {
    return NextResponse.json(
      { error: "Body must be JSON with a prompt field." },
      { status: 400 },
    );
  }

  if (!prompt) {
    return NextResponse.json(
      { error: "prompt is required." },
      { status: 400 },
    );
  }

  try {
    const result = await askAi(prompt);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "AI request failed.",
      },
      { status: 502 },
    );
  }
}
