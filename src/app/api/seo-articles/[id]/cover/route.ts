import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const BUCKET_NAME = "novel-covers";

/**
 * Ensure the public image storage bucket exists. Creates it if missing.
 * Reuses the same bucket the novel cover uploader uses so we don't need
 * a second bucket configuration.
 */
async function ensureCoverBucket(): Promise<boolean> {
  const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
  if (listError) {
    console.error("❌ Error listing storage buckets:", listError.message);
    return false;
  }
  const bucketExists = buckets?.some((b) => b.name === BUCKET_NAME);
  if (bucketExists) return true;

  const { error: createError } = await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
  });
  if (createError) {
    console.error("❌ Error creating storage bucket:", createError.message);
    return false;
  }
  return true;
}

/**
 * POST /api/seo-articles/[id]/cover
 *
 * Upload a cover/hero image for a single SEO (blog) article.
 *
 * multipart/form-data:
 *   - file:   the image (png/jpg/webp, <=10MB)
 *   - userId: the article owner (used for authorization)
 *
 * Stores the image in Supabase Storage under `seo-articles/{articleId}/...`,
 * persists the resulting public URL on the article's `cover_image_url`
 * column, and returns `{ imageUrl, saved: true }`.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: articleId } = await params;
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const userId = formData.get("userId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
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

    // Verify the article exists and belongs to the requesting user.
    const { data: articleRow, error: articleError } = await supabaseAdmin
      .from("seo_articles")
      .select("id")
      .eq("id", articleId)
      .eq("user_id", userId)
      .maybeSingle();

    if (articleError || !articleRow) {
      return NextResponse.json(
        { error: "SEO article not found" },
        { status: 404 }
      );
    }

    // Ensure the storage bucket is available
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

    // Determine extension and build a clear, namespaced storage path
    const ext = file.type === "image/png" ? "png" : file.type === "image/jpeg" ? "jpg" : "webp";
    const storagePath = `seo-articles/${articleId}/cover_uploaded_${Date.now()}.${ext}`;

    const { error: uploadError } = await supabaseAdmin
      .storage
      .from(BUCKET_NAME)
      .upload(storagePath, imageBuffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("❌ SEO article cover storage upload error:", uploadError.message);
      return NextResponse.json(
        { error: "Failed to upload image to storage" },
        { status: 500 }
      );
    }

    // Resolve the public URL
    const { data: { publicUrl } } = supabaseAdmin
      .storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath);

    // Persist the cover URL on the article
    const { error: updateError } = await supabaseAdmin
      .from("seo_articles")
      .update({ cover_image_url: publicUrl, updated_at: new Date().toISOString() })
      .eq("id", articleId)
      .eq("user_id", userId);

    if (updateError) {
      console.error("❌ Failed to save cover URL on SEO article:", updateError.message);
      return NextResponse.json(
        { error: "Failed to save cover on article" },
        { status: 500 }
      );
    }

    console.log(`✅ SEO article cover saved: ${articleId} -> ${publicUrl}`);

    return NextResponse.json({ imageUrl: publicUrl, saved: true });
  } catch (error) {
    console.error("❌ SEO article cover upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload cover" },
      { status: 500 }
    );
  }
}
