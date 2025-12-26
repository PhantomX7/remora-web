// ============================================================================
// Job Status and Enums
// ============================================================================

export type JobStatus =
    | "pending"
    | "running"
    | "completed"
    | "failed"
    | "cancelled";

export type LogLevel = "debug" | "info" | "warning" | "error";

// ============================================================================
// Job Models
// ============================================================================

export interface Job {
    id: number;
    type: string;
    status: JobStatus;
    priority: number;
    progress: number;
    progress_message: string;
    total_items: number;
    processed_items: number;
    retry_count: number;
    max_retries: number;
    error?: string;
    scheduled_at?: string;
    started_at?: string;
    completed_at?: string;
    created_at: string;
    updated_at: string;
}

export interface JobDetail extends Job {
    payload?: Record<string, unknown>;
    result?: Record<string, unknown>;
    logs?: JobLog[];
}

export interface JobLog {
    id: number;
    level: LogLevel;
    message: string;
    metadata?: Record<string, unknown>;
    created_at: string;
}

export interface JobType {
    type: string;
    display_name: string;
    description: string;
    max_retries: number;
    timeout: string;
}

// ============================================================================
// Job Statistics
// ============================================================================

export interface JobTypeStats {
    type: string;
    display_name: string;
    pending: number;
    running: number;
    completed: number;
    failed: number;
    cancelled: number;
    avg_duration_seconds: number;
    success_rate: number;
}

export interface JobStatusCounts {
    pending: number;
    running: number;
    completed: number;
    failed: number;
    cancelled: number;
}

export interface JobStats {
    by_type: Record<string, JobTypeStats>;
    total: JobStatusCounts;
}

// ============================================================================
// Request Types
// ============================================================================

export interface CreateJobRequest {
    type: string;
    payload?: Record<string, unknown>;
    priority?: number;
    max_retries?: number;
    scheduled_at?: string;
}

// ============================================================================
// Filter Types for Pagination
// ============================================================================

export interface JobFilters {
    type?: string;
    status?: JobStatus;
    priority?: number;
    created_by?: number;
}

// ============================================================================
// Helper Types
// ============================================================================

export interface JobProgressInfo {
    progress: number;
    progressMessage: string;
    totalItems: number;
    processedItems: number;
}

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
    pending: "Pending",
    running: "Running",
    completed: "Completed",
    failed: "Failed",
    cancelled: "Cancelled",
};

export const JOB_STATUS_COLORS: Record<JobStatus, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    running: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    cancelled: "bg-gray-100 text-gray-800",
};

export const LOG_LEVEL_COLORS: Record<LogLevel, string> = {
    debug: "text-gray-500",
    info: "text-blue-600",
    warning: "text-yellow-600",
    error: "text-red-600",
};

// ============================================================================
// Utility Functions
// ============================================================================

export const isTerminalStatus = (status: JobStatus): boolean => {
    return ["completed", "failed", "cancelled"].includes(status);
};

export const canRetryJob = (job: Job): boolean => {
    return job.status === "failed" && job.retry_count < job.max_retries;
};

export const canCancelJob = (job: Job): boolean => {
    return ["pending", "running"].includes(job.status);
};

export const canDeleteJob = (job: Job): boolean => {
    return isTerminalStatus(job.status);
};

export const formatDuration = (seconds: number): string => {
    if (seconds < 60) {
        return `${Math.round(seconds)}s`;
    }
    if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.round(seconds % 60);
        return `${minutes}m ${secs}s`;
    }
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
};

export const getProgressPercentage = (job: Job): number => {
    if (job.total_items === 0) return job.progress;
    return Math.round((job.processed_items / job.total_items) * 100);
};