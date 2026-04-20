import { NextResponse } from "next/server";

const buildStructuredNovel = (scenes: Record<string, string[]>, title?: string) => {
  const chapters = Object.entries(scenes).map(([chapterTitle, chapterScenes]) => {
    const [numberPart, ...titleParts] = chapterTitle.split(":");
    const number = numberPart?.trim() ?? "";
    const name = titleParts.join(":").trim();
    return {
      number,
      title: name,
      scenes: chapterScenes,
    };
  });

  return {
    title: title ?? "Untitled Novel",
    author: "AI Novel Generator",
    chapters,
  };
};

const formatScenesToText = (novelContent: ReturnType<typeof buildStructuredNovel>) => {
  const header = `${novelContent.title}\n${"=".repeat(novelContent.title.length)}\n\n`;
  const chapterText = novelContent.chapters
    .map((chapter) => {
      const titleLine = chapter.title
        ? `${chapter.number}: ${chapter.title}`
        : chapter.number;
      const scenes = chapter.scenes
        .map((scene, index) => `Scene ${index + 1}\n${scene}`)
        .join("\n\n");
      return `${titleLine}\n${"-".repeat(titleLine.length)}\n\n${scenes}`;
    })
    .join("\n\n");

  return `${header}${chapterText}`;
};

const formatScenesToMarkdown = (novelContent: ReturnType<typeof buildStructuredNovel>) => {
  return [
    `# ${novelContent.title}`,
    `*Author: ${novelContent.author}*`,
    "",
    ...novelContent.chapters.flatMap((chapter) => {
      const titleLine = chapter.title
        ? `${chapter.number}: ${chapter.title}`
        : chapter.number;
      const sceneLines = chapter.scenes.map(
        (scene, index) => `### Scene ${index + 1}\n\n${scene}`
      );
      return [`## ${titleLine}`, "", ...sceneLines, ""];
    }),
  ].join("\n");
};

const formatScenesToHtml = (novelContent: ReturnType<typeof buildStructuredNovel>) => {
  const chapters = novelContent.chapters
    .map((chapter) => {
      const titleLine = chapter.title
        ? `${chapter.number}: ${chapter.title}`
        : chapter.number;
      const sceneHtml = chapter.scenes
        .map(
          (scene, index) =>
            `<!----><h3>Scene ${index + 1}</h3><p>${scene.replace(/\n/g, "<br />")}</p>`
        )
        .join("");
      return `<!----><section><h2>${titleLine}</h2>${sceneHtml}</section>`;
    })
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>${novelContent.title}</title></head><body><h1>${novelContent.title}</h1><p><em>Author: ${novelContent.author}</em></p>${chapters}</body></html>`;
};

export async function POST(request: Request) {
  try {
    const { scenes, title } = await request.json();

    if (!scenes) {
      return NextResponse.json(
        { error: "Scenes are required" },
        { status: 400 }
      );
    }

    const novelContent = buildStructuredNovel(scenes, title);
    const formatted = {
      txt: formatScenesToText(novelContent),
      markdown: formatScenesToMarkdown(novelContent),
      html: formatScenesToHtml(novelContent),
    };

    return NextResponse.json({ formats: formatted });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to format novel" },
      { status: 500 }
    );
  }
}
