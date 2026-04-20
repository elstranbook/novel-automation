import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { runChatCompletion } from "@/lib/openaiClient";

type SeriesInput = {
  seriesId: string;
  title: string;
  genre?: string;
  targetAge?: string;
  tone?: string;
  setting?: string;
  mainCharacters?: string;
  coreConflict?: string;
  themes?: string;
  numBooks?: number;
  model?: string;
};

export async function POST(request: Request) {
  try {
    const {
      seriesId,
      title,
      genre,
      targetAge,
      tone,
      setting,
      mainCharacters,
      coreConflict,
      themes,
      numBooks,
      model,
    } = (await request.json()) as SeriesInput;

    if (!seriesId || !title) {
      return NextResponse.json(
        { error: "Series ID and title are required" },
        { status: 400 }
      );
    }

    const prompt = `
You are building a professional SERIES BIBLE for a ${numBooks ?? 3}-book YA series.
This Bible will become story law - all content must strictly follow it.

**SERIES INPUT:**
Title: ${title}
Genre: ${genre ?? "Young Adult Fiction"}
Target Age: ${targetAge ?? "13-18"}
Tone/Vibe: ${tone ?? "Emotional, dramatic, hopeful"}
Setting: ${setting ?? "Contemporary"}
Main Characters: ${mainCharacters ?? "To be developed"}
Core Conflict: ${coreConflict ?? "To be developed"}
Themes: ${themes ?? "Coming of age, identity, relationships"}
Planned Books: ${numBooks ?? 3}

**CREATE A COMPREHENSIVE SERIES BIBLE WITH THESE 10 COMPONENTS:**

1) WORLD OVERVIEW
   - Detailed description of the world/setting
   - Key locations and their significance
   - Time period and atmosphere

2) WORLD RULES
   - Laws, limits, and dangers of this world
   - What is possible and impossible
   - Social structures and hierarchies

3) HISTORY & LORE
   - Background history relevant to the story
   - Legends, myths, or past events that influence the present
   - Cultural traditions and customs

4) CHARACTER FILES
   For each main character:
   - Goals (what they want)
   - Fears (what terrifies them)
   - Flaws (their weaknesses)
   - Secrets (what they hide)
   - Arc summary (how they'll change across the series)

5) RELATIONSHIP MAP
   - Key relationships between characters
   - Tensions and alliances
   - How relationships evolve across books

6) SERIES ARC (One paragraph per book)
   - Book 1 through Book ${numBooks ?? 3} summaries
   - How each book builds on the last
   - Escalating stakes

7) THEMES & SYMBOLS
   - Major themes and how they develop
   - Recurring symbols and motifs
   - Symbolic meaning of key elements

8) NON-NEGOTIABLE STORY RULES
   - Rules that must never be broken
   - Character consistencies to maintain
   - Plot elements that cannot change

9) CONTINUITY LOCKFILE
   - Key facts that must remain consistent
   - Timeline markers
   - Character trait anchors
   - World details that cannot contradict

10) UNANSWERED MYSTERIES
    - Questions to be answered across the series
    - Mysteries to plant and reveal
    - Secrets to unfold gradually

Return as JSON with these exact keys:
{
  "world_overview": "...",
  "world_rules": "...",
  "history_lore": "...",
  "character_files": {
    "Character Name": {
      "goals": "...",
      "fears": "...",
      "flaws": "...",
      "secrets": "...",
      "arc_summary": "..."
    }
  },
  "relationship_map": {
    "relationship_key": "description"
  },
  "series_arc_summary": "Book 1: ... Book 2: ... etc",
  "themes_symbols": ["theme1: description", "theme2: description"],
  "story_rules": ["rule1", "rule2"],
  "continuity_lockfile": ["fact1", "fact2"],
  "unanswered_mysteries": ["mystery1", "mystery2"]
}
`;

    const system = `You are an expert YA series architect who creates comprehensive,
professional series bibles. You think in arcs, not scenes. You build worlds with
depth and characters with complexity. Your bibles become law for the entire series.`;

    const response = await runChatCompletion({
      model: model || "gpt-4.1-mini",
      system,
      prompt,
      jsonResponse: true,
      maxTokens: 6000,
    });

    const { error } = await supabaseAdmin.from("series_bibles").upsert({
      series_id: seriesId,
      world_overview: response.world_overview ?? "",
      world_rules: response.world_rules ?? "",
      history_lore: response.history_lore ?? "",
      character_files: response.character_files ?? {},
      relationship_map: response.relationship_map ?? {},
      series_arc_summary: response.series_arc_summary ?? "",
      themes_symbols: response.themes_symbols ?? [],
      story_rules: response.story_rules ?? [],
      continuity_lockfile: response.continuity_lockfile ?? [],
      unanswered_mysteries: response.unanswered_mysteries ?? [],
    });

    if (error) throw error;

    return NextResponse.json({ bible: response });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate series bible" },
      { status: 500 }
    );
  }
}
