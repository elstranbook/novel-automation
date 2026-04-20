import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, model = "gpt-image-1", size = "1024x1792", novelId } = body;

    console.log("🖼️ Generating image with GPT Image:", { model, size, promptLength: prompt?.length, novelId });

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API Key not configured" }, { status: 500 });
    }

    // 1. Generate Image from OpenAI GPT Image API
    const isGptImage = model.includes("gpt-image-1");
    
    // Build request based on model type
    let requestBody: Record<string, unknown>;
    
    if (model.includes("gpt-image-1")) {
      requestBody = {
        model: model,
        prompt: prompt,
        quality: "high"
      };
    } else {
      requestBody = {
        model: model,
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard"
      };
    }
    
    console.log("Image request:", { model, promptLength: prompt?.length });
    
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenAI API error:", errorData);
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

    // 2. Upload to Supabase Storage (if novelId provided)
    let finalUrl = rawUrl || `data:image/png;base64,${rawBase64}`;
    let storageUploadSucceeded = false;
    
    if (novelId) {
      try {
        let arrayBuffer: ArrayBuffer;
        
        if (hasBase64) {
          const buffer = Buffer.from(rawBase64, "base64");
          arrayBuffer = buffer.buffer;
        } else {
          const imageRes = await fetch(rawUrl);
          const imageBlob = await imageRes.blob();
          arrayBuffer = await imageBlob.arrayBuffer();
        }
        
        const fileName = `${novelId}/cover_${Date.now()}.png`;
        
        const { data: uploadData, error: uploadError } = await supabaseAdmin
          .storage
          .from("novel-covers")
          .upload(fileName, arrayBuffer, {
            contentType: "image/png",
            upsert: true
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
          console.log("✅ Storage upload succeeded. Public URL:", publicUrl);
        }
      } catch (storageError) {
        console.error("❌ Storage upload exception:", storageError);
      }

      // 3. ALWAYS save cover record to database — even if storage upload failed
      //    If storage failed, finalUrl will be the temporary OpenAI URL or base64 data URL
      try {
        // Get user_id from the novels table
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
          // Deactivate existing covers for this novel (best-effort, won't fail if column doesn't exist)
          const { error: deactivateError } = await supabaseAdmin
            .from("cover_design_prompts")
            .update({ is_active: false })
            .eq("novel_id", novelId);

          if (deactivateError) {
            console.warn("⚠️ Could not deactivate existing covers (may need migration):", deactivateError.message);
          }

          // Save new cover to cover_design_prompts table
          const { error: insertError } = await supabaseAdmin
            .from("cover_design_prompts")
            .insert({
              novel_id: novelId,
              user_id: userId,
              url: finalUrl,
              model: model,
              prompt: prompt,
              is_active: true,
            });

          if (insertError) {
            console.error("❌ Error inserting cover record:", insertError.message);
            console.error("❌ Full insert error:", JSON.stringify(insertError));
          } else {
            console.log("✅ Cover record saved to database for novel:", novelId);
            console.log("✅ Cover URL:", finalUrl.substring(0, 80) + "...");
          }
        } else {
          console.warn("⚠️ Could not determine user_id for novel:", novelId, "- skipping cover DB record");
        }
      } catch (dbError) {
        console.error("❌ Database save exception:", dbError);
      }
    }

    return NextResponse.json({ 
      imageUrl: finalUrl,
      saved: storageUploadSucceeded,
    });
  } catch (error) {
    console.error("GPT Image Fetch Route Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate image" },
      { status: 500 }
    );
  }
}
