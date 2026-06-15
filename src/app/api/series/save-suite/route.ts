import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

/**
 * POST /api/series/save-suite
 * Saves suite fields (tone, genre, etc.) and related data (worlds, characters)
 * after bible generation.  Uses supabaseAdmin so RLS never blocks writes.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { seriesId, suiteFields, world, characters } = body as {
      seriesId: string;
      suiteFields?: Record<string, unknown>;
      world?: { setting?: string; rules?: string; lore?: string } | null;
      characters?: Array<{ name: string; role: string; description?: string; arc?: unknown }>;
    };

    if (!seriesId) {
      return NextResponse.json({ error: "seriesId required" }, { status: 400 });
    }

    // 1. Update series row with suite fields
    if (suiteFields && Object.keys(suiteFields).length > 0) {
      const { error: updateError } = await supabaseAdmin
        .from("series")
        .update(suiteFields)
        .eq("id", seriesId);

      if (updateError) {
        console.error("[save-suite] Failed to update series:", updateError.message);
      }
    }

    // 2. Upsert series_worlds
    if (world) {
      const { error: worldError } = await supabaseAdmin
        .from("series_worlds")
        .upsert({
          series_id: seriesId,
          setting: world.setting ?? null,
          rules: world.rules ?? null,
          lore: world.lore ?? null,
        });

      if (worldError) {
        console.error("[save-suite] Failed to upsert series_worlds:", worldError.message);
      }
    }

    // 3. Replace series_characters
    if (Array.isArray(characters)) {
      await supabaseAdmin
        .from("series_characters")
        .delete()
        .eq("series_id", seriesId);

      if (characters.length > 0) {
        const { error: charError } = await supabaseAdmin
          .from("series_characters")
          .insert(characters);

        if (charError) {
          console.error("[save-suite] Failed to insert series_characters:", charError.message);
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[save-suite] Error:", error);
    return NextResponse.json({ error: "Failed to save suite data" }, { status: 500 });
  }
}
