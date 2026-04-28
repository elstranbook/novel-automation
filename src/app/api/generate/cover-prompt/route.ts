import { NextResponse } from "next/server";
import { runChatCompletion } from "@/lib/openaiClient";

export async function POST(request: Request) {
  try {
    const { storyDetails, model, studioTitle } = await request.json();

    if (!storyDetails) {
      return NextResponse.json(
        { error: "Story details are required" },
        { status: 400 }
      );
    }

    const title = storyDetails.title ?? studioTitle ?? "Untitled";
    const genre = storyDetails.genre ?? "Young Adult";
    const theme = storyDetails.story_theme ?? "transformation and growth";
    const mood = storyDetails.mood ?? "reflective";
    const setting = storyDetails.setting ?? "a contemporary high school";

    const prompt = `
Create a highly detailed AI image prompt for a professional front book cover.

BOOK DETAILS:
Title: ${title}
Author: Elstran Books
Genre: ${genre}
Themes: ${theme}
Tone: ${mood}
Setting: ${setting}

REQUIREMENTS:

1. PRIMARY VISUAL SCENE
Describe a specific, concrete scene with clear subjects, environment, and emotional context. Avoid abstract phrasing.

2. COMPOSITION & LAYOUT
Specify a cinematic composition:
- Choose one: split-scene / centered subject / foreground-background contrast / silhouette
- Define focal point clearly
- Ensure clean negative space at top (title) and bottom (author)
- Use rule of thirds and strong visual hierarchy

3. ENVIRONMENT DETAILS
Add tangible world elements (architecture, props, textures, time of day, atmosphere).

4. LIGHTING
Define exact lighting conditions:
- Type: golden hour / dusk / soft window light / moody shadows / neon, etc.
- Include volumetric lighting, soft highlights, realistic falloff

5. COLOR GRADING
Specify a controlled palette:
- Warm vs cool contrast OR muted cinematic tones OR high contrast
- Emotionally aligned with theme

6. CAMERA & DEPTH
- Photorealistic
- 50mm lens look
- Shallow depth of field
- Background softly blurred (bokeh)

7. TEXTURE & RENDER QUALITY
- High detail
- Subtle film grain
- Soft bloom on highlights
- Matte, cinematic finish

8. SYMBOLIC ELEMENTS (OPTIONAL)
Include subtle visual metaphors if relevant (reflections, shadows, broken shapes, etc.)

9. TYPOGRAPHY PLACEMENT
- Title "${title}" at top center in modern serif/sans-serif, high contrast or soft glow
- Author "Elstran Books" at bottom, minimal clean font

10. OUTPUT QUALITY
End with:
"ultra high quality, highly detailed, professional publishing standard, visually striking, clear focal point, no clutter"

IMPORTANT:
Avoid vague phrases like "evocative", "beautiful", or "captures the essence".
Every element must be visually describable.
`;

    const system = `You are a senior book cover art director and AI image prompt engineer.

Your task is to generate highly structured, production-quality prompts optimized for image generation models.

You must:
- Use precise, concrete visual language (no vague or abstract phrasing)
- Specify composition, lighting, color grading, and depth explicitly
- Ensure the design is suitable for a professional book cover (clear focal point, readable typography space)
- Include cinematic and photographic details (lens, depth of field, lighting behavior)
- Maintain strong visual hierarchy and avoid clutter

Output prompts must be directly usable in image generation APIs and produce high-quality, publishable results.`;

    const response = await runChatCompletion({
      model: model || "gpt-4.1-mini",
      system,
      prompt,
      jsonResponse: false,
    });

    return NextResponse.json({ prompt: response, title });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate cover prompt" },
      { status: 500 }
    );
  }
}
