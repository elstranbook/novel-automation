import { NextResponse } from "next/server";
import { dashscopeClient, isDashScopeConfigured, QWEN3_MODELS } from "@/lib/dashscopeClient";

export const dynamic = "force-dynamic";

/**
 * GET /api/test-dashscope
 * Diagnostic endpoint — tests DashScope API connectivity and model availability.
 * Visit in browser to see exactly which models work and what errors occur.
 */
export async function GET() {
  if (!isDashScopeConfigured()) {
    return NextResponse.json({
      error: "DASHSCOPE_API_KEY is not set",
      help: "Add it in Vercel → Settings → Environment Variables",
    });
  }

  const modelsToTest = [
    { id: QWEN3_MODELS.QWEN3_235B_INSTRUCT, label: "Prose (instruct)" },
    { id: QWEN3_MODELS.QWEN3_235B_THINKING, label: "Planning (thinking)" },
    { id: QWEN3_MODELS.QWEN3_14B, label: "Marketing (14b)" },
    { id: "qwen3-235b-a22b-instruct", label: "Alt: instruct (no suffix)" },
    { id: "qwen3-235b-a22b", label: "Alt: base" },
    { id: "qwen-plus", label: "Alt: qwen-plus alias" },
  ];

  const results: Record<string, unknown> = {};

  for (const model of modelsToTest) {
    try {
      const start = Date.now();
      const response = await dashscopeClient.chat.completions.create({
        model: model.id,
        messages: [
          { role: "user", content: "Say hello in 5 words." },
        ],
        max_completion_tokens: 50,
      });
      const elapsed = Date.now() - start;
      const content = response.choices[0]?.message?.content ?? "(empty)";

      results[model.id] = {
        status: "✅ WORKS",
        label: model.label,
        elapsed_ms: elapsed,
        response: content.substring(0, 200),
        has_think_tags: content.includes("<think"),
      };
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string; error?: unknown };
      results[model.id] = {
        status: "❌ FAILED",
        label: model.label,
        httpStatus: err.status ?? "unknown",
        error: err.message ?? String(error),
      };
    }
  }

  return NextResponse.json({
    endpoint: process.env.DASHSCOPE_BASE_URL ?? "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
    results,
  }, { status: 200 });
}
