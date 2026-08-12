import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function startSeriesGenerationLog(payload: {
  seriesId: string;
  type: string;
  targetId?: string | null;
  prompt?: string | null;
}): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("generation_log")
      .insert({
        series_id: payload.seriesId,
        type: payload.type,
        target_id: payload.targetId ?? null,
        prompt: payload.prompt ?? null,
        status: "running",
      })
      .select("id")
      .single();
    if (error) {
      console.warn("[seriesGenerationLog] Failed to start log:", error.message);
      return null;
    }
    return data?.id ?? null;
  } catch (error) {
    console.warn("[seriesGenerationLog] Failed to start log:", error);
    return null;
  }
}

export async function finishSeriesGenerationLog(payload: {
  id: string;
  status?: string;
  result?: string | null;
  errorMessage?: string | null;
}): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .from("generation_log")
      .update({
        status: payload.status ?? "completed",
        result: payload.result ?? null,
        error_message: payload.errorMessage ?? null,
        completed_at: new Date().toISOString(),
      })
      .eq("id", payload.id);
    if (error) {
      console.warn("[seriesGenerationLog] Failed to finish log:", error.message);
    }
  } catch (error) {
    console.warn("[seriesGenerationLog] Failed to finish log:", error);
  }
}
