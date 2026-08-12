import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { runChatCompletion } from "@/lib/openaiClient";
import { resolveModel, PipelineStep } from "@/lib/modelDefaults";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const { userId, title, description, numBooks, model, genre, targetAgeRange } =
      await request.json();

    if (!userId || !title) {
      return NextResponse.json(
        { error: "User ID and title are required" },
        { status: 400 }
      );
    }

    const { data: series, error } = await supabaseAdmin
      .from("series")
      .insert({
        user_id: userId,
        title,
        description,
        num_books: numBooks ?? 1,
      })
      .select("*")
      .single();

    if (error) throw error;

    const genreLabel = String(genre ?? "").trim() || "fiction";
    const audience = String(targetAgeRange ?? "").trim();

    const arcPrompt = `
Create a cohesive series arc for a ${genreLabel} series titled "${title}" with ${numBooks ?? 1} books.
${audience ? `Target audience: ${audience}` : ""}

Series Description:
${description ?? ""}

Provide:
- overall_arc: a paragraph summary
- character_arcs: key characters and how they evolve
- themes: list of themes across the series
- continuity_notes: notes to keep consistency
- book_titles: list of proposed book titles (length ${numBooks ?? 1})

Return JSON with keys overall_arc, character_arcs (object), themes (array), continuity_notes, book_titles.
`;

    const arcSystem =
      `You are a series architect for ${genreLabel} fiction. Provide cohesive multi-book arcs. Match the stated genre and audience; do not assume Young Adult unless the material calls for it.`;

    const arcResponse = await runChatCompletion({
      model: resolveModel(model, PipelineStep.SERIES_CREATE),
      system: arcSystem,
      prompt: arcPrompt,
      jsonResponse: true,
      generationMeta: { seriesId: series.id, type: "series-create" },
    });

    const { error: arcError } = await supabaseAdmin
      .from("series_arcs")
      .insert({
        user_id: userId,
        series_id: series.id,
        overall_arc: arcResponse.overall_arc ?? "",
        character_arcs: arcResponse.character_arcs ?? {},
        themes: arcResponse.themes ?? [],
        continuity_notes: arcResponse.continuity_notes ?? null,
      });

    if (arcError) throw arcError;

    return NextResponse.json({ series, arc: arcResponse });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create series" },
      { status: 500 }
    );
  }
}
