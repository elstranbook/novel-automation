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
}: {
  model: string;
  system?: string;
  prompt: string;
  jsonResponse?: boolean;
  maxTokens?: number;
}) => {
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

  if (system) {
    messages.push({ role: "system", content: system });
  }

  messages.push({ role: "user", content: prompt });

  const response = await openaiClient.chat.completions.create({
    model,
    messages,
    max_tokens: maxTokens ?? 4000,
    response_format: jsonResponse ? { type: "json_object" } : undefined,
  });

  const content = response.choices[0]?.message?.content ?? "";

  if (!jsonResponse) {
    return content;
  }

  try {
    return JSON.parse(content);
  } catch {
    return { error: "Failed to parse JSON response", raw: content };
  }
};
