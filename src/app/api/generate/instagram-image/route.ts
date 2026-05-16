import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { runChatCompletion } from "@/lib/openaiClient";

/**
 * Ensure the novel-covers storage bucket exists. Creates it if missing.
 * Returns true if the bucket is ready, false otherwise.
 */
async function ensureCoverBucket(): Promise<boolean> {
  const BUCKET_NAME = "novel-covers";

  const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();

  if (listError) {
    console.error("❌ Error listing storage buckets:", listError.message);
    return false;
  }

  const bucketExists = buckets?.some((b) => b.name === BUCKET_NAME);

  if (bucketExists) {
    return true;
  }

  console.log("📦 Creating missing 'novel-covers' storage bucket...");
  const { error: createError } = await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
  });

  if (createError) {
    console.error("❌ Error creating 'novel-covers' bucket:", createError.message);
    return false;
  }

  console.log("✅ Created 'novel-covers' storage bucket successfully");
  return true;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, model = "gpt-image-2", novelId } = body;

    console.log("📸 Generating Instagram promotional image:", { model, promptLength: prompt?.length, novelId });

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API Key not configured" }, { status: 500 });
    }

    // 1. Reimagine the prompt with GPT-5 for cinematic quality
    let enhancedPrompt = prompt;
    try {
      console.log("🧠 Reimagining Instagram image prompt with GPT-5...");
      const reimagined = await runChatCompletion({
        model: "gpt-5",
        system: `You are an elite creative director and cinematic book cover prompt engineer specializing in Instagram marketing visuals.

Your task is to transform simple or weak book cover prompts into highly detailed, emotionally compelling, visually cinematic AI image prompts suitable for Instagram promotional campaigns.

The rewritten prompt must:
- Preserve the original story concept and genre
- Dramatically improve visual storytelling for Instagram
- Add cinematic atmosphere and emotional depth
- Optimize for 4:5 vertical portrait format (Instagram feed)
- Improve composition, lighting, symbolism, mood, wardrobe, environment, and color harmony
- Make the image feel like a premium bestselling novel ad campaign
- Include professional art direction language
- Avoid generic or flat descriptions
- Avoid cluttered scenes
- Keep the focus visually strong and marketable
- Prioritize thumbnail eye-catching appeal
- Leave room for optional text overlay

When rewriting:
- Identify the genre automatically
- Match the tone to the genre
  - Romance → emotional, warm, intimate
  - Thriller → tense, dark, mysterious
  - Fantasy → epic, magical, atmospheric
  - Sci-fi → futuristic, sleek, dramatic
  - Christian → hopeful, uplifting, spiritual
  - Horror → unsettling, moody, cinematic
- Create strong central composition
- Use visually rich details with premium color grading
- Add realistic lighting and camera direction
- Include depth, texture, and cinematic framing
- Make characters visually expressive
- Optimize for vertical 4:5 Instagram format
- Ensure the composition is eye-catching at thumbnail size
- Leave negative space for optional text overlays

Output Requirements:
- Return ONLY the improved image-generation prompt
- Do NOT explain anything
- Do NOT use bullet points
- Write in one polished cinematic paragraph
- Keep it between 150–350 words
- Make it highly descriptive but coherent`,
        prompt: `Here is the original prompt to reimagine for an Instagram promotional image:\n\n${prompt}`,
        jsonResponse: false,
        maxTokens: 1500,
      });

      if (reimagined && typeof reimagined === "string" && reimagined.trim().length > 50) {
        enhancedPrompt = reimagined.trim();
        console.log("✅ Instagram prompt reimagined successfully. Enhanced length:", enhancedPrompt.length);
      } else {
        console.warn("⚠️ Reimagined prompt was too short or empty, using original prompt");
      }
    } catch (reimagineError) {
      console.warn("⚠️ Prompt reimagination failed, using original prompt:", reimagineError instanceof Error ? reimagineError.message : reimagineError);
    }

    // 2. Wrap the enhanced prompt with Instagram style requirements
    const imagePrompt = `Create a premium Instagram promotional image in 4:5 portrait format.

${enhancedPrompt}

Requirements:
- optimized for Instagram engagement
- cinematic and highly aesthetic
- eye-catching thumbnail appearance
- strong central composition
- emotionally compelling
- premium modern color grading
- visually clean and uncluttered
- social-media-ready
- dramatic lighting
- room for optional text overlay
- ultra high detail`;

    // 3. Generate Image from OpenAI API
    let requestBody: Record<string, unknown>;

    if (model.includes("gpt-image-2")) {
      requestBody = { model, prompt: imagePrompt, size: "864x1152", quality: "high" };
    } else if (model.includes("gpt-image-1")) {
      requestBody = { model, prompt: imagePrompt, size: "864x1152", quality: "high" };
    } else {
      requestBody = { model, prompt: imagePrompt, n: 1, size: "1024x1024", quality: "standard" };
    }

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("❌ OpenAI API error:", errorData);
      return NextResponse.json({ error: `OpenAI error: ${errorData}` }, { status: response.status });
    }

    const data = await response.json();
    const imageData = data.data[0];
    const hasUrl = !!imageData.url;
    const hasBase64 = !!imageData.b64_json;

    if (!hasUrl && !hasBase64) {
      return NextResponse.json({ error: "No image returned" }, { status: 500 });
    }

    const rawBase64 = imageData.b64_json || "";
    const rawUrl = imageData.url || "";

    // 4. Prepare image buffer for upload
    let imageBuffer: Buffer | null = null;
    if (hasBase64) {
      imageBuffer = Buffer.from(rawBase64, "base64");
    } else if (rawUrl) {
      const imageRes = await fetch(rawUrl);
      const imageBlob = await imageRes.blob();
      imageBuffer = Buffer.from(await imageBlob.arrayBuffer());
    }

    // 5. Upload to Supabase Storage
    let finalUrl = "";
    let storageUploadSucceeded = false;

    if (novelId && imageBuffer) {
      const bucketReady = await ensureCoverBucket();

      if (bucketReady) {
        try {
          const fileName = `${novelId}/instagram_${Date.now()}.png`;

          const { error: uploadError } = await supabaseAdmin
            .storage
            .from("novel-covers")
            .upload(fileName, imageBuffer, {
              contentType: "image/png",
              upsert: true,
            });

          if (uploadError) {
            console.error("❌ Storage upload error:", uploadError.message);
          } else {
            const { data: { publicUrl } } = supabaseAdmin
              .storage
              .from("novel-covers")
              .getPublicUrl(fileName);

            finalUrl = publicUrl;
            storageUploadSucceeded = true;
            console.log("✅ Instagram image uploaded to storage:", publicUrl);
          }
        } catch (storageError) {
          console.error("❌ Storage upload exception:", storageError);
        }
      } else {
        console.error("❌ Storage bucket 'novel-covers' is not available and could not be created");
      }

      // 6. Save Instagram image record to database
      if (!finalUrl) {
        finalUrl = `data:image/png;base64,${rawBase64}`;
        console.warn("⚠️ No persistent URL available — Instagram image will display temporarily but won't persist after refresh");
      }

      try {
        const { data: novelRow, error: novelError } = await supabaseAdmin
          .from("novels")
          .select("user_id")
          .eq("id", novelId)
          .maybeSingle();

        if (novelError) {
          console.error("❌ Error fetching novel for user_id:", novelError.message);
        }

        const userId = novelRow?.user_id;

        if (userId && storageUploadSucceeded && finalUrl) {
          const { error: insertError } = await supabaseAdmin
            .from("cover_design_prompts")
            .insert({
              novel_id: novelId,
              user_id: userId,
              url: finalUrl,
              model: `instagram-${model}`,
              prompt: enhancedPrompt.substring(0, 5000),
              is_active: true,
            });

          if (insertError) {
            console.error("❌ Error inserting Instagram image record:", insertError.message);
          } else {
            console.log("✅ Instagram image record saved to database for novel:", novelId);
          }
        }
      } catch (dbError) {
        console.error("❌ Database save exception:", dbError);
      }
    } else {
      finalUrl = rawUrl || `data:image/png;base64,${rawBase64}`;
    }

    return NextResponse.json({
      imageUrl: finalUrl,
      saved: storageUploadSucceeded,
      enhancedPrompt: enhancedPrompt !== prompt ? enhancedPrompt : undefined,
    });
  } catch (error) {
    console.error("❌ Instagram image generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate Instagram image" },
      { status: 500 }
    );
  }
}
