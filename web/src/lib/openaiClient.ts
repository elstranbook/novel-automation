import OpenAI from "openai";

export const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runChatCompletion = async ({
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

  const response = await openaiClient.chat.completions.create({
    model,
    messages,
    max_tokens: maxTokens ?? 4000,
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
