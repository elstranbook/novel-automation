import { NextResponse } from "next/server";

const formatScenesToText = (scenes: Record<string, string[]>) => {
  return Object.entries(scenes)
    .map(([title, sceneList]) => {
      const chapterText = sceneList
        .map((scene, index) => `Scene ${index + 1}\n${scene}`)
        .join("\n\n");
      return `${title}\n${"=".repeat(title.length)}\n\n${chapterText}`;
    })
    .join("\n\n");
};

const formatScenesToMarkdown = (scenes: Record<string, string[]>) => {
  return Object.entries(scenes)
    .map(([title, sceneList]) => {
      const chapterText = sceneList
        .map((scene, index) => `### Scene ${index + 1}\n\n${scene}`)
        .join("\n\n");
      return `# ${title}\n\n${chapterText}`;
    })
    .join("\n\n");
};

const formatScenesToHtml = (scenes: Record<string, string[]>) => {
  const chapters = Object.entries(scenes)
    .map(([title, sceneList]) => {
      const sceneHtml = sceneList
        .map((scene, index) => `<!----><h3>Scene ${index + 1}</h3><p>${scene.replace(/\n/g, "<br />")}</p>`)
        .join("");
      return `<!----><section><h2>${title}</h2>${sceneHtml}</section>`;
    })
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Novel Export</title></head><body>${chapters}</body></html>`;
};

export async function POST(request: Request) {
  try {
    const { scenes } = await request.json();

    if (!scenes) {
      return NextResponse.json(
        { error: "Scenes are required" },
        { status: 400 }
      );
    }

    const formatted = {
      txt: formatScenesToText(scenes),
      markdown: formatScenesToMarkdown(scenes),
      html: formatScenesToHtml(scenes),
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
