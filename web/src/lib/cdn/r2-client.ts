/**
 * Cloudflare R2 CDN Client
 * 
 * Provides upload and retrieval functionality for rendered mockups.
 * Falls back to local storage if R2 credentials are not configured.
 */

import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';

// Check if R2 is configured
const R2_CONFIGURED = 
  process.env.R2_ENDPOINT && 
  process.env.R2_ACCESS_KEY_ID && 
  process.env.R2_SECRET_ACCESS_KEY &&
  process.env.R2_BUCKET;

// Local storage path for fallback
const LOCAL_STORAGE_PATH = join(process.cwd(), 'public', 'renders');

// Initialize S3 client for R2 if configured
let r2Client: S3Client | null = null;

if (R2_CONFIGURED) {
  r2Client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

// Ensure local storage directory exists
function ensureLocalStorage() {
  if (!existsSync(LOCAL_STORAGE_PATH)) {
    mkdirSync(LOCAL_STORAGE_PATH, { recursive: true });
  }
}

/**
 * Upload a file to storage (R2 or local)
 */
export async function uploadToStorage(
  buffer: Buffer,
  key: string,
  contentType: string = 'image/png'
): Promise<{ url: string; storageType: 'r2' | 'local' }> {
  // Use R2 if configured
  if (R2_CONFIGURED && r2Client) {
    try {
      await r2Client.send(new PutObjectCommand({
        Bucket: process.env.R2_BUCKET!,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }));
      
      const cdnUrl = process.env.R2_PUBLIC_BASE_URL || `${process.env.R2_ENDPOINT}/${process.env.R2_BUCKET}`;
      return {
        url: `${cdnUrl}/${key}`,
        storageType: 'r2',
      };
    } catch (error) {
      console.error('R2 upload failed, falling back to local:', error);
      // Fall through to local storage
    }
  }
  
  // Local storage fallback
  ensureLocalStorage();
  const filePath = join(LOCAL_STORAGE_PATH, key);
  
  // Ensure the subdirectory exists
  const directory = join(filePath, '..');
  if (!existsSync(directory)) {
    mkdirSync(directory, { recursive: true });
  }
  
  writeFileSync(filePath, buffer);
  
  return {
    url: `/renders/${key}`,
    storageType: 'local',
  };
}

/**
 * Get a file from storage (R2 or local)
 */
export async function getFromStorage(key: string): Promise<Buffer | null> {
  // Try R2 first if configured
  if (R2_CONFIGURED && r2Client) {
    try {
      const response = await r2Client.send(new GetObjectCommand({
        Bucket: process.env.R2_BUCKET!,
        Key: key,
      }));
      
      if (response.Body) {
        return Buffer.from(await response.Body.transformToByteArray());
      }
    } catch (error) {
      console.error('R2 get failed, trying local:', error);
      // Fall through to local storage
    }
  }
  
  // Local storage fallback
  const filePath = join(LOCAL_STORAGE_PATH, key);
  if (existsSync(filePath)) {
    return readFileSync(filePath);
  }
  
  return null;
}

/**
 * List files in storage (R2 or local)
 */
export async function listStorage(prefix: string = ''): Promise<string[]> {
  // Try R2 first if configured
  if (R2_CONFIGURED && r2Client) {
    try {
      const response = await r2Client.send(new ListObjectsV2Command({
        Bucket: process.env.R2_BUCKET!,
        Prefix: prefix,
      }));
      
      return (response.Contents || []).map(obj => obj.Key).filter((key): key is string => key !== undefined);
    } catch (error) {
      console.error('R2 list failed, trying local:', error);
      // Fall through to local storage
    }
  }
  
  // Local storage fallback
  ensureLocalStorage();
  const files = readdirSync(LOCAL_STORAGE_PATH, { recursive: true, encoding: 'utf-8' });
  return files.filter(file => file.startsWith(prefix));
}

/**
 * Generate a unique key for a render
 */
export function generateRenderKey(templateId: string, userId?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const userPrefix = userId ? `${userId}/` : '';
  return `${userPrefix}renders/${templateId}/${timestamp}-${random}.png`;
}

/**
 * Generate a unique key for an uploaded image
 */
export function generateUploadKey(filename: string, userId?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const userPrefix = userId ? `${userId}/` : '';
  const ext = filename.split('.').pop() || 'png';
  return `${userPrefix}uploads/${timestamp}-${random}.${ext}`;
}

/**
 * Check if storage is available
 */
export function isStorageAvailable(): { available: boolean; type: 'r2' | 'local' | 'none' } {
  if (R2_CONFIGURED) {
    return { available: true, type: 'r2' };
  }
  
  try {
    ensureLocalStorage();
    return { available: true, type: 'local' };
  } catch {
    return { available: false, type: 'none' };
  }
}

/**
 * Get the public URL for a stored file
 */
export function getPublicUrl(key: string): string {
  if (R2_CONFIGURED && process.env.R2_PUBLIC_BASE_URL) {
    return `${process.env.R2_PUBLIC_BASE_URL}/${key}`;
  }
  
  return `/renders/${key}`;
}

/**
 * Storage stats
 */
export async function getStorageStats(): Promise<{
  type: 'r2' | 'local';
  fileCount: number;
  totalSize?: number;
}> {
  if (R2_CONFIGURED && r2Client) {
    try {
      const response = await r2Client.send(new ListObjectsV2Command({
        Bucket: process.env.R2_BUCKET!,
      }));
      
      const contents = response.Contents || [];
      const totalSize = contents.reduce((sum, obj) => sum + (obj.Size || 0), 0);
      
      return {
        type: 'r2',
        fileCount: contents.length,
        totalSize,
      };
    } catch (error) {
      console.error('R2 stats failed:', error);
    }
  }
  
  // Local stats
  ensureLocalStorage();
  const files = readdirSync(LOCAL_STORAGE_PATH, { recursive: true, encoding: 'utf-8' });
  
  return {
    type: 'local',
    fileCount: files.length,
  };
}
