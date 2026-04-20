import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type MigrationPayload = {
  seriesId: string;
};

export async function POST(request: Request) {
  try {
    const { seriesId } = (await request.json()) as MigrationPayload;
    if (!seriesId) {
      return NextResponse.json({ error: "seriesId required" }, { status: 400 });
    }

    const { data: legacyMemory } = await supabaseAdmin
      .from("series_memory")
      .select("category,content,created_at")
      .eq("series_id", seriesId);

    const canonFacts = legacyMemory?.filter((entry) => entry.category === "canon") ?? [];
    const relationshipFacts = legacyMemory?.filter(
      (entry) => entry.category === "relationship"
    ) ?? [];

    if (canonFacts.length) {
      const { data: canonLog } = await supabaseAdmin
        .from("canon_log")
        .upsert({ series_id: seriesId })
        .select("id")
        .single();

      await supabaseAdmin.from("canon_log_entry").insert(
        canonFacts.map((entry) => ({
          canon_log_id: canonLog?.id,
          category: "fact",
          fact: entry.content,
          source: entry.created_at,
        }))
      );
    }

    if (relationshipFacts.length) {
      await supabaseAdmin
        .from("relationship_log")
        .upsert({
          series_id: seriesId,
          relationships: relationshipFacts.map((entry) => entry.content),
        });
    }

    return NextResponse.json({ migrated: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Migration failed" }, { status: 500 });
  }
}
