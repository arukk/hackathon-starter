/**
 * AI integration — works TODAY with any OpenAI-compatible endpoint.
 *
 * Configure in .env.local:
 *   AI_API_KEY=sk-...            # required (OpenAI, Groq, OpenRouter, Together, Ollama…)
 *   AI_BASE_URL=https://api.openai.com/v1   # optional, defaults to OpenAI
 *   AI_MODEL=gpt-4o-mini         # optional
 *
 * Used by the POST /api/ai route; call askAi() from server code anywhere.
 */

import { getIntegrationStatus } from "@/lib/integrations/status";

export function isAiConfigured(): boolean {
  return getIntegrationStatus().ai.configured;
}

export interface AskAiOptions {
  /** Overrides AI_MODEL env var for this call. */
  model?: string;
  system?: string;
  temperature?: number;
}

export interface AskAiResult {
  text: string;
  model: string;
}

interface ChatCompletionResponse {
  choices?: { message?: { content?: string } }[];
  error?: { message?: string };
}

export async function askAi(
  prompt: string,
  options: AskAiOptions = {},
): Promise<AskAiResult> {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "AI_API_KEY is not set. Add it to .env.local (see HACKATHON.md → Connect AI).",
    );
  }

  const baseUrl = (
    process.env.AI_BASE_URL ?? "https://api.openai.com/v1"
  ).replace(/\/+$/, "");
  const model = options.model ?? process.env.AI_MODEL ?? "gpt-4o-mini";

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: options.temperature ?? 0.7,
      messages: [
        ...(options.system ? [{ role: "system", content: options.system }] : []),
        { role: "user", content: prompt },
      ],
    }),
  });

  const data = (await res.json().catch(() => ({}))) as ChatCompletionResponse;
  if (!res.ok) {
    throw new Error(
      data.error?.message ?? `AI request failed with status ${res.status}`,
    );
  }

  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("AI response contained no content.");

  return { text, model };
}
