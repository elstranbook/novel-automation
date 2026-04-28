import { NextResponse } from "next/server";
import { runChatCompletion } from "@/lib/openaiClient";

type StoryDetails = Record<string, unknown>;

type PromotionalArticleRequest = {
  storyDetails: StoryDetails;
  model?: string;
  articleType?: string;
  lengthType?: string;
  tone?: string;
  ctaType?: string;
  includeLinks?: boolean;
};

const getStoryValue = (storyDetails: StoryDetails, key: string, fallback: string) => {
  const value = storyDetails[key];
  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }
  return fallback;
};

const parseArticleResponse = (response: string) => {
  let articleTitle = "";
  let articleContent = response.trim();

  if (response.includes("TITLE:") && response.includes("ARTICLE:")) {
    const [titlePart, contentPart] = response.split("ARTICLE:", 2);
    articleTitle = titlePart.replace("TITLE:", "").trim().split("\n")[0] ?? "";
    articleContent = contentPart.trim();
  } else if (response.includes("TITLE:")) {
    const lines = response.split("\n");
    for (let index = 0; index < lines.length; index += 1) {
      if (lines[index].includes("TITLE:")) {
        articleTitle = lines[index].replace("TITLE:", "").trim();
        articleContent = lines.slice(index + 1).join("\n").trim();
        break;
      }
    }
  }

  if (!articleTitle) {
    articleTitle = "Promotional Article";
  }

  return { title: articleTitle, content: articleContent };
};

export async function POST(request: Request) {
  try {
    const {
      storyDetails,
      model,
      articleType = "theme_analysis",
      lengthType = "medium",
      tone = "formal",
      ctaType = "medium",
      includeLinks = false,
      studioTitle,
    } = (await request.json()) as PromotionalArticleRequest & { studioTitle?: string };

    if (!storyDetails) {
      return NextResponse.json(
        { error: "Story details are required" },
        { status: 400 }
      );
    }

    const title = getStoryValue(
      { ...storyDetails, title: storyDetails?.title ?? studioTitle },
      "title",
      "Untitled"
    );
    const genre = getStoryValue(storyDetails, "genre", "Young Adult Fiction");
    const theme = getStoryValue(storyDetails, "story_theme", "Coming of age");
    const mainCharacter = getStoryValue(
      storyDetails,
      "main_character_name",
      "the protagonist"
    );
    const centralConflict = getStoryValue(
      storyDetails,
      "central_conflict",
      "a life-changing challenge"
    );
    const setting = getStoryValue(storyDetails, "setting", "modern day");
    const plotSummary = getStoryValue(
      storyDetails,
      "plot_summary",
      "A compelling young adult story"
    );
    const targetAge = getStoryValue(
      storyDetails,
      "target_age_range",
      "13-18"
    );

    const supportingCharacters = storyDetails.supporting_characters;
    let supportingCharactersText = "";
    if (Array.isArray(supportingCharacters)) {
      supportingCharactersText = supportingCharacters
        .map((character) => {
          if (character && typeof character === "object") {
            const record = character as Record<string, unknown>;
            const name = typeof record.name === "string" ? record.name : "Character";
            const description =
              typeof record.description === "string" ? record.description : "";
            return `- ${name}: ${description}`;
          }
          return `- ${String(character)}`;
        })
        .join("\n");
    } else if (typeof supportingCharacters === "string") {
      supportingCharactersText = supportingCharacters;
    }

    const articleTypes: Record<
      string,
      { name: string; focus: string; structure: string }
    > = {
      theme_analysis: {
        name: "Deep-Dive Theme Article",
        focus:
          "Explore why the themes matter and create emotional connection with readers. Analyze how the themes resonate with teen experiences.",
        structure:
          "Hook → Theme introduction → Theme exploration → Emotional resonance → Reader connection → CTA",
      },
      character_spotlight: {
        name: "Meet the Characters",
        focus:
          "Introduce character backstories, motivations, internal conflicts, and growth arcs. Make readers fall in love with the characters.",
        structure:
          "Hook → Protagonist intro → Character motivations → Internal conflicts → Supporting cast highlights → CTA",
      },
      author_journey: {
        name: "Behind the Scenes / Author Journey",
        focus:
          "Share the writing process, inspiration, challenges faced, and personal connection to the story.",
        structure:
          "Personal hook → Inspiration origin → Writing challenges → Emotional investment → Reader invitation → CTA",
      },
      world_building: {
        name: "World-Building Feature",
        focus:
          "Explore the setting, environment, cultural details, and atmosphere that make the story world come alive.",
        structure:
          "Setting hook → World introduction → Cultural details → Atmosphere → Immersive elements → CTA",
      },
      quote_spotlight: {
        name: "Quote Spotlight",
        focus:
          "Present 10-20 powerful, emotional quotes from the novel with brief commentary on each.",
        structure:
          "Introduction → Categorized quotes (hope, resilience, love, conflict) → Commentary → CTA",
      },
      lessons_learned: {
        name: "Lessons Teens Can Learn",
        focus:
          "Highlight moral lessons and educational value that resonate with teen readers and appeal to parents/educators.",
        structure:
          "Hook about teen struggles → Lesson 1-5 with examples → How book addresses each → Parent/educator appeal → CTA",
      },
      comparison_article: {
        name: "Fans of X Will Love Y",
        focus:
          "Compare to popular YA books, showing how readers who loved similar books will enjoy this one.",
        structure:
          "Hook → Similar book comparisons → Unique elements → Reader testimonial style → CTA",
      },
      symbolism_article: {
        name: "The Hidden Symbolism Article",
        focus:
          "Explain symbols, motifs, foreshadowing, and deeper meanings that enrich the reading experience.",
        structure:
          "Hook about hidden depths → Symbol explanations → Motif analysis → Foreshadowing reveals → Re-read invitation → CTA",
      },
      emotional_hook: {
        name: "Emotional Hook Article",
        focus:
          "Short, moving piece designed to be highly shareable on social media. Pure emotional appeal.",
        structure:
          "Emotional opening → Heart of the story → Emotional peak → Call to experience → CTA",
      },
      author_letter: {
        name: "Author Letter to Readers",
        focus: "A heartfelt, personal message from the author to potential readers.",
        structure:
          "Personal greeting → Why I wrote this → What it means to me → My hope for readers → Invitation → CTA",
      },
      problem_solution: {
        name: "Problem-Solution Article",
        focus:
          "Identify teen struggles and show how the book provides insight, comfort, or solutions.",
        structure:
          "Teen struggle identification → How the book addresses it → Character examples → Reader takeaways → CTA",
      },
      seo_review: {
        name: "SEO-Optimized Review-Style Article",
        focus:
          "Long-form, keyword-rich article written in an elegant review style for search engine optimization.",
        structure:
          "SEO title → Hook → Story summary → Character analysis → Theme exploration → Why read now → CTA",
      },
    };

    const lengthParams: Record<string, { words: string; description: string }> = {
      short: {
        words: "300-600",
        description: "concise, punchy, social media friendly",
      },
      medium: {
        words: "800-1200",
        description: "balanced, website-ready, comprehensive",
      },
      long: {
        words: "1500-2000",
        description: "detailed, SEO-optimized, blog-ready",
      },
    };

    const ctaTemplates: Record<string, string> = {
      soft: `If "${title}" speaks to your heart, I invite you to experience the journey for yourself.`,
      medium: `Discover "${title}" today and step into a world of emotion, resilience, and unforgettable characters.`,
      strong: `Get your copy of "${title}" now and start reading the YA novel readers can't stop talking about.`,
    };

    const articleInfo = articleTypes[articleType] ?? articleTypes.theme_analysis;
    const lengthInfo = lengthParams[lengthType] ?? lengthParams.medium;
    const ctaText = ctaTemplates[ctaType] ?? ctaTemplates.medium;

    const prompt = `
You are an expert YA fiction marketer, author brand strategist, and SEO-focused content writer.
Write an engaging, emotionally appealing, and persuasive article designed to promote the YA novel described below.

**INPUT DETAILS:**

Book Title: ${title}
Author Brand: Elstran Books
Genre: ${genre}

Book Summary: ${plotSummary}

Target Audience: YA readers aged ${targetAge}, fans of ${genre}

Themes: ${theme}

Main Character: ${mainCharacter}
Central Conflict: ${centralConflict}
Setting: ${setting}

Supporting Characters:
${supportingCharactersText || "Various supporting characters"}

Tone Preference: ${tone}

Call-to-Action Type: ${ctaType} sell
Suggested CTA: ${ctaText}

Article Length: ${lengthInfo.words} words (${lengthInfo.description})

Article Style: ${articleInfo.name}
Article Focus: ${articleInfo.focus}
Suggested Structure: ${articleInfo.structure}

**YOUR TASK:**

1. Create a compelling, benefit-driven title for the article
2. Produce a fully polished, publication-ready article
3. Use SEO best practices WITHOUT keyword stuffing
4. Use a strong hook in the introduction
5. Include emotional resonance, suspense, and curiosity where appropriate
6. Maintain the ${tone} tone throughout
7. End with the selected call-to-action style

**KEY REQUIREMENTS:**

- The article must subtly but powerfully encourage readers to buy the book
- Avoid sounding salesy; show value first, then invite action
- Use elegant, ${tone} language with warmth
- Make it shareable on social media
- Use smooth transitions and strong structure

**AVOID:**
- Overly promotional language
- Spoiling major plot points
- Generic, template-sounding content
- Breaking the fourth wall about marketing

${includeLinks ? "Include placeholder links like [BOOK_LINK] where purchase links should go." : ""}

Format your response as follows:
TITLE: [Your article title here]

ARTICLE:
[Your full article content here]

Make the tone emotionally engaging, fast-paced, and tailored to teen readers.
Use hooks, curiosity, and relatable language. Avoid generic phrasing.
`;

    const system = `You are a bestselling YA book marketing expert and content strategist who creates viral, shareable content.
Your articles have helped numerous YA novels become bestsellers.
Write in a ${tone} tone that resonates with ${targetAge} year old readers and their parents/educators.
Create content that is both emotionally compelling and strategically effective for book marketing.
Write with an emotionally engaging, fast-paced tone tailored to teen readers, using hooks, curiosity, and relatable language while avoiding generic phrasing.`;

    const maxTokensMap: Record<string, number> = {
      short: 1200,
      medium: 2000,
      long: 3500,
    };

    const response = await runChatCompletion({
      model: model || "gpt-4.1-mini",
      system,
      prompt,
      jsonResponse: false,
      maxTokens: maxTokensMap[lengthType] ?? 2000,
    });

    const parsed = parseArticleResponse(String(response));

    return NextResponse.json({
      title: parsed.title,
      content: parsed.content,
      articleType,
      lengthType,
      tone,
      ctaType,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate promotional article" },
      { status: 500 }
    );
  }
}
