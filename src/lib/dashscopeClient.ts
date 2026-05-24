import OpenAI from "openai";

/**
 * DashScope (Alibaba Cloud Model Studio) client for Qwen3 models.
 *
 * Uses the OpenAI-compatible interface — same SDK, just different base_url and API key.
 * Docs: https://www.alibabacloud.com/help/en/model-studio/compatibility-of-openai-with-dashscope
 *
 * Region endpoints:
 *   International (Singapore): https://dashscope-intl.aliyuncs.com/compatible-mode/v1
 *   US (Virginia):             https://dashscope-us.aliyuncs.com/compatible-mode/v1
 *   China (Beijing):           https://dashscope.aliyuncs.com/compatible-mode/v1
 *   Hong Kong:                 https://cn-hongkong.dashscope.aliyuncs.com/compatible-mode/v1
 */

const DASHSCOPE_BASE_URL =
  process.env.DASHSCOPE_BASE_URL ??
  "https://dashscope-intl.aliyuncs.com/compatible-mode/v1";

const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY ?? "";

/** Check if DashScope API key is configured */
export const isDashScopeConfigured = (): boolean => DASHSCOPE_API_KEY.length > 0;

/** Available Qwen3 creative-writing models on DashScope */
export const QWEN3_MODELS = {
  /** Best for creative writing — superior human preference alignment */
  QWEN3_235B_INSTRUCT: "qwen3-235b-a22b-instruct-2507",
  /** Thinking/reasoning mode — for complex narrative planning */
  QWEN3_235B_THINKING: "qwen3-235b-a22b-thinking-2507",
  /** Base model — general purpose */
  QWEN3_235B_BASE: "qwen3-235b-a22b",
  /** Efficient 14B model — great value for creative writing */
  QWEN3_14B: "qwen3-14b",
  /** Efficient 30B MoE model */
  QWEN3_30B_A3B: "qwen3-30b-a3b",
  /** 32B dense model */
  QWEN3_32B: "qwen3-32b",
} as const;

export type Qwen3ModelId = (typeof QWEN3_MODELS)[keyof typeof QWEN3_MODELS];

/** Check if a model ID is a Qwen3/DashScope model */
export const isDashScopeModel = (model: string): boolean =>
  model.startsWith("qwen3-") || model.startsWith("qwen-");

/** Create a DashScope OpenAI-compatible client */
export const dashscopeClient = new OpenAI({
  apiKey: DASHSCOPE_API_KEY,
  baseURL: DASHSCOPE_BASE_URL,
});

/**
 * Run a chat completion against DashScope's Qwen3 models.
 * This mirrors the runChatCompletion signature from openaiClient.ts
 * so that API routes can transparently switch between OpenAI and DashScope.
 */
export const runDashScopeCompletion = async ({
  model,
  system,
  prompt,
  jsonResponse = false,
  maxTokens,
  generationMeta,
}: {
  model: string;
  system?: string;
  prompt: string;
  jsonResponse?: boolean;
  maxTokens?: number;
  generationMeta?: {
    seriesId?: string;
    type?: string;
    targetId?: string;
  };
}) => {
  if (!isDashScopeConfigured()) {
    throw new Error(
      "DASHSCOPE_API_KEY is not set. Add it in Vercel → Settings → Environment Variables. " +
      "Get your key from: https://dashscope.console.aliyun.com/"
    );
  }

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

  if (system) {
    messages.push({ role: "system", content: system });
  }

  messages.push({ role: "user", content: prompt });

  let generationLogId: string | null = null;

  if (generationMeta?.seriesId && generationMeta?.type) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/api/series/generation-log`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            seriesId: generationMeta.seriesId,
            type: generationMeta.type,
            targetId: generationMeta.targetId ?? null,
            prompt,
            status: "running",
          }),
        }
      );
      const data = await response.json();
      generationLogId = data?.log?.id ?? null;
    } catch {
      // ignore logging errors
    }
  }

  const response = await dashscopeClient.chat.completions.create({
    model,
    messages,
    max_completion_tokens: maxTokens ?? 4000,
    response_format: jsonResponse ? { type: "json_object" } : undefined,
  });

  const content = response.choices[0]?.message?.content ?? "";

  if (generationMeta?.seriesId && generationMeta?.type && generationLogId) {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/api/series/generation-log/update`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: generationLogId,
            status: "completed",
            result: content,
          }),
        }
      );
    } catch {
      // ignore logging errors
    }
  }

  if (!jsonResponse) {
    return content;
  }

  try {
    return JSON.parse(content);
  } catch {
    return { error: "Failed to parse JSON response", raw: content };
  }
};
