import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type ValidationResult = {
  id: string;
  message: string;
  severity: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const seriesId = searchParams.get("seriesId");
  if (!seriesId) {
    return NextResponse.json({ error: "seriesId required" }, { status: 400 });
  }

  const { data: canonEntries } = await supabaseAdmin
    .from("canon_log_entry")
    .select("fact")
    .in(
      "canon_log_id",
      (
        await supabaseAdmin.from("canon_log").select("id").eq("series_id", seriesId)
      ).data?.map((row) => row.id) ?? []
    );

  const { data: foreshadowing } = await supabaseAdmin
    .from("foreshadowing")
    .select("event_description,payoff_book,existing_hints,required_hints,status")
    .eq("series_id", seriesId);

  const warnings: ValidationResult[] = [];

  if (!canonEntries?.length) {
    warnings.push({
      id: "canon-empty",
      message: "Canon log has no entries.",
      severity: "info",
    });
  }

  foreshadowing?.forEach((entry) => {
    if ((entry.existing_hints ?? 0) < (entry.required_hints ?? 2)) {
      warnings.push({
        id: `foreshadow-${entry.event_description}`,
        message: `Foreshadowing missing hints: ${entry.event_description}`,
        severity: "warning",
      });
    }
    if (entry.status === "setup" && entry.payoff_book) {
      warnings.push({
        id: `foreshadow-payoff-${entry.event_description}`,
        message: `Foreshadowing payoff expected by book ${entry.payoff_book}.`,
        severity: "warning",
      });
    }
  });

  return NextResponse.json({ warnings });
}
