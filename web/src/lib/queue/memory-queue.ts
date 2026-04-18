/**
 * In-Memory Queue System for Background Rendering
 * 
 * Provides a simple queue implementation for processing render jobs.
 * In production, this would be replaced with BullMQ + Redis for scalability.
 */

import { v4 as uuidv4 } from 'uuid';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface RenderJobData {
  templateId: string;
  userImage: string;
  designX: number;
  designY: number;
  designScale: number;
  designRotation: number;
  colorSelections: Record<string, string>;
  exportWidth?: number;
  exportHeight?: number;
  warpPreset?: string;
}

export interface RenderJob {
  id: string;
  data: RenderJobData;
  status: JobStatus;
  progress: number;
  result?: {
    url: string;
    width: number;
    height: number;
  };
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  attempts: number;
  maxAttempts: number;
}

// In-memory job storage
const jobs = new Map<string, RenderJob>();

// Job queue (FIFO)
const queue: string[] = [];

// Processing flag
let isProcessing = false;

// Job processor function
let jobProcessor: ((job: RenderJob) => Promise<{ url: string; width: number; height: number }>) | null = null;

/**
 * Set the job processor function
 */
export function setJobProcessor(
  processor: (job: RenderJob) => Promise<{ url: string; width: number; height: number }>
): void {
  jobProcessor = processor;
}

/**
 * Add a new job to the queue
 */
export async function addJob(data: RenderJobData): Promise<RenderJob> {
  const job: RenderJob = {
    id: uuidv4(),
    data,
    status: 'pending',
    progress: 0,
    createdAt: new Date(),
    attempts: 0,
    maxAttempts: 3,
  };
  
  jobs.set(job.id, job);
  queue.push(job.id);
  
  // Start processing if not already
  processQueue();
  
  return job;
}

/**
 * Get a job by ID
 */
export function getJob(id: string): RenderJob | undefined {
  return jobs.get(id);
}

/**
 * Get all jobs (optionally filtered by status)
 */
export function getJobs(status?: JobStatus): RenderJob[] {
  const allJobs = Array.from(jobs.values());
  if (status) {
    return allJobs.filter(job => job.status === status);
  }
  return allJobs;
}

/**
 * Update job progress
 */
export function updateJobProgress(id: string, progress: number): void {
  const job = jobs.get(id);
  if (job) {
    job.progress = Math.min(100, Math.max(0, progress));
  }
}

/**
 * Update job status
 */
export function updateJobStatus(id: string, status: JobStatus): void {
  const job = jobs.get(id);
  if (job) {
    job.status = status;
    if (status === 'processing' && !job.startedAt) {
      job.startedAt = new Date();
    }
    if (status === 'completed' || status === 'failed') {
      job.completedAt = new Date();
    }
  }
}

/**
 * Process the queue
 */
async function processQueue(): Promise<void> {
  if (isProcessing || !jobProcessor) return;
  
  isProcessing = true;
  
  while (queue.length > 0) {
    const jobId = queue.shift();
    if (!jobId) continue;
    
    const job = jobs.get(jobId);
    if (!job) continue;
    
    // Skip if already processed
    if (job.status !== 'pending') continue;
    
    try {
      // Mark as processing
      updateJobStatus(jobId, 'processing');
      updateJobProgress(jobId, 10);
      
      // Process the job
      const result = await jobProcessor(job);
      
      // Mark as completed
      job.result = result;
      updateJobProgress(jobId, 100);
      updateJobStatus(jobId, 'completed');
    } catch (error) {
      console.error(`Job ${jobId} failed:`, error);
      
      job.attempts++;
      
      if (job.attempts < job.maxAttempts) {
        // Retry
        job.status = 'pending';
        job.progress = 0;
        queue.push(jobId);
      } else {
        // Max attempts reached
        job.error = error instanceof Error ? error.message : 'Unknown error';
        updateJobStatus(jobId, 'failed');
      }
    }
  }
  
  isProcessing = false;
}

/**
 * Clear completed jobs older than specified hours
 */
export function cleanupOldJobs(hoursOld: number = 24): number {
  const cutoff = new Date(Date.now() - hoursOld * 60 * 60 * 1000);
  let cleaned = 0;
  
  for (const [id, job] of jobs) {
    if (
      (job.status === 'completed' || job.status === 'failed') &&
      job.completedAt &&
      job.completedAt < cutoff
    ) {
      jobs.delete(id);
      cleaned++;
    }
  }
  
  return cleaned;
}

/**
 * Get queue statistics
 */
export function getQueueStats(): {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  queueLength: number;
} {
  const allJobs = Array.from(jobs.values());
  
  return {
    total: allJobs.length,
    pending: allJobs.filter(j => j.status === 'pending').length,
    processing: allJobs.filter(j => j.status === 'processing').length,
    completed: allJobs.filter(j => j.status === 'completed').length,
    failed: allJobs.filter(j => j.status === 'failed').length,
    queueLength: queue.length,
  };
}

/**
 * Cancel a pending job
 */
export function cancelJob(id: string): boolean {
  const job = jobs.get(id);
  if (!job) return false;
  
  if (job.status === 'pending') {
    job.status = 'failed';
    job.error = 'Cancelled by user';
    job.completedAt = new Date();
    
    // Remove from queue
    const index = queue.indexOf(id);
    if (index > -1) {
      queue.splice(index, 1);
    }
    
    return true;
  }
  
  return false;
}

/**
 * Clear all jobs (useful for testing)
 */
export function clearAllJobs(): void {
  jobs.clear();
  queue.length = 0;
}
