import { NextResponse } from "next/server";
import { runChatCompletion } from "@/lib/openaiClient";

export async function POST(request: Request) {
  try {
    const { storyDetails, model } = await request.json();

    if (!storyDetails) {
      return NextResponse.json(
        { error: "Story details are required" },
        { status: 400 }
      );
    }

    const theme = storyDetails.story_theme ?? "Growth and self-discovery";
    const genre = storyDetails.genre ?? "Young Adult Fiction";
    const concept = storyDetails.central_concept ?? "A teenager discovering their hidden abilities";
    const novelAbout = storyDetails.novel_about ?? "";

    const seriesContext = storyDetails.series_context ?? null;
    let seriesGuidance = "";
    if (seriesContext) {
      const bookNumber = seriesContext.book_number ?? 1;
      const totalBooks = seriesContext.total_books ?? 1;
      seriesGuidance = `
This novel is Book ${bookNumber} of ${totalBooks} in a series.

Series Title: ${seriesContext.series_title ?? "Untitled Series"}
Series Arc: ${seriesContext.series_arc ?? "No series arc provided"}

Book's role in the series arc: `;

      if (bookNumber === 1) {
        seriesGuidance += "This is the FIRST book in the series. It should establish characters, world, and the main series conflict.";
      } else if (bookNumber === totalBooks) {
        seriesGuidance += "This is the FINAL book in the series. It should resolve the main series arc while delivering a satisfying conclusion.";
      } else {
        const position = bookNumber <= totalBooks / 2 ? "early" : "later";
        seriesGuidance += `This is book #${bookNumber} (a ${position} book in the series). It should advance the overall series arc while having its own complete story.`;
      }

      if (seriesContext.prior_books) {
        seriesGuidance += "\n\nThis book must maintain character continuity with previous books in the series.";
      }

      if (seriesContext.themes) {
        const themesList = seriesContext.themes.map((themeItem: string) => `- ${themeItem}`).join("\n");
        seriesGuidance += `\n\nSeries Themes to incorporate:\n${themesList}`;
      }
    }

    const prompt = `
Give me 10 ideas for the premise of a novel about the following:

Theme: ${theme}
Genre: ${genre}
Concept: ${concept}
${novelAbout ? `Novel About: ${novelAbout}\n` : ""}
${seriesGuidance}

Choose the best premise that will catch the attention of YA readers. Use it as "The Premise".

Then give me 10 ideas for how that novel could end (twists, resolutions, reveals, or character outcomes) for the chosen premise below:
{The Premise}

The endings can be thematic or emotional rather than final. Focus on where the character might end up, not just the plot twist.

From your 10 ending ideas, select the best ending that delivers the most satisfying and emotionally resonant conclusion. This will be used as "The Ending" in future prompts.

Format your response as a JSON object with these keys:
1. "premises": An array of 10 premises (strings)
2. "chosen_premise": The best premise you chose (string)
3. "potential_endings": An array of 10 potential endings (strings)
4. "chosen_ending": The best ending you selected (string)
`;

    const system = `You are a professional YA novelist skilled at creating compelling story premises and satisfying endings.
Focus on themes, emotional arcs, and character growth that resonate with young adult readers.
Provide a variety of premise ideas and ending possibilities that could engage teen readers.`;

    const response = await runChatCompletion({
      model: model || "gpt-4.1-mini",
      system,
      prompt,
      jsonResponse: true,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate premises and endings" },
      { status: 500 }
    );
  }
}
