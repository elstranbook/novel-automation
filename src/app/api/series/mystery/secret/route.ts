import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type SecretUpdatePayload = {
  id: string;
  title?: string;
  description?: string;
  status?: string; // hidden | partial | revealed
  revealedInBook?: number | null;
  revealedInChapter?: number | null;
  revealMethod?: string | null;
  whoKnows?: unknown;
  whoDoesntKnow?: unknown;
};

function coerceList(value: unknown): unknown {
  if (value == null) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    // Allow comma-separated input → array
    if (trimmed.includes(",")) {
      return trimmed.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return [trimmed];
  }
  if (Array.isArray(value)) return value;
  return value;
}

export async function PUT(request: Request) {
  try {
    const {
      id,
      title,
      description,
      status,
      revealedInBook,
      revealedInChapter,
      revealMethod,
      whoKnows,
      whoDoesntKnow,
    } = (await request.json()) as SecretUpdatePayload;

    // Build update payload — only include fields that were explicitly provided.
    // This allows partial updates (e.g. just changing status without touching title).
    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (revealedInBook !== undefined) updates.revealed_in_book = revealedInBook;
    if (revealedInChapter !== undefined) updates.revealed_in_chapter = revealedInChapter;
    if (revealMethod !== undefined) updates.reveal_method = revealMethod;
    if (whoKnows !== undefined) updates.who_knows = coerceList(whoKnows);
    if (whoDoesntKnow !== undefined) updates.who_doesnt_know = coerceList(whoDoesntKnow);

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No fields provided to update" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("secret")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ secret: data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update secret" }, { status: 500 });
  }
}
