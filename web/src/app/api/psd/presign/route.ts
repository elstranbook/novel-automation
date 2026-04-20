import { NextRequest, NextResponse } from 'next/server';
import { generatePresignedUploadUrl, generateUploadKey } from '@/lib/cdn/r2-client';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/psd/presign - Get a presigned URL for direct upload to R2
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename') || 'template.psd';
    const contentType = searchParams.get('contentType') || 'application/x-photoshop';
    
    // Generate a unique key for the PSD
    const psdId = uuidv4();
    const key = `psd/${psdId}/${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    // Generate presigned upload URL
    const result = await generatePresignedUploadUrl(key, contentType, 3600);
    
    if (!result) {
      return NextResponse.json(
        { error: 'Storage not configured. Please set R2 environment variables.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      uploadUrl: result.uploadUrl,
      key: result.key,
      psdId,
      publicUrl: result.publicUrl,
    });
  } catch (error) {
    console.error('Presign error:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}