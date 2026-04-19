import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, model = "gpt-image-1", size = "1024x1792", novelId } = body;

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
      // GPT Image models - no response_format, no size, quality is low/medium/high
      requestBody = {
        model: model,
        prompt: prompt,
        quality: "high"
      };
    } else {
      // DALL-E legacy models
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
    
    // GPT Image returns b64_json, DALL-E returns url
    const imageData = data.data[0];
    const hasUrl = !!imageData.url;
    const hasBase64 = !!imageData.b64_json;
    
    if (!hasUrl && !hasBase64) {
      return NextResponse.json({ error: "No image returned" }, { status: 500 });
    }

    const rawBase64 = imageData.b64_json || "";
    const rawUrl = imageData.url || "";

    // 2. Download the image and upload to Supabase Storage if novelId is provided
    let finalUrl = rawUrl || `data:image/png;base64,${rawBase64}`;
    
    if (novelId) {
      try {
        let arrayBuffer: ArrayBuffer;
        
        if (hasBase64) {
          // Use base64 directly
          const buffer = Buffer.from(rawBase64, "base64");
          arrayBuffer = buffer.buffer;
        } else {
          // Download from URL
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
          console.error("Storage upload error:", uploadError);
        } else {
          // Get public URL
          const { data: { publicUrl } } = supabaseAdmin
            .storage
            .from("novel-covers")
            .getPublicUrl(fileName);
          
          finalUrl = publicUrl;

          // 3. Update database

            
          // 4. Deactivate existing covers for this novel
await prisma.coverDesign.updateMany({
             where: { novelId: novelId },
             data: { isActive: false }
           });
            
          // 5. Save new cover to CoverDesign table
await prisma.coverDesign.create({
             data: {
               novelId,
               url: finalUrl,
               model: model,
               prompt: prompt,
               isActive: true
             }
           });
            
          console.log("Cover saved to database:", finalUrl);
          console.log("CoverDesign record created for novel:", novelId);
        }
      } catch (saveError) {
        console.error("Error saving image to storage:", saveError);
        // Fallback to data URL if saving fails
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
