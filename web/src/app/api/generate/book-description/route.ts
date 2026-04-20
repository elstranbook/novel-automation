import { NextResponse } from "next/server";
import { runChatCompletion } from "@/lib/openaiClient";

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
    const genre = storyDetails.genre ?? "Young Adult Fiction";
    const theme = storyDetails.story_theme ?? "Coming of age";
    const mainCharacter = storyDetails.main_character_name ?? "the protagonist";
    const centralConflict =
      storyDetails.central_conflict ?? "a life-changing challenge";
    const setting = storyDetails.setting ?? "modern day";
    const plotSummary =
      storyDetails.plot_summary ?? "A compelling young adult story";
    const targetAge = storyDetails.target_age_range ?? "13-18";
    const novelAbout = storyDetails.novel_about ?? "";

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
Create a compelling ${descriptionType} description for the Young Adult novel "${title}".

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
- Must appeal to ${targetAge} year old readers and parents/educators
- Include emotional hooks that resonate with teen experiences
- Highlight stakes and consequences
- Use active voice and vivid language
- Create urgency and curiosity

**YA Bestseller Elements to Include:**
- Relatable protagonist facing real challenges
- Emotional stakes that matter to teens
- Promise of growth/transformation
- Contemporary relevance
- Strong voice and authenticity

**Avoid:**
- Adult literary fiction language
- Overly complex plots explanations
- Spoilers beyond first act
- Cliché YA tropes without fresh perspective

Write the description now:
`;

    const system = `You are a bestselling YA book marketing expert who understands what makes Young Adult novels successful.
Create descriptions that would make teenagers pick up this book immediately.
Focus on emotional resonance, authentic voice, and compelling stakes.
Study successful YA book descriptions to understand the tone and structure that works.
The description should feel authentic to the ${genre} genre while appealing to ${targetAge} year olds.`;

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
Create a compelling ${descType} description for the Young Adult novel "${title}".

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
- Must appeal to ${targetAge} year old readers and parents/educators
- Include emotional hooks that resonate with teen experiences
- Highlight stakes and consequences
- Use active voice and vivid language
- Create urgency and curiosity

**YA Bestseller Elements to Include:**
- Relatable protagonist facing real challenges
- Emotional stakes that matter to teens
- Promise of growth/transformation
- Contemporary relevance
- Strong voice and authenticity

**Avoid:**
- Adult literary fiction language
- Overly complex plots explanations
- Spoilers beyond first act
- Cliché YA tropes without fresh perspective

Write the description now:
`;

        const loopResponse = await runChatCompletion({
          model: model || "gpt-4.1-mini",
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
      model: model || "gpt-4.1-mini",
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
