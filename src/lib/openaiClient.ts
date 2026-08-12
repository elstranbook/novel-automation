import OpenAI from "openai";
import { isDashScopeModel, runDashScopeCompletion } from "./dashscopeClient";
import {
  finishSeriesGenerationLog,
  startSeriesGenerationLog,
} from "./seriesGenerationLog";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";

if (!OPENAI_API_KEY) {
  console.warn(
    "[openaiClient] WARNING: OPENAI_API_KEY is not set. " +
    "OpenAI-dependent routes will return errors at runtime. " +
    "Set this environment variable to enable OpenAI features."
  );
}

/**
 * Lazily-initialised OpenAI client.  We cannot call `new OpenAI()` at
 * module-load time when the API key is missing because the constructor
 * throws — which kills the Next.js build during "collect page data".
 * Instead we create the instance on first use.
 */
let _openaiClient: OpenAI | null = null;

export const getOpenAIClient = (): OpenAI => {
  if (!_openaiClient) {
    if (!OPENAI_API_KEY) {
      throw new Error(
        "OPENAI_API_KEY is not set. Add it in your environment variables to enable OpenAI features."
      );
    }
    _openaiClient = new OpenAI({
      apiKey: OPENAI_API_KEY,
      timeout: 120_000,
    });
  }
  return _openaiClient;
};

/** @deprecated Use getOpenAIClient() for lazy initialisation */
export const openaiClient = OPENAI_API_KEY
  ? new OpenAI({ apiKey: OPENAI_API_KEY, timeout: 120_000 })
  : (null as unknown as OpenAI);

export const runChatCompletion = async ({
  model,
  system,
  prompt,
  jsonResponse = false,
  maxTokens,
  temperature,
  generationMeta,
}: {
  model: string;
  system?: string;
  prompt: string;
  jsonResponse?: boolean;
  maxTokens?: number;
  temperature?: number;
  generationMeta?: {
    seriesId?: string;
    type?: string;
    targetId?: string;
  };
}) => {
  // ── Route Qwen3/DashScope models through Alibaba Cloud ──
  if (isDashScopeModel(model)) {
    return runDashScopeCompletion({
      model,
      system,
      prompt,
      jsonResponse,
      maxTokens,
      temperature,
      generationMeta,
    });
  }

  // ── Default: OpenAI models ──
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

  if (system) {
    messages.push({ role: "system", content: system });
  }

  messages.push({ role: "user", content: prompt });

  let generationLogId: string | null = null;

  if (generationMeta?.seriesId && generationMeta?.type) {
    generationLogId = await startSeriesGenerationLog({
      seriesId: generationMeta.seriesId,
      type: generationMeta.type,
      targetId: generationMeta.targetId ?? null,
      prompt,
    });
  }

  try {
    const response = await getOpenAIClient().chat.completions.create({
      model,
      messages,
      max_completion_tokens: maxTokens ?? 4000,
      ...(typeof temperature === "number" ? { temperature } : {}),
      response_format: jsonResponse ? { type: "json_object" } : undefined,
    });

    const content = response.choices[0]?.message?.content ?? "";

    if (generationLogId) {
      await finishSeriesGenerationLog({
        id: generationLogId,
        status: "completed",
        result: content,
      });
    }

    if (!jsonResponse) {
      return content;
    }

    try {
      return JSON.parse(content);
    } catch {
      return { error: "Failed to parse JSON response", raw: content };
    }
  } catch (error) {
    if (generationLogId) {
      await finishSeriesGenerationLog({
        id: generationLogId,
        status: "failed",
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    }
    throw error;
  }
};
