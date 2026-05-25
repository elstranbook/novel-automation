import { NextResponse } from "next/server";
import { isOpenRouterConfigured } from "@/lib/dashscopeClient";

export async function GET() {
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const dashscopeKey = process.env.DASHSCOPE_API_KEY;

  return NextResponse.json({
    status: "ok",
    config: {
      OPENROUTER_API_KEY: openrouterKey
        ? `✅ Set (${openrouterKey.slice(0, 8)}...)`
        : "❌ NOT SET — Add OPENROUTER_API_KEY in Vercel → Settings → Environment Variables",
      OPENAI_API_KEY: openaiKey
        ? `✅ Set (${openaiKey.slice(0, 8)}...)`
        : "⚠️ Not set (optional — Qwen3 models use OpenRouter)",
      DASHSCOPE_API_KEY: dashscopeKey
        ? `⚠️ Set but not used anymore (switched to OpenRouter)`
        : "Not set (OK — using OpenRouter instead)",
      isOpenRouterConfigured: isOpenRouterConfigured(),
    },
    help: !openrouterKey
      ? "Get your OpenRouter API key from https://openrouter.ai/keys then add it to Vercel environment variables."
      : undefined,
  });
}
