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

    const prompt = `
Create a prompt for a front cover design for the novel "${storyDetails.title ?? "Untitled"}" written by Elstran Books.

Guidelines:
– The cover should visually represent the core theme(s) of the novel—think mood, symbolism, and emotional tone.
– Focus on evocative imagery that captures the heart of the story and intrigues potential readers.
– Consider the genre, setting, and key motifs when building the scene.
– Include lighting, color palette, character presence (if needed), and symbolic elements that help tell the story at a glance.

Examples:
– For Fantasy: Use magical symbols, kingdoms, or weather elements
– For Thriller: Use high-contrast lighting, one character in danger, urban or remote settings
– For Romance: Focus on emotional expressions, warm colors, and connection between characters

Format the request like this:

Design a front cover for the novel "${storyDetails.title ?? "Untitled"}" by Elstran Books.
This novel is a ${storyDetails.genre ?? "Young Adult"} story with themes of ${
      storyDetails.story_theme ?? "transformation and growth"
    }.
The tone is ${storyDetails.mood ?? "reflective"} and the setting features ${
      storyDetails.setting ?? "a contemporary high school"
    }.
The cover should feature [Main visual concept that captures the story's essence].
Use a [Color palette/style] to reflect the mood of the story.
Optional: Include [Symbols, background elements, or objects that represent the deeper themes].

Make sure the title "${storyDetails.title ?? "Untitled"}" and author name "Elstran Books" are clearly visible on the cover.
`;

    const system = `You are a professional book cover designer. Create a detailed, specific cover design 
prompt for this novel. Focus on concrete visual elements, specific colors, and 
imagery that represents the theme. Avoid generic descriptions and instead provide 
actionable specifics that an illustrator could follow.`;

    const response = await runChatCompletion({
      model: model || "gpt-4.1-mini",
      system,
      prompt,
      jsonResponse: false,
    });

    return NextResponse.json({ prompt: response });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate cover prompt" },
      { status: 500 }
    );
  }
}
