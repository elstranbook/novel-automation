import { NextResponse } from "next/server";
import { runChatCompletion } from "@/lib/openaiClient";
import { resolveModel, PipelineStep } from "@/lib/modelDefaults";
import { loadSeriesContext, type SeriesContext } from "@/lib/seriesContext";
import { formatSeriesContextForPrompt } from "@/lib/seriesPrompt";

export type FillBody = {
  seriesId?: string;
  model?: string;
};

export function requireSeriesId(body: FillBody): string | NextResponse {
  const seriesId = typeof body.seriesId === "string" ? body.seriesId.trim() : "";
  if (!seriesId) {
    return NextResponse.json({ error: "seriesId required" }, { status: 400 });
  }
  return seriesId;
}

export async function loadFillContext(seriesId: string): Promise<{
  context: SeriesContext;
  contextText: string;
}> {
  const context = await loadSeriesContext(seriesId, 1);
  const contextText = formatSeriesContextForPrompt(context, {
    includeCharacters: true,
  });
  return { context, contextText };
}

export async function runFillCompletion({
  seriesId,
  type,
  model,
  system,
  prompt,
}: {
  seriesId: string;
  type: string;
  model?: string;
  system: string;
  prompt: string;
}): Promise<Record<string, unknown>> {
  const resolved = resolveModel(model, PipelineStep.SERIES_BIBLE);
  const result = await runChatCompletion({
    model: resolved,
    system,
    prompt,
    jsonResponse: true,
    generationMeta: { seriesId, type },
  });
  if (!result || typeof result !== "object" || Array.isArray(result)) {
    return {};
  }
  return result as Record<string, unknown>;
}

export function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function asOptionalInt(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

export function clipExistingList(
  items: Array<Record<string, unknown>>,
  formatter: (item: Record<string, unknown>) => string,
  max = 40
): string {
  if (!items.length) return "(none yet)";
  return items
    .slice(0, max)
    .map((item) => formatter(item))
    .filter(Boolean)
    .join("\n");
}
