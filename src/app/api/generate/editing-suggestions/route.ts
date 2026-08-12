import { NextResponse } from "next/server";
import { runChatCompletion } from "@/lib/openaiClient";
import { resolveModel, PipelineStep } from "@/lib/modelDefaults";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const { text, model, contentId, contentType } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    let contentSpecificGuidance = "";
    if (contentType === "scene") {
      contentSpecificGuidance = `
Focus on these elements specific to scenes:
- Scene structure and pacing
- Dialogue effectiveness and authenticity
- Character reactions and internal thoughts
- Sensory details and setting immersion
- Emotional impact and resonance
- Tension and conflict effectiveness
- Character interactions and dialogue effectiveness
- Scene purpose and advancement of plot
- Balance of showing vs telling
`;
    } else if (contentType === "chapter") {
      contentSpecificGuidance = `
Focus on these elements specific to chapters:
- Chapter arc and structure
- Hook and closing effectiveness
- Character development
- Advancement of plot and subplots
- Theme development
`;
    } else if (contentType === "character") {
      contentSpecificGuidance = `
Focus on these elements specific to character descriptions:
- Character depth and complexity
- Distinctiveness of voice and personality
- Character motivation clarity
- Potential for growth and development
- Relatability for the intended audience
`;
    }

    const prompt = `
As a professional fiction editor, analyze the following text and provide detailed editing suggestions.

${contentSpecificGuidance}

The text to analyze:
"""
${text}
"""

Provide your analysis in the following categories:

1. Overall Assessment: A brief paragraph summarizing the strengths and weaknesses of the piece.

2. Key Strengths: Identify 2-4 specific elements that work well in the piece.

3. Areas for Improvement: Identify 2-4 specific elements that could be improved.

4. Specific Suggestions: Provide 3-5 actionable suggestions for improving the text, with concrete examples where possible.

Format your response as a JSON object with these keys:
- "overall_assessment": Your summary assessment (string)
- "strengths": Array of strengths (array of strings)
- "weaknesses": Array of areas to improve (array of strings)
- "suggestions": Array of specific, actionable suggestions (array of strings)
`;

    const system = `You are an experienced fiction editor with expertise in developmental editing,
line editing, and substantive editing. Your feedback should be constructive, specific, and actionable.
Match the text's genre and audience; do not assume Young Adult unless the material calls for it.
Preserve the author's unique voice. Balance positive feedback with areas for improvement.`;

    const response = await runChatCompletion({
      model: resolveModel(model, PipelineStep.EDITING_SUGGESTIONS),
      system,
      prompt,
      jsonResponse: true,
    });

    return NextResponse.json({
      contentId,
      contentType,
      suggestions: response,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate editing suggestions" },
      { status: 500 }
    );
  }
}
