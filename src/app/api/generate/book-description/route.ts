import { NextResponse } from "next/server";
import { runChatCompletion } from "@/lib/openaiClient";
import { resolveModel, PipelineStep } from "@/lib/modelDefaults";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const { storyDetails, model, descriptionType, lengthType, mode } =
      await request.json();

    if (!storyDetails) {
      return NextResponse.json(
        { error: "Story details are required" },
        { status: 400 }
      );
    }

    const title = storyDetails.title ?? "Untitled";
    const genre = storyDetails.genre ?? "Fiction";
    const isYa = /young\s*adult|\bYA\b/i.test(String(genre));
    const theme = storyDetails.story_theme ?? "Identity and transformation";
    const mainCharacter = storyDetails.main_character_name ?? "the protagonist";
    const centralConflict =
      storyDetails.central_conflict ?? "a life-changing challenge";
    const setting = storyDetails.setting ?? "a vivid world";
    const plotSummary =
      storyDetails.plot_summary ?? "A compelling story";
    const targetAge = storyDetails.target_age_range ?? (isYa ? "13-18" : "adult");
    const novelAbout = storyDetails.novel_about ?? "";
    const audienceLabel = isYa ? "Young Adult" : genre;

    const resolvePromptConfig = (
      descType: string,
      lenType: string | undefined
    ) => {
      let wordLimit = "100-150 words";
      let focus = "balanced between hook and detail";

      if (descType === "marketing") {
        if (lenType === "short") {
          wordLimit = "50-75 words";
          focus = "hook-focused, high-impact, punchy";
        } else if (lenType === "long") {
          wordLimit = "200-250 words";
          focus = "comprehensive, detailed character development and world-building";
        }
      } else if (descType === "back_cover") {
        wordLimit = "150-200 words";
        focus = "compelling back-cover copy with strong hook and call-to-action";
      } else if (descType === "pitch") {
        wordLimit = "75-100 words";
        focus = "publisher/agent pitch emphasizing market appeal and unique elements";
      } else if (descType === "elevator_pitch") {
        wordLimit = "25-40 words";
        focus = "one-sentence elevator pitch capturing the essence";
      }

      return { wordLimit, focus };
    };

    const { wordLimit, focus } = resolvePromptConfig(
      descriptionType ?? "marketing",
      lengthType ?? "standard"
    );

    const prompt = `
Create a compelling ${descriptionType} description for the ${audienceLabel} novel "${title}".

**Novel Details:**
- Genre: ${genre}
- Theme: ${theme}
- Main Character: ${mainCharacter}
- Central Conflict: ${centralConflict}
- Setting: ${setting}
- Target Age: ${targetAge}
- Plot Summary: ${plotSummary}
${novelAbout ? `- Author Intent: ${novelAbout}` : ""}

**Description Requirements:**
- Length: ${wordLimit}
- Style: ${focus}
- Must appeal to the stated audience (${targetAge})
- Include emotional hooks that resonate with that audience
- Highlight stakes and consequences
- Use active voice and vivid language
- Create urgency and curiosity

**Market Elements to Include:**
- Relatable protagonist facing real challenges
- Emotional stakes that matter to the audience
- Promise of growth/transformation
- Strong voice and authenticity

**Avoid:**
- Mismatched age-market language
- Overly complex plot explanations
- Spoilers beyond first act
- Cliché tropes without fresh perspective

Write the description now:
`;

    const system = `You are a bestselling book marketing expert for ${audienceLabel} fiction.
Create descriptions that make the target readers pick up this book immediately.
Focus on emotional resonance, authentic voice, and compelling stakes.
The description should feel authentic to the ${genre} genre while appealing to ${targetAge} readers.`;

    if (mode === "all") {
      const descriptionSets: Array<[string, string]> = [
        ["marketing", "standard"],
        ["marketing", "short"],
        ["back_cover", "standard"],
        ["pitch", "standard"],
        ["marketing", "long"],
        ["elevator_pitch", "standard"],
      ];

      const descriptions: Record<string, string> = {};

      for (const [descType, lenType] of descriptionSets) {
        const { wordLimit: loopWordLimit, focus: loopFocus } =
          resolvePromptConfig(descType, lenType);
        const loopPrompt = `
Create a compelling ${descType} description for the ${audienceLabel} novel "${title}".

**Novel Details:**
- Genre: ${genre}
- Theme: ${theme}
- Main Character: ${mainCharacter}
- Central Conflict: ${centralConflict}
- Setting: ${setting}
- Target Age: ${targetAge}
- Plot Summary: ${plotSummary}
${novelAbout ? `- Author Intent: ${novelAbout}` : ""}

**Description Requirements:**
- Length: ${loopWordLimit}
- Style: ${loopFocus}
- Must appeal to the stated audience (${targetAge})
- Include emotional hooks that resonate with that audience
- Highlight stakes and consequences
- Use active voice and vivid language
- Create urgency and curiosity

**Market Elements to Include:**
- Relatable protagonist facing real challenges
- Emotional stakes that matter to the audience
- Promise of growth/transformation
- Strong voice and authenticity

**Avoid:**
- Mismatched age-market language
- Overly complex plot explanations
- Spoilers beyond first act
- Cliché tropes without fresh perspective

Write the description now:
`;

        const loopResponse = await runChatCompletion({
          model: resolveModel(model, PipelineStep.BOOK_DESCRIPTION),
          system,
          prompt: loopPrompt,
          jsonResponse: false,
          maxTokens: 800,
        });

        descriptions[`${descType}_${lenType}`] = String(loopResponse).trim();
      }

      return NextResponse.json({ descriptions });
    }

    const response = await runChatCompletion({
      model: resolveModel(model, PipelineStep.BOOK_DESCRIPTION),
      system,
      prompt,
      jsonResponse: false,
      maxTokens: 800,
    });

    return NextResponse.json({ description: response });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate book description" },
      { status: 500 }
    );
  }
}
