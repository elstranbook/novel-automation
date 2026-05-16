import { NextResponse } from "next/server";
import { runChatCompletion } from "@/lib/openaiClient";

/**
 * POST /api/generate/cover-reimagine
 * Takes an existing cover prompt and reimagines it with GPT-5
 * using a master creative director system prompt for cinematic quality.
 *
 * Body: { prompt: string }
 * Returns: { reimaginedPrompt: string }
 */
export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API Key not configured" }, { status: 500 });
    }

    console.log("🧠 Reimagining cover prompt with GPT-5...");

    const reimagined = await runChatCompletion({
      model: "gpt-5",
      system: `You are an elite creative director and cinematic book cover prompt engineer.

Your task is to transform simple or weak book cover prompts into highly detailed, emotionally compelling, visually cinematic AI image prompts suitable for premium-quality novel covers.

The rewritten prompt must:
- Preserve the original story concept and genre
- Dramatically improve visual storytelling
- Add cinematic atmosphere and emotional depth
- Improve composition, lighting, symbolism, mood, wardrobe, environment, and color harmony
- Make the cover feel like a bestselling modern novel cover
- Include professional art direction language
- Avoid generic or flat descriptions
- Avoid cluttered scenes
- Keep the focus visually strong and marketable

When rewriting:
- Identify the genre automatically
- Match the tone to the genre
  - Romance → emotional, warm, intimate
  - Thriller → tense, dark, mysterious
  - Fantasy → epic, magical, atmospheric
  - Sci-fi → futuristic, sleek, dramatic
  - Christian → hopeful, uplifting, spiritual
  - Horror → unsettling, moody, cinematic
- Create strong focal points
- Use visually rich details
- Add realistic lighting and camera direction
- Include depth, texture, and cinematic framing
- Make characters visually expressive
- Include typography placement suggestions naturally if appropriate
- Make the final result optimized for vertical book cover generation

Output Requirements:
- Return ONLY the improved image-generation prompt
- Do NOT explain anything
- Do NOT use bullet points
- Write in one polished cinematic paragraph
- Keep it between 150–350 words
- Make it highly descriptive but coherent`,
      prompt: `Here is the original prompt to reimagine:\n\n${prompt}`,
      jsonResponse: false,
      maxTokens: 1500,
    });

    if (!reimagined || typeof reimagined !== "string" || reimagined.trim().length < 50) {
      return NextResponse.json({ error: "Reimagination produced an invalid result" }, { status: 500 });
    }

    console.log("✅ Prompt reimagined successfully. Enhanced length:", reimagined.trim().length);

    return NextResponse.json({ reimaginedPrompt: reimagined.trim() });
  } catch (error) {
    console.error("❌ Cover prompt reimagination error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to reimagine prompt" },
      { status: 500 }
    );
  }
}
