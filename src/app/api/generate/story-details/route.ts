import { NextResponse } from "next/server";
import { runChatCompletion } from "@/lib/openaiClient";
import { resolveModel, PipelineStep } from "@/lib/modelDefaults";
import { loadSeriesContext } from "@/lib/seriesContext";
import { formatSeriesContextForPrompt } from "@/lib/seriesPrompt";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const { title, novelAbout, model, seriesContext, bookBlueprint, seriesId, bookNumber } =
      await request.json();

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    let liveContext = seriesContext ?? null;
    if (seriesId) {
      try {
        liveContext = await loadSeriesContext(
          seriesId,
          Number(bookNumber) || Number(seriesContext?.book_number) || 1
        );
      } catch (error) {
        console.warn("[story-details] Failed to load live series context:", error);
      }
    }

    const effectiveBlueprint = liveContext?.book_blueprint ?? bookBlueprint ?? null;

    const blueprintSection = effectiveBlueprint
      ? `\n═══ BOOK BLUEPRINT — MANDATORY STRUCTURAL PLAN ═══\nYou MUST follow this blueprint closely. It defines the structural arc this book must follow:\n${JSON.stringify(effectiveBlueprint, null, 2)}\n\nBlueprint Usage Instructions:\n- opening_shift: This MUST be the starting situation for the protagonist. Build the story_theme and central_conflict around this opening.\n- midpoint_shock: This is the pivotal reversal at the story's midpoint. Your plot_summary MUST build toward this moment.\n- lowest_point: This is the protagonist's darkest hour. Make sure central_conflict leads naturally to this point.\n- climax: This is the decisive confrontation. Your plot_summary MUST resolve through this climax.\n- ending_change: This is the transformative resolution. Your plot_summary MUST end with this change.\n- relationship_changes: Weave these into supporting_characters and plot_summary.\n- theme_pressure: This is the thematic weight the story carries. Your story_theme MUST reflect this pressure.\n- full_outline: Use this as the overarching narrative framework.\n═══ END BLUEPRINT ═══\n`
      : "";

    const seriesBlock = formatSeriesContextForPrompt(liveContext);
    const genreHint =
      typeof novelAbout === "string" && /young\s*adult|\bYA\b/i.test(novelAbout)
        ? "Young Adult"
        : "Fiction";

    const prompt = `
I am writing a ${genreHint} novel titled "${title}".
${novelAbout ? `\nHere is what I want the novel to be about:\n${novelAbout}\n` : ""}${blueprintSection}${seriesBlock ? `\nSeries context to honor:\n${seriesBlock}\n` : ""}
Give me the following details:
1. story_theme: The central theme or message of the novel
2. genre: The specific genre or genres this novel belongs to (infer from the brief/series; do not force Young Adult unless the material calls for it)
3. central_concept: The core idea or high-concept premise of the story
4. estimated_word_count: The estimated word count for the complete novel
5. target_age_range: The intended audience age range (e.g., 12-15, 16-18, 18+, adult)
6. main_character_name: The name of the protagonist
7. central_conflict: The primary challenge or conflict the main character faces
8. setting: The primary world/location where the story takes place
9. time_period: When the story takes place
10. supporting_characters: 4-6 key supporting characters with names and brief descriptions
11. plot_summary: A 2-3 paragraph summary of the overall plot
12. narrative_style: First person, third person limited, omniscient, etc. Include tense (past/present).
13. novel_about: Use the author's input as a guiding summary of what the novel is about.
14. voice_sample: About 160 words written IN the protagonist's voice as a mundane moment (waiting, washing dishes, walking home). No plot. No analysis. This is the house style for prose.

Format the response as a JSON object with exactly these keys.
`;

    const systemMessage =
      "You are a professional novelist skilled at creating compelling story outlines. Match genre and audience to the author's brief and series context; do not assume Young Adult unless specified. Respect any provided series context for continuity.";

    const resolvedModel = resolveModel(model, PipelineStep.STORY_DETAILS);
    const result = await runChatCompletion({
      model: resolvedModel,
      system: systemMessage,
      prompt,
      jsonResponse: true,
      maxTokens: 2000,
      generationMeta: seriesId ? { seriesId, type: "story-details" } : undefined,
    });

    const details =
      result && typeof result === "object" && !Array.isArray(result)
        ? (result as Record<string, unknown>)
        : {};

    // Ensure voice_sample exists even if the model omitted it
    if (!String(details.voice_sample ?? "").trim()) {
      const name = String(
        details.main_character_name ?? "the protagonist"
      );
      const style = String(
        details.narrative_style ?? "first-person past"
      );
      try {
        const sample = await runChatCompletion({
          model: resolveModel(model, PipelineStep.PROSE),
          system:
            "You write short voice samples for fiction protagonists. No plot. No analysis. Return only the sample prose.",
          prompt: `Write about 160 words in the voice of ${name}. Mundane moment only. Narrative style: ${style}.`,
          jsonResponse: false,
          maxTokens: 500,
          temperature: 0.7,
        });
        details.voice_sample = String(sample ?? "").trim();
      } catch (err) {
        console.warn("[story-details] voice_sample fallback failed:", err);
      }
    }

    return NextResponse.json(details);
  } catch (error) {
    console.error("❌ Story details generation error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate story details";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
