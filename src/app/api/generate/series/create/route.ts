import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { runChatCompletion } from "@/lib/openaiClient";

export async function POST(request: Request) {
  try {
    const { userId, title, description, numBooks, model } = await request.json();

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

    const arcPrompt = `
Create a cohesive series arc for a YA series titled "${title}" with ${numBooks ?? 1} books.

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
      "You are a series architect for YA fiction. Provide cohesive multi-book arcs.";

    const arcResponse = await runChatCompletion({
      model: model || "gpt-4.1-mini",
      system: arcSystem,
      prompt: arcPrompt,
      jsonResponse: true,
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
