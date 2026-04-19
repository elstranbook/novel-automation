import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, model = "gpt-image-1-mini", size = "1024x1792", novelId } = body;

    console.log("Generating image with GPT Image:", { model, size, promptLength: prompt?.length, novelId });

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
      // GPT Image models
      requestBody = {
        model: model,
        prompt: prompt,
        response_format: "url",
        quality: "medium",
        size: "auto"
      };
    } else {
      // DALL-E legacy models
      requestBody = {
        model: model,
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        response_format: "url"
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
    
    // GPT Image returns b64_json by default, need to handle both formats
    let tempUrl: string;
    if (data.data[0].url) {
      tempUrl = data.data[0].url;
    } else if (data.data[0].b64_json) {
      // Convert base64 to URL by uploading to a temporary place or return the data
      const imageBuffer = Buffer.from(data.data[0].b64_json, "base64");
      const blob = new Blob([imageBuffer], { type: "image/png" });
      const url = URL.createObjectURL(blob);
      tempUrl = url;
    } else {
      return NextResponse.json({ error: "No image returned" }, { status: 500 });
    }

    // 2. Download the image and upload to Supabase Storage if novelId is provided
    let finalUrl = tempUrl;
    if (novelId) {
      try {
        const imageRes = await fetch(tempUrl);
        const imageBlob = await imageRes.blob();
        const arrayBuffer = await imageBlob.arrayBuffer();
        
        const fileName = `${novelId}/cover_${Date.now()}.png`;
        
        const { data: uploadData, error: uploadError } = await supabaseAdmin
          .storage
          .from("novel-covers")
          .upload(fileName, arrayBuffer, {
            contentType: "image/png",
            upsert: true
          });

        if (uploadError) {
          console.error("Storage upload error:", uploadError);
        } else {
          // Get public URL
          const { data: { publicUrl } } = supabaseAdmin
            .storage
            .from("novel-covers")
            .getPublicUrl(fileName);
          
          finalUrl = publicUrl;

          // 3. Update database
          await supabaseAdmin
            .from("novels")
            .update({ cover_url: finalUrl })
            .eq("id", novelId);
            
          console.log("Cover saved and database updated:", finalUrl);
        }
      } catch (saveError) {
        console.error("Error saving image to storage:", saveError);
        // Fallback to tempUrl if saving fails
      }
    }

    return NextResponse.json({ imageUrl: finalUrl });
  } catch (error) {
    console.error("GPT Image Fetch Route Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate image" },
      { status: 500 }
    );
  }
}
