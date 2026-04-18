import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, model = "dall-e-3", size = "1024x1792", novelId } = body;

    console.log("Generating image with direct fetch:", { model, size, promptLength: prompt?.length, novelId });

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API Key not configured" }, { status: 500 });
    }

    // 1. Generate Image from OpenAI
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        n: 1,
        size: size,
        quality: "standard"
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenAI API error:", errorData);
      return NextResponse.json({ error: "Failed to generate image" }, { status: response.status });
    }

    const data = await response.json();
    const tempUrl = data.data[0].url;

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
    console.error("DALL-E Fetch Route Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate image" },
      { status: 500 }
    );
  }
}
