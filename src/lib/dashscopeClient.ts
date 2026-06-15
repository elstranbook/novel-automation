import OpenAI from "openai";

/**
 * OpenRouter client for Qwen3 models.
 *
 * OpenRouter provides unified access to all models with a single API key.
 * No need to enable individual models — everything works immediately.
 * Docs: https://openrouter.ai/docs/api-reference
 *
 * Get your API key from: https://openrouter.ai/keys
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY ?? "";
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

/** Check if OpenRouter API key is configured */
export const isOpenRouterConfigured = (): boolean => OPENROUTER_API_KEY.length > 0;

if (!OPENROUTER_API_KEY) {
  console.warn(
    "[dashscopeClient] WARNING: OPENROUTER_API_KEY is not set. " +
    "OpenRouter/Qwen3-dependent routes will return errors at runtime. " +
    "Get your key from: https://openrouter.ai/keys"
  );
}

/** Available Qwen3 creative-writing models on OpenRouter */
export const QWEN3_MODELS = {
  /** Best for creative writing — superior human preference alignment */
  QWEN3_235B_INSTRUCT: "qwen/qwen3-235b-a22b-instruct-2507",
  /** Thinking/reasoning mode — for complex narrative planning */
  QWEN3_235B_THINKING: "qwen/qwen3-235b-a22b-thinking-2507",
  /** Base model — general purpose */
  QWEN3_235B_BASE: "qwen/qwen3-235b-a22b",
  /** Efficient 14B model — great value for creative writing */
  QWEN3_14B: "qwen/qwen3-14b",
  /** Efficient 30B MoE model */
  QWEN3_30B_A3B: "qwen/qwen3-30b-a3b",
  /** 32B dense model */
  QWEN3_32B: "qwen/qwen3-32b",
} as const;

export type Qwen3ModelId = (typeof QWEN3_MODELS)[keyof typeof QWEN3_MODELS];

/** Check if a model ID is a Qwen3/OpenRouter model */
export const isDashScopeModel = (model: string): boolean =>
  model.startsWith("qwen3-") || model.startsWith("qwen-") || model.startsWith("qwen/");

/**
 * Lazily-initialised OpenRouter client.  We cannot call `new OpenAI()` at
 * module-load time when the API key is missing because the constructor
 * throws — which kills the Next.js build during "collect page data".
 * Instead we create the instance on first use.
 */
let _dashscopeClient: OpenAI | null = null;

export const getDashScopeClient = (): OpenAI => {
  if (!_dashscopeClient) {
    if (!OPENROUTER_API_KEY) {
      throw new Error(
        "OPENROUTER_API_KEY is not set. Add it in Vercel → Settings → Environment Variables. " +
        "Get your key from: https://openrouter.ai/keys"
      );
    }
    _dashscopeClient = new OpenAI({
      apiKey: OPENROUTER_API_KEY,
      baseURL: OPENROUTER_BASE_URL,
      timeout: 120_000,
      defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "https://write.elstranbooks.com",
        "X-Title": "Novel Automation",
      },
    });
  }
  return _dashscopeClient;
};

/** @deprecated Use getDashScopeClient() for lazy initialisation */
export const dashscopeClient = OPENROUTER_API_KEY
  ? new OpenAI({
      apiKey: OPENROUTER_API_KEY,
      baseURL: OPENROUTER_BASE_URL,
      timeout: 120_000,
      defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "https://write.elstranbooks.com",
        "X-Title": "Novel Automation",
      },
    })
  : (null as unknown as OpenAI);

/**
 * Run a chat completion against OpenRouter's Qwen3 models.
 * This mirrors the runChatCompletion signature from openaiClient.ts
 * so that API routes can transparently switch between OpenAI and OpenRouter.
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
  if (!isOpenRouterConfigured()) {
    throw new Error(
      "OPENROUTER_API_KEY is not set. Add it in Vercel → Settings → Environment Variables. " +
      "Get your key from: https://openrouter.ai/keys"
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

  const response = await getDashScopeClient().chat.completions.create({
    model,
    messages,
    max_completion_tokens: maxTokens ?? 4000,
    // Thinking models don't support response_format; skip for them
    ...(jsonResponse && !model.includes("thinking") ? { response_format: { type: "json_object" } } : {}),
  });

  let content = response.choices[0]?.message?.content ?? "";

  // Strip <think/> tags from thinking model responses
  content = content.replace(/<think[\s\S]*?<\/think>\s*/g, "").trim();

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

  // For thinking models that couldn't use response_format,
  // try to extract JSON from the response
  try {
    return JSON.parse(content);
  } catch {
    // Try to find JSON object in the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        // fall through
      }
    }
    // Try to find JSON array
    const arrayMatch = content.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try {
        return JSON.parse(arrayMatch[0]);
      } catch {
        // fall through
      }
    }
    return { error: "Failed to parse JSON response", raw: content };
  }
};
