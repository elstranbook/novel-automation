import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * Ensure the novel-covers storage bucket exists. Creates it if missing.
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

/**
 * POST /api/novel/covers/upload
 * Upload a custom cover image from the user's device to Supabase Storage
 * and save a record in the cover_design_prompts table.
 *
 * Accepts multipart/form-data with:
 *   - file: the image file (png, jpg, webp)
 *   - novelId: the novel UUID
 */
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const novelId = formData.get("novelId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!novelId) {
      return NextResponse.json({ error: "novelId is required" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PNG, JPEG, and WebP are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // Get user_id from novel
    const { data: novelRow, error: novelError } = await supabaseAdmin
      .from("novels")
      .select("user_id")
      .eq("id", novelId)
      .maybeSingle();

    if (novelError || !novelRow?.user_id) {
      console.error("❌ Error fetching novel for user_id:", novelError?.message);
      return NextResponse.json({ error: "Novel not found" }, { status: 404 });
    }

    const userId = novelRow.user_id;

    // Ensure the storage bucket exists
    const bucketReady = await ensureCoverBucket();
    if (!bucketReady) {
      return NextResponse.json(
        { error: "Storage bucket not available" },
        { status: 500 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    // Determine file extension
    const ext = file.type === "image/png" ? "png" : file.type === "image/jpeg" ? "jpg" : "webp";

    // Upload to Supabase Storage
    const fileName = `${novelId}/cover_uploaded_${Date.now()}.${ext}`;

    const { error: uploadError } = await supabaseAdmin
      .storage
      .from("novel-covers")
      .upload(fileName, imageBuffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("❌ Storage upload error:", uploadError.message);
      return NextResponse.json(
        { error: "Failed to upload image to storage" },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin
      .storage
      .from("novel-covers")
      .getPublicUrl(fileName);

    console.log("✅ Custom cover uploaded to storage:", publicUrl);

    // Deactivate existing covers for this novel
    const { error: deactivateError } = await supabaseAdmin
      .from("cover_design_prompts")
      .update({ is_active: false })
      .eq("novel_id", novelId);

    if (deactivateError) {
      console.warn("⚠️ Could not deactivate existing covers:", deactivateError.message);
    }

    // Save cover record to database
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from("cover_design_prompts")
      .insert({
        novel_id: novelId,
        user_id: userId,
        url: publicUrl,
        model: "custom-upload",
        prompt: "Custom uploaded cover image",
        is_active: true,
      })
      .select("id, url, is_active")
      .single();

    if (insertError) {
      console.error("❌ Error inserting cover record:", insertError.message);
      return NextResponse.json(
        { error: "Failed to save cover record" },
        { status: 500 }
      );
    }

    console.log("✅ Custom cover record saved to database for novel:", novelId);

    return NextResponse.json({
      imageUrl: publicUrl,
      saved: true,
      coverId: insertData.id,
    });
  } catch (error) {
    console.error("❌ Cover upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload cover" },
      { status: 500 }
    );
  }
}
