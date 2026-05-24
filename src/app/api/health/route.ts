import { NextResponse } from "next/server";
import { isDashScopeConfigured } from "@/lib/dashscopeClient";

export async function GET() {
  const dashscopeKey = process.env.DASHSCOPE_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const dashscopeBaseUrl = process.env.DASHSCOPE_BASE_URL ?? "https://dashscope-intl.aliyuncs.com/compatible-mode/v1";

  return NextResponse.json({
    status: "ok",
    config: {
      DASHSCOPE_API_KEY: dashscopeKey
        ? `✅ Set (${dashscopeKey.slice(0, 8)}...)`
        : "❌ NOT SET — Add DASHSCOPE_API_KEY in Vercel → Settings → Environment Variables",
      DASHSCOPE_BASE_URL: dashscopeBaseUrl,
      OPENAI_API_KEY: openaiKey
        ? `✅ Set (${openaiKey.slice(0, 8)}...)`
        : "⚠️ Not set (optional — Qwen3 models use DashScope)",
      isDashScopeConfigured: isDashScopeConfigured(),
    },
    help: !dashscopeKey
      ? "Get your DashScope API key from https://dashscope.console.aliyun.com/ then add it to Vercel environment variables."
      : undefined,
  });
}
