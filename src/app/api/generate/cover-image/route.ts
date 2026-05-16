import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { runChatCompletion } from "@/lib/openaiClient";

/**
 * Ensure the novel-covers storage bucket exists. Creates it if missing.
 * Returns true if the bucket is ready, false otherwise.
 */
async function ensureCoverBucket(): Promise<boolean> {
  const BUCKET_NAME = "novel-covers";

  // Check if bucket exists
  const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();

  if (listError) {
    console.error("❌ Error listing storage buckets:", listError.message);
    return false;
  }

  const bucketExists = buckets?.some((b) => b.name === BUCKET_NAME);

  if (bucketExists) {
    return true;
  }

  // Bucket doesn't exist — create it
  console.log("📦 Creating missing 'novel-covers' storage bucket...");
  const { error: createError } = await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024, // 10MB limit
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
    const { prompt, model = "gpt-image-1", size = "1024x1792", novelId } = body;

    console.log("🖼️ Generating cover image:", { model, size, promptLength: prompt?.length, novelId });

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
      console.log("🧠 Reimagining cover prompt with GPT-5...");
      const reimagined = await runChatCompletion({
        model: "gpt-5",
        system: `You are an elite creative director and cinematic book cover prompt engineer.

Your task is to transform simple or weak book cover prompts into highly detailed, emotionally compelling, visually cinematic AI image prompts suitable for premium-quality novel covers.

The rewritten prompt must:
- Preserve the original story concept and genre
- Dramatically improve visual storytelling
- Add cinematic atmosphere and emotional depth
- Improve composition, lighting, symbolism, mood, wardrobe, environment, and color harmony
- Make the cover feel like a bestselling modern novel cover
- Include professional art direction language
- Avoid generic or flat descriptions
- Avoid cluttered scenes
- Keep the focus visually strong and marketable

When rewriting:
- Identify the genre automatically
- Match the tone to the genre
  - Romance → emotional, warm, intimate
  - Thriller → tense, dark, mysterious
  - Fantasy → epic, magical, atmospheric
  - Sci-fi → futuristic, sleek, dramatic
  - Christian → hopeful, uplifting, spiritual
  - Horror → unsettling, moody, cinematic
- Create strong focal points
- Use visually rich details
- Add realistic lighting and camera direction
- Include depth, texture, and cinematic framing
- Make characters visually expressive
- Include typography placement suggestions naturally if appropriate
- Make the final result optimized for vertical book cover generation

Output Requirements:
- Return ONLY the improved image-generation prompt
- Do NOT explain anything
- Do NOT use bullet points
- Write in one polished cinematic paragraph
- Keep it between 150–350 words
- Make it highly descriptive but coherent`,
        prompt: `Here is the original prompt to reimagine:\n\n${prompt}`,
        jsonResponse: false,
        maxTokens: 1500,
      });

      if (reimagined && typeof reimagined === "string" && reimagined.trim().length > 50) {
        enhancedPrompt = reimagined.trim();
        console.log("✅ Prompt reimagined successfully. Enhanced length:", enhancedPrompt.length);
      } else {
        console.warn("⚠️ Reimagined prompt was too short or empty, using original prompt");
      }
    } catch (reimagineError) {
      console.warn("⚠️ Prompt reimagination failed, using original prompt:", reimagineError instanceof Error ? reimagineError.message : reimagineError);
    }

    // 2. Generate Image from OpenAI API using the enhanced prompt
    let requestBody: Record<string, unknown>;

    if (model.includes("gpt-image-1")) {
      requestBody = { model, prompt: enhancedPrompt, quality: "high" };
    } else {
      requestBody = { model, prompt: enhancedPrompt, n: 1, size: "1024x1024", quality: "standard" };
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

    // 3. Prepare image buffer for upload
    let imageBuffer: Buffer | null = null;
    if (hasBase64) {
      imageBuffer = Buffer.from(rawBase64, "base64");
    } else if (rawUrl) {
      const imageRes = await fetch(rawUrl);
      const imageBlob = await imageRes.blob();
      imageBuffer = Buffer.from(await imageBlob.arrayBuffer());
    }

    // 4. Upload to Supabase Storage
    let finalUrl = "";
    let storageUploadSucceeded = false;

    if (novelId && imageBuffer) {
      // Ensure the storage bucket exists before uploading
      const bucketReady = await ensureCoverBucket();

      if (bucketReady) {
        try {
          const fileName = `${novelId}/cover_${Date.now()}.png`;

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
            console.log("✅ Cover uploaded to storage:", publicUrl);
          }
        } catch (storageError) {
          console.error("❌ Storage upload exception:", storageError);
        }
      } else {
        console.error("❌ Storage bucket 'novel-covers' is not available and could not be created");
      }

      // 5. Save cover record to database
      // Only save a persistent URL (storage public URL), NOT base64 data URLs (too large)
      if (!finalUrl) {
        // Storage failed — we don't have a persistent URL to save.
        // Return the base64 to the frontend for display, but don't persist it.
        finalUrl = `data:image/png;base64,${rawBase64}`;
        console.warn("⚠️ No persistent URL available — cover will display temporarily but won't persist after refresh");
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

        if (userId) {
          // Deactivate existing covers for this novel
          const { error: deactivateError } = await supabaseAdmin
            .from("cover_design_prompts")
            .update({ is_active: false })
            .eq("novel_id", novelId);

          if (deactivateError) {
            console.warn("⚠️ Could not deactivate existing covers:", deactivateError.message);
          }

          if (storageUploadSucceeded && finalUrl) {
            // Only insert a cover record if we have a persistent URL
            const { error: insertError } = await supabaseAdmin
              .from("cover_design_prompts")
              .insert({
                novel_id: novelId,
                user_id: userId,
                url: finalUrl,
                model: model,
                prompt: enhancedPrompt.substring(0, 5000), // Save the enhanced prompt
                is_active: true,
              });

            if (insertError) {
              console.error("❌ Error inserting cover record:", insertError.message);
            } else {
              console.log("✅ Cover record saved to database for novel:", novelId);
            }
          } else {
            console.warn("⚠️ Skipping DB cover record — no persistent storage URL available");
          }
        } else {
          console.warn("⚠️ Could not determine user_id for novel:", novelId);
        }
      } catch (dbError) {
        console.error("❌ Database save exception:", dbError);
      }
    } else {
      // No novelId — just return the image for display
      finalUrl = rawUrl || `data:image/png;base64,${rawBase64}`;
    }

    return NextResponse.json({
      imageUrl: finalUrl,
      saved: storageUploadSucceeded,
      enhancedPrompt: enhancedPrompt !== prompt ? enhancedPrompt : undefined,
    });
  } catch (error) {
    console.error("❌ Cover image generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate image" },
      { status: 500 }
    );
  }
}
