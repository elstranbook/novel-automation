import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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

    // 1. Generate Image from OpenAI API
    let requestBody: Record<string, unknown>;

    if (model.includes("gpt-image-1")) {
      requestBody = { model, prompt, quality: "high" };
    } else {
      requestBody = { model, prompt, n: 1, size: "1024x1024", quality: "standard" };
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

    // 2. Prepare image buffer for upload
    let imageBuffer: Buffer | null = null;
    if (hasBase64) {
      imageBuffer = Buffer.from(rawBase64, "base64");
    } else if (rawUrl) {
      const imageRes = await fetch(rawUrl);
      const imageBlob = await imageRes.blob();
      imageBuffer = Buffer.from(await imageBlob.arrayBuffer());
    }

    // 3. Upload to Supabase Storage
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

      // 4. Save cover record to database
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
                prompt: prompt.substring(0, 5000), // Truncate very long prompts
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
    });
  } catch (error) {
    console.error("❌ Cover image generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate image" },
      { status: 500 }
    );
  }
}
