import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { runChatCompletion } from "@/lib/openaiClient";
import { resolveModel, PipelineStep } from "@/lib/modelDefaults";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

type SeriesMapRequest = {
  seriesId: string;
  title: string;
  numBooks: number;
  model?: string;
  seriesBible?: Record<string, unknown> | null;
};

/**
 * Extracts a book map array from the LLM response.
 *
 * When `response_format: { type: "json_object" }` is used, OpenAI models
 * ALWAYS return a JSON object — never a bare array.  So the LLM may return
 * `{"books": [...]}` or `{"book_maps": [...]}` instead of `[...]`.
 * This helper normalises all cases into an array.
 */
function extractBookArray(
  raw: unknown
): Record<string, unknown>[] {
  // Case 1: already an array
  if (Array.isArray(raw)) return raw as Record<string, unknown>[];

  // Case 2: object — look for common keys that hold the array
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    const arrayKeys = [
      "books",
      "book_maps",
      "maps",
      "map",
      "data",
      "book_map",
      "items",
      "results",
    ];
    for (const key of arrayKeys) {
      const val = obj[key];
      if (Array.isArray(val) && val.length > 0) {
        console.log(
          `[map-route] Extracted book array from object key "${key}" (${val.length} items)`
        );
        return val as Record<string, unknown>[];
      }
    }
    // Case 3: object with numeric keys like {"1": {...}, "2": {...}}
    const numericEntries = Object.entries(obj)
      .filter(([k]) => /^\d+$/.test(k))
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([, v]) => v);
    if (numericEntries.length > 0) {
      console.log(
        `[map-route] Extracted book array from numeric keys (${numericEntries.length} items)`
      );
      return numericEntries as Record<string, unknown>[];
    }
    // Case 4: single object — wrap in array
    console.log("[map-route] Wrapping single object response in array");
    return [obj];
  }

  return [];
}

export async function POST(request: Request) {
  try {
    const { seriesId, title, numBooks, model, seriesBible } =
      (await request.json()) as SeriesMapRequest;

    if (!seriesId || !title || !numBooks) {
      return NextResponse.json(
        { error: "Series ID, title, and numBooks are required" },
        { status: 400 }
      );
    }

    // Look up the series owner for server-side writes
    const { data: seriesRow } = await supabaseAdmin
      .from("series")
      .select("user_id")
      .eq("id", seriesId)
      .maybeSingle();

    const seriesOwnerUserId = seriesRow?.user_id ?? null;

    if (!seriesOwnerUserId) {
      console.error("[map-route] Could not find series owner for series", seriesId);
      return NextResponse.json(
        { error: "Series not found or has no owner" },
        { status: 404 }
      );
    }

    let bibleContext = "";
    const bible = seriesBible
      ? seriesBible
      : (
          await supabaseAdmin
            .from("series_bibles")
            .select("*")
            .eq("series_id", seriesId)
            .maybeSingle()
        ).data ?? null;

    if (bible) {
      bibleContext = `
SERIES BIBLE REFERENCE:
World Overview: ${bible.world_overview ?? "N/A"}
Core Themes: ${JSON.stringify(bible.themes_symbols ?? [])}
Character Files: ${JSON.stringify(bible.character_files ?? {})}
Series Arc Summary: ${bible.series_arc_summary ?? "N/A"}
`;
    }

    const prompt = `
Create a detailed BOOK-BY-BOOK MAP for a ${numBooks}-book YA series titled "${title}".
${bibleContext}

For EACH of the ${numBooks} books, provide:

1) CENTRAL CONFLICT
   - The main problem/challenge of this book
   - Internal and external conflicts

2) EMOTIONAL JOURNEY
   - The protagonist's emotional arc in this book
   - Key emotional beats and turning points

3) CHARACTER GROWTH
   - How characters evolve in this book
   - What lessons they learn

4) TWIST OR REVEAL
   - The major twist or revelation
   - How it changes everything

5) FINAL STATE
   - How the book ends
   - What has changed from the beginning

6) FORESHADOWING SEEDS
   - Elements planted for future books
   - Hints and setups for later payoffs

7) STAKES ESCALATION
   - How stakes are raised from the previous book
   - Why this book matters more

**CRITICAL RULES:**
- Each book must raise the stakes
- Never allow emotional resets between books
- Build toward the final book
- Plant seeds that pay off later

Return as JSON object with a "books" key containing an array of book maps:
{
  "books": [
    {
      "book_number": 1,
      "central_conflict": "...",
      "emotional_journey": "...",
      "character_growth": "...",
      "twist_reveal": "...",
      "final_state": "...",
      "foreshadowing_seeds": ["seed1", "seed2"],
      "stakes_escalation": "..."
    }
  ]
}
`;

    const system = `You are an expert series planner. Each book must escalate stakes,
    deepen characters, and build toward the finale. Never allow resets. Always think
    in terms of the full series arc.`;

    const rawResponse = await runChatCompletion({
      model: resolveModel(model, PipelineStep.SERIES_MAP),
      system,
      prompt,
      jsonResponse: true,
      maxTokens: 5000,
    });

    // ── Extract the book array from whatever the LLM returned ──
    const books = extractBookArray(rawResponse);
    console.log(
      `[map-route] Raw response type: ${typeof rawResponse}, isArray: ${Array.isArray(rawResponse)}, extracted books: ${books.length}`
    );

    if (books.length === 0) {
      console.error("[map-route] No book data could be extracted from LLM response");
      return NextResponse.json(
        { error: "LLM did not return valid book map data", rawResponse },
        { status: 500 }
      );
    }

    // ── Persist series_book_maps (server-side, bypasses RLS) ──
    const { error: deleteMapError } = await supabaseAdmin
      .from("series_book_maps")
      .delete()
      .eq("series_id", seriesId);

    if (deleteMapError) {
      console.error("[map-route] Failed to delete old series_book_maps:", deleteMapError.message);
    }

    const mapRows = books.map((bookMap) => ({
      series_id: seriesId,
      book_number: bookMap.book_number ?? 1,
      map_data: bookMap,
    }));

    if (mapRows.length) {
      const { error: insertMapError } = await supabaseAdmin
        .from("series_book_maps")
        .insert(mapRows);
      if (insertMapError) {
        console.error("[map-route] Failed to insert series_book_maps:", insertMapError.message);
      } else {
        console.log(`[map-route] Inserted ${mapRows.length} series_book_maps rows`);
      }
    }

    // ── Persist series_books and novels (server-side, bypasses RLS) ──
    let booksResult: Record<string, unknown>[] = [];

    // Delete old series_books
    const { error: deleteBooksError } = await supabaseAdmin
      .from("series_books")
      .delete()
      .eq("series_id", seriesId);

    if (deleteBooksError) {
      console.error("[map-route] Failed to delete old series_books:", deleteBooksError.message);
    }

    // Insert new series_books
    const bookRows = books.map((book) => ({
      series_id: seriesId,
      book_number: Number(book.book_number ?? 1),
      title: String(book.title ?? `Book ${book.book_number ?? 1}`),
      status: "planned",
      summary: String(book.central_conflict ?? ""),
    }));

    if (bookRows.length) {
      const { data: insertedBooks, error: insertBooksError } = await supabaseAdmin
        .from("series_books")
        .insert(bookRows)
        .select("*");

      if (insertBooksError) {
        console.error("[map-route] Failed to insert series_books:", insertBooksError.message);
      } else if (insertedBooks && insertedBooks.length > 0) {
        console.log(`[map-route] Inserted ${insertedBooks.length} series_books rows`);

        // Insert novels for each book
        const resolvedModel = model || "gpt-4.1-mini";
        const novelRows = insertedBooks.map((bookRow: Record<string, unknown>) => ({
          user_id: seriesOwnerUserId,
          title: bookRow.title ?? `Book ${bookRow.book_number}`,
          series_id: bookRow.series_id,
          book_number: bookRow.book_number,
          model: resolvedModel,
          max_scene_length: 2000,
          min_scene_length: 500,
        }));

        const { data: insertedNovels, error: insertNovelsError } = await supabaseAdmin
          .from("novels")
          .insert(novelRows)
          .select("*");

        if (insertNovelsError) {
          console.error("[map-route] Failed to insert novels:", insertNovelsError.message);
        } else if (insertedNovels && insertedNovels.length > 0) {
          console.log(`[map-route] Inserted ${insertedNovels.length} novels`);

          // Update series_books with novel_id
          for (const novelRow of insertedNovels as Record<string, unknown>[]) {
            const { error: updateError } = await supabaseAdmin
              .from("series_books")
              .update({ novel_id: novelRow.id })
              .eq("series_id", novelRow.series_id)
              .eq("book_number", novelRow.book_number);

            if (updateError) {
              console.error(`[map-route] Failed to update novel_id for book ${novelRow.book_number}:`, updateError.message);
            }
          }
        }

        // Reload series_books with novel_id populated
        const { data: refreshedBooks, error: refreshError } = await supabaseAdmin
          .from("series_books")
          .select("*")
          .eq("series_id", seriesId)
          .order("book_number", { ascending: true });

        if (refreshError) {
          console.error("[map-route] Failed to refresh series_books:", refreshError.message);
        } else {
          booksResult = refreshedBooks ?? insertedBooks;
        }
      }
    }

    return NextResponse.json({ maps: books, books: booksResult });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate series map" },
      { status: 500 }
    );
  }
}
