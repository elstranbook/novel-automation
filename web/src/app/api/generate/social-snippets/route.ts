import { NextResponse } from "next/server";
import { runChatCompletion } from "@/lib/openaiClient";

type StoryDetails = Record<string, unknown>;

type SocialSnippetsRequest = {
  storyDetails: StoryDetails;
  model?: string;
  articleContent?: string;
};

const getStoryValue = (storyDetails: StoryDetails, key: string, fallback: string) => {
  const value = storyDetails[key];
  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }
  return fallback;
};

export async function POST(request: Request) {
  try {
    const { storyDetails, model, articleContent } =
      (await request.json()) as SocialSnippetsRequest;

    if (!storyDetails) {
      return NextResponse.json(
        { error: "Story details are required" },
        { status: 400 }
      );
    }

    const title = getStoryValue(storyDetails, "title", "Untitled");
    const theme = getStoryValue(storyDetails, "story_theme", "Coming of age");
    const genre = getStoryValue(storyDetails, "genre", "Young Adult Fiction");

    let context = `Novel: ${title}\nGenre: ${genre}\nTheme: ${theme}`;
    if (articleContent) {
      context += `\n\nArticle excerpt: ${articleContent.slice(0, 500)}...`;
    }

    const prompt = `
Create social media promotional content for the YA novel "${title}".

${context}

Generate the following:

1. TWITTER/X POSTS (3 variations, max 280 characters each):
- One emotional hook
- One question to engage readers
- One quote-style post

2. INSTAGRAM CAPTIONS (2 variations, 100-150 words each):
- One storytelling style
- One behind-the-scenes style

3. TIKTOK SCRIPT (1, 30-60 seconds speaking time):
- Hook, story, call to action format

4. FACEBOOK POST (1, 200-300 words):
- Engaging, shareable, community-focused

5. NEWSLETTER TEASER (1, 50-75 words):
- Email-friendly, curiosity-building

Format each section clearly with headers.
`;

    const system =
      "You are a social media marketing expert specializing in YA book promotion. Create engaging, platform-appropriate content that drives book discovery and purchases.";

    const response = await runChatCompletion({
      model: model || "gpt-4.1-mini",
      system,
      prompt,
      jsonResponse: false,
      maxTokens: 2000,
    });

    return NextResponse.json({
      content: String(response),
      novelTitle: title,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate social snippets" },
      { status: 500 }
    );
  }
}
