import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type SeriesContext = {
  series_id: string;
  series_title: string;
  series_description: string | null;
  series_arc: unknown;
  character_arcs: unknown;
  themes: unknown;
  continuity_notes: unknown;
  book_number: number;
  total_books: number | null;
  world: Record<string, unknown> | null;
  characters: Array<Record<string, unknown>>;
  memory: Array<Record<string, unknown>>;
  book_map: Array<Record<string, unknown>>;
  canon_log: Record<string, unknown> | null;
  canon_entries: Array<Record<string, unknown>>;
  relationships: Array<Record<string, unknown>>;
  mystery_log: Record<string, unknown> | null;
  secrets: Array<Record<string, unknown>>;
  clues: Array<Record<string, unknown>>;
  plot_threads: Array<Record<string, unknown>>;
  world_elements: Array<Record<string, unknown>>;
  foreshadowing: Array<Record<string, unknown>>;
  callbacks: Array<Record<string, unknown>>;
  timeline: Array<Record<string, unknown>>;
  character_evolution: unknown;
  prior_books: Array<{ title: string; synopsis: unknown }>;
  book_blueprint: unknown;
  all_blueprints: Array<{ book_number: unknown; blueprint: unknown }>;
  /** Series bible law fields used as immutable constraints */
  bible: {
    story_rules?: unknown;
    continuity_lockfile?: unknown;
    unanswered_mysteries?: unknown;
    series_arc_summary?: unknown;
    themes_symbols?: unknown;
  } | null;
  /** Current book's series_book_maps.map_data */
  current_book_map: Record<string, unknown> | null;
  /** Prior book's compiled book_memory (Book N-1) */
  prior_book_memory: Record<string, unknown> | null;
  /** Current book's tension_profile */
  tension_profile: Record<string, unknown> | null;
  /** Character end-states for current book (falls back to prior book) */
  character_states: Array<Record<string, unknown>>;
};

const emptyUuid = "00000000-0000-0000-0000-000000000000";

export async function loadSeriesContext(
  seriesId: string,
  bookNumber: number
): Promise<SeriesContext> {
  const { data: series, error: seriesError } = await supabaseAdmin
    .from("series")
    .select("*")
    .eq("id", seriesId)
    .single();

  if (seriesError) throw seriesError;

  const { data: arc } = await supabaseAdmin
    .from("series_arcs")
    .select("*")
    .eq("series_id", seriesId)
    .maybeSingle();

  const { data: priorNovels } = await supabaseAdmin
    .from("novels")
    .select("id,title,book_number")
    .eq("series_id", seriesId)
    .lt("book_number", bookNumber);

  const priorNovelIds = (priorNovels ?? []).map((row) => row.id);

  const { data: priorBooks } = await supabaseAdmin
    .from("novel_synopsis")
    .select("*")
    .in("novel_id", priorNovelIds.length > 0 ? priorNovelIds : [emptyUuid]);

  const [{ data: canonLog }, { data: mysteryLog }, { data: relationshipLog }] =
    await Promise.all([
      supabaseAdmin
        .from("canon_log")
        .select("*")
        .eq("series_id", seriesId)
        .maybeSingle(),
      supabaseAdmin
        .from("mystery_log")
        .select("*")
        .eq("series_id", seriesId)
        .maybeSingle(),
      supabaseAdmin
        .from("relationship_log")
        .select("*")
        .eq("series_id", seriesId)
        .maybeSingle(),
    ]);

  const canonLogId = canonLog?.id ?? emptyUuid;
  const mysteryLogId = mysteryLog?.id ?? emptyUuid;
  const relationshipLogId = relationshipLog?.id ?? emptyUuid;

  const [
    { data: world },
    { data: characters },
    { data: memory },
    { data: books },
    { data: canonEntries },
    { data: relationshipEntries },
    { data: secrets },
    { data: clues },
    { data: plotThreads },
    { data: worldElements },
    { data: foreshadowing },
    { data: callbacks },
    { data: blueprints },
    { data: timeline },
    { data: evolutionRows },
    { data: bibleRow },
    { data: bookMaps },
  ] = await Promise.all([
    supabaseAdmin
      .from("series_worlds")
      .select("*")
      .eq("series_id", seriesId)
      .maybeSingle(),
    supabaseAdmin.from("series_characters").select("*").eq("series_id", seriesId),
    supabaseAdmin
      .from("series_memory")
      .select("*")
      .eq("series_id", seriesId)
      .order("created_at", { ascending: true }),
    supabaseAdmin
      .from("series_books")
      .select("*")
      .eq("series_id", seriesId)
      .order("book_number", { ascending: true }),
    supabaseAdmin.from("canon_log_entry").select("*").eq("canon_log_id", canonLogId),
    supabaseAdmin
      .from("relationship_entry")
      .select("*")
      .eq("relationship_log_id", relationshipLogId),
    supabaseAdmin.from("secret").select("*").eq("mystery_log_id", mysteryLogId),
    supabaseAdmin.from("clue").select("*").eq("mystery_log_id", mysteryLogId),
    supabaseAdmin.from("plot_thread").select("*").eq("series_id", seriesId),
    supabaseAdmin.from("world_element").select("*").eq("series_id", seriesId),
    supabaseAdmin.from("foreshadowing").select("*").eq("series_id", seriesId),
    supabaseAdmin.from("callback").select("*").eq("series_id", seriesId),
    supabaseAdmin
      .from("series_book_blueprints")
      .select("*")
      .eq("series_id", seriesId)
      .order("book_number", { ascending: true }),
    supabaseAdmin
      .from("series_timeline_events")
      .select("*")
      .eq("series_id", seriesId)
      .order("event_order", { ascending: true }),
    supabaseAdmin
      .from("series_character_evolution")
      .select("*")
      .eq("series_id", seriesId)
      .limit(1),
    supabaseAdmin
      .from("series_bibles")
      .select(
        "story_rules,continuity_lockfile,unanswered_mysteries,series_arc_summary,themes_symbols"
      )
      .eq("series_id", seriesId)
      .maybeSingle(),
    supabaseAdmin
      .from("series_book_maps")
      .select("*")
      .eq("series_id", seriesId)
      .order("book_number", { ascending: true }),
  ]);

  const seriesBooks = books ?? [];
  const currentBookRow =
    seriesBooks.find((b) => Number(b.book_number) === Number(bookNumber)) ?? null;
  const priorBookRow =
    bookNumber > 1
      ? seriesBooks.find((b) => Number(b.book_number) === Number(bookNumber) - 1) ??
        null
      : null;
  const currentBookId = currentBookRow?.id ?? null;
  const priorBookId = priorBookRow?.id ?? null;

  const [{ data: priorMemory }, { data: tensionRow }, { data: currentStates }] =
    await Promise.all([
      priorBookId
        ? supabaseAdmin
            .from("book_memory")
            .select("*")
            .eq("book_id", priorBookId)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      currentBookId
        ? supabaseAdmin
            .from("tension_profile")
            .select("*")
            .eq("book_id", currentBookId)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      currentBookId
        ? supabaseAdmin
            .from("character_state")
            .select("*")
            .eq("book_id", currentBookId)
        : Promise.resolve({ data: [] as Array<Record<string, unknown>> }),
    ]);

  let characterStates = (currentStates ?? []) as Array<Record<string, unknown>>;
  if (characterStates.length === 0 && priorBookId) {
    const { data: priorStates } = await supabaseAdmin
      .from("character_state")
      .select("*")
      .eq("book_id", priorBookId);
    characterStates = (priorStates ?? []) as Array<Record<string, unknown>>;
  }

  // Attach character names for prompt formatting
  const characterById = new Map(
    (characters ?? []).map((c) => [String(c.id), c] as const)
  );
  characterStates = characterStates.map((state) => {
    const char = characterById.get(String(state.character_id ?? ""));
    return {
      ...state,
      character_name: char?.name ?? state.character_name ?? null,
    };
  });

  const currentMapRow =
    (bookMaps ?? []).find(
      (m) => Number(m.book_number) === Number(bookNumber)
    ) ?? null;

  return {
    series_id: seriesId,
    series_title: series.title,
    series_description: series.description,
    series_arc: arc?.overall_arc ?? null,
    character_arcs: arc?.character_arcs ?? null,
    themes: arc?.themes ?? null,
    continuity_notes: arc?.continuity_notes ?? null,
    book_number: bookNumber,
    total_books: series.num_books,
    world: (world as Record<string, unknown> | null) ?? null,
    characters: characters ?? [],
    memory: memory ?? [],
    book_map: seriesBooks,
    canon_log: (canonLog as Record<string, unknown> | null) ?? null,
    canon_entries: canonEntries ?? [],
    relationships: relationshipEntries ?? [],
    mystery_log: (mysteryLog as Record<string, unknown> | null) ?? null,
    secrets: secrets ?? [],
    clues: clues ?? [],
    plot_threads: plotThreads ?? [],
    world_elements: worldElements ?? [],
    foreshadowing: foreshadowing ?? [],
    callbacks: callbacks ?? [],
    timeline: timeline ?? [],
    character_evolution: evolutionRows?.[0]?.evolution ?? null,
    prior_books: (priorBooks ?? []).map((book) => {
      const matchingNovel = (priorNovels ?? []).find((n) => n.id === book.novel_id);
      return {
        title: matchingNovel?.title ?? `Book ${matchingNovel?.book_number ?? "?"}`,
        synopsis: book.synopsis,
      };
    }),
    book_blueprint:
      blueprints?.find((bp) => Number(bp.book_number) === Number(bookNumber))
        ?.blueprint ?? null,
    all_blueprints: (blueprints ?? []).map((bp) => ({
      book_number: bp.book_number,
      blueprint: bp.blueprint,
    })),
    bible: bibleRow
      ? {
          story_rules: bibleRow.story_rules ?? null,
          continuity_lockfile: bibleRow.continuity_lockfile ?? null,
          unanswered_mysteries: bibleRow.unanswered_mysteries ?? null,
          series_arc_summary: bibleRow.series_arc_summary ?? null,
          themes_symbols: bibleRow.themes_symbols ?? null,
        }
      : null,
    current_book_map:
      (currentMapRow?.map_data as Record<string, unknown> | null) ?? null,
    prior_book_memory: (priorMemory as Record<string, unknown> | null) ?? null,
    tension_profile: (tensionRow as Record<string, unknown> | null) ?? null,
    character_states: characterStates,
  };
}

function readSeriesId(
  storyDetails: Record<string, unknown> | null | undefined,
  seriesId?: string | null
): string | null {
  if (seriesId) return seriesId;
  if (!storyDetails) return null;
  if (typeof storyDetails.series_id === "string" && storyDetails.series_id) {
    return storyDetails.series_id;
  }
  const nested = storyDetails.series_context as Record<string, unknown> | undefined;
  if (nested && typeof nested.series_id === "string" && nested.series_id) {
    return nested.series_id;
  }
  return null;
}

function readBookNumber(
  storyDetails: Record<string, unknown> | null | undefined,
  bookNumber?: number | null
): number {
  if (bookNumber && Number(bookNumber) > 0) return Number(bookNumber);
  if (!storyDetails) return 1;
  if (typeof storyDetails.book_number === "number" && storyDetails.book_number > 0) {
    return storyDetails.book_number;
  }
  const nested = storyDetails.series_context as Record<string, unknown> | undefined;
  const nestedBook = Number(nested?.book_number ?? 0);
  return nestedBook > 0 ? nestedBook : 1;
}

export function getSeriesContext(
  storyDetails: Record<string, unknown> | null | undefined
): SeriesContext | null {
  const ctx = storyDetails?.series_context;
  if (!ctx || typeof ctx !== "object") return null;
  return ctx as SeriesContext;
}

export function seriesGenerationMeta(
  storyDetails: Record<string, unknown> | null | undefined,
  type: string,
  seriesId?: string | null
): { seriesId: string; type: string } | undefined {
  const id =
    seriesId ||
    (typeof storyDetails?.series_id === "string" ? storyDetails.series_id : null) ||
    (typeof (storyDetails?.series_context as Record<string, unknown> | undefined)?.series_id ===
    "string"
      ? String((storyDetails?.series_context as Record<string, unknown>).series_id)
      : null);
  if (!id) return undefined;
  return { seriesId: id, type };
}

export async function hydrateStoryDetailsWithLiveSeriesContext(
  storyDetails: Record<string, unknown> | null | undefined,
  seriesId?: string | null,
  bookNumber?: number | null
): Promise<Record<string, unknown> | null | undefined> {
  if (!storyDetails) return storyDetails;
  const id = readSeriesId(storyDetails, seriesId);
  if (!id) return storyDetails;
  const bn = readBookNumber(storyDetails, bookNumber);
  try {
    const context = await loadSeriesContext(id, bn);
    return {
      ...storyDetails,
      series_id: id,
      series_context: context,
    };
  } catch (error) {
    console.warn("[seriesContext] Failed to hydrate live series context:", error);
    return storyDetails;
  }
}
