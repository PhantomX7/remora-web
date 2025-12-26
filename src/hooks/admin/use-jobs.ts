"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    getPaginatedJobsAction,
    getJobByIdAction,
    getJobLogsAction,
    getJobStatsAction,
    getRunningJobsAction,
    getJobTypesAction,
    getJobsByTypeAction,
    createJobAction,
    cancelJobAction,
    retryJobAction,
    deleteJobAction,
    cancelMultipleJobsAction,
    deleteMultipleJobsAction,
} from "@/actions/admin/job";
import { handleActionResult } from "@/lib/helpers";
import type { PaginationParams } from "@/types/pagination";
import type { Job, JobDetail, JobLog, CreateJobRequest } from "@/types/job";
import type { ApiError } from "@/types/common";

// ============================================================================
// Query Keys
// ============================================================================

export const JOB_QUERY_KEYS = {
    all: ["jobs"] as const,
    lists: () => [...JOB_QUERY_KEYS.all, "list"] as const,
    list: (params: PaginationParams) =>
        [...JOB_QUERY_KEYS.lists(), params] as const,
    listByType: (type: string, params: PaginationParams) =>
        [...JOB_QUERY_KEYS.lists(), "type", type, params] as const,
    details: () => [...JOB_QUERY_KEYS.all, "detail"] as const,
    detail: (id: number) => [...JOB_QUERY_KEYS.details(), id] as const,
    logs: (id: number) => [...JOB_QUERY_KEYS.all, "logs", id] as const,
    stats: () => [...JOB_QUERY_KEYS.all, "stats"] as const,
    running: () => [...JOB_QUERY_KEYS.all, "running"] as const,
    types: () => [...JOB_QUERY_KEYS.all, "types"] as const,
};

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Hook for fetching paginated jobs
 */
export function usePaginatedJobs(params: PaginationParams) {
    return useQuery({
        queryKey: JOB_QUERY_KEYS.list(params),
        queryFn: () => handleActionResult(getPaginatedJobsAction(params)),
        staleTime: 10 * 1000, // 10 seconds
    });
}

/**
 * Hook for fetching a single job by ID
 */
export function useJob(id: number) {
    return useQuery({
        queryKey: JOB_QUERY_KEYS.detail(id),
        queryFn: async () => {
            const result = await handleActionResult(getJobByIdAction(id));
            return result.data;
        },
        enabled: !!id && id > 0,
        staleTime: 5 * 1000, // 5 seconds
    });
}

/**
 * Hook for fetching job with auto-refresh for running jobs
 */
export function useJobWithPolling(id: number, isRunning: boolean = false) {
    return useQuery({
        queryKey: JOB_QUERY_KEYS.detail(id),
        queryFn: async () => {
            const result = await handleActionResult(getJobByIdAction(id));
            return result.data;
        },
        enabled: !!id && id > 0,
        staleTime: 5 * 1000,
        refetchInterval: isRunning ? 2000 : false, // Poll every 2s when running
    });
}

/**
 * Hook for fetching job logs
 */
export function useJobLogs(id: number, limit: number = 100) {
    return useQuery({
        queryKey: JOB_QUERY_KEYS.logs(id),
        queryFn: async () => {
            const result = await handleActionResult(getJobLogsAction(id, limit));
            return result.data;
        },
        enabled: !!id && id > 0,
        staleTime: 5 * 1000,
    });
}

/**
 * Hook for fetching job logs with polling for active jobs
 */
export function useJobLogsWithPolling(
    id: number,
    isRunning: boolean = false,
    limit: number = 100
) {
    return useQuery({
        queryKey: JOB_QUERY_KEYS.logs(id),
        queryFn: async () => {
            const result = await handleActionResult(getJobLogsAction(id, limit));
            return result.data;
        },
        enabled: !!id && id > 0,
        staleTime: 5 * 1000,
        refetchInterval: isRunning ? 3000 : false, // Poll every 3s when running
    });
}

/**
 * Hook for fetching job statistics
 */
export function useJobStats() {
    return useQuery({
        queryKey: JOB_QUERY_KEYS.stats(),
        queryFn: async () => {
            const result = await handleActionResult(getJobStatsAction());
            return result.data;
        },
        staleTime: 30 * 1000, // 30 seconds
    });
}

/**
 * Hook for fetching job statistics with auto-refresh
 */
export function useJobStatsWithPolling(enabled: boolean = true) {
    return useQuery({
        queryKey: JOB_QUERY_KEYS.stats(),
        queryFn: async () => {
            const result = await handleActionResult(getJobStatsAction());
            return result.data;
        },
        staleTime: 30 * 1000,
        refetchInterval: enabled ? 30000 : false, // Refresh every 30s
    });
}

/**
 * Hook for fetching running jobs
 */
export function useRunningJobs() {
    return useQuery({
        queryKey: JOB_QUERY_KEYS.running(),
        queryFn: async () => {
            const result = await handleActionResult(getRunningJobsAction());
            return result.data;
        },
        staleTime: 5 * 1000, // 5 seconds
    });
}

/**
 * Hook for fetching running jobs with polling
 */
export function useRunningJobsWithPolling(enabled: boolean = true) {
    return useQuery({
        queryKey: JOB_QUERY_KEYS.running(),
        queryFn: async () => {
            const result = await handleActionResult(getRunningJobsAction());
            return result.data;
        },
        staleTime: 5 * 1000,
        refetchInterval: enabled ? 5000 : false, // Poll every 5s
    });
}

/**
 * Hook for fetching registered job types
 */
export function useJobTypes() {
    return useQuery({
        queryKey: JOB_QUERY_KEYS.types(),
        queryFn: async () => {
            const result = await handleActionResult(getJobTypesAction());
            return result.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes (rarely changes)
    });
}

/**
 * Hook for fetching jobs by type
 */
export function useJobsByType(type: string, params: PaginationParams) {
    return useQuery({
        queryKey: JOB_QUERY_KEYS.listByType(type, params),
        queryFn: () => handleActionResult(getJobsByTypeAction(type, params)),
        enabled: !!type,
        staleTime: 10 * 1000,
    });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Hook for job mutations (create, cancel, retry, delete)
 */
export function useJobMutations() {
    const queryClient = useQueryClient();

    // Invalidate all job-related queries
    const invalidateAllJobs = () => {
        queryClient.invalidateQueries({ queryKey: JOB_QUERY_KEYS.all });
    };

    // Invalidate specific job
    const invalidateJob = (id: number) => {
        queryClient.invalidateQueries({ queryKey: JOB_QUERY_KEYS.detail(id) });
        queryClient.invalidateQueries({ queryKey: JOB_QUERY_KEYS.logs(id) });
    };

    // Create job mutation
    const createMutation = useMutation({
        mutationFn: (data: CreateJobRequest) =>
            handleActionResult(createJobAction(data)),
        onSuccess: (result) => {
            invalidateAllJobs();
            toast.success(`Job #${result.data?.id} created successfully`);
        },
        onError: (error: ApiError) => {
            toast.error(error.message || "Failed to create job");
        },
    });

    // Cancel job mutation
    const cancelMutation = useMutation({
        mutationFn: (id: number) => handleActionResult(cancelJobAction(id)),
        onSuccess: (_, id) => {
            invalidateAllJobs();
            invalidateJob(id);
            toast.success(`Job #${id} cancelled successfully`);
        },
        onError: (error: ApiError) => {
            toast.error(error.message || "Failed to cancel job");
        },
    });

    // Retry job mutation
    const retryMutation = useMutation({
        mutationFn: (id: number) => handleActionResult(retryJobAction(id)),
        onSuccess: (result, originalId) => {
            invalidateAllJobs();
            invalidateJob(originalId);
            toast.success(
                `Job #${originalId} retry created as Job #${result.data?.id}`
            );
        },
        onError: (error: ApiError) => {
            toast.error(error.message || "Failed to retry job");
        },
    });

    // Delete job mutation
    const deleteMutation = useMutation({
        mutationFn: (id: number) => handleActionResult(deleteJobAction(id)),
        onSuccess: (_, id) => {
            invalidateAllJobs();
            toast.success(`Job #${id} deleted successfully`);
        },
        onError: (error: ApiError) => {
            toast.error(error.message || "Failed to delete job");
        },
    });

    // Bulk cancel mutation
    const bulkCancelMutation = useMutation({
        mutationFn: (ids: number[]) =>
            handleActionResult(cancelMultipleJobsAction(ids)),
        onSuccess: (result) => {
            invalidateAllJobs();
            const { succeeded, failed } = result.data || {
                succeeded: [],
                failed: [],
            };
            if (succeeded.length > 0) {
                toast.success(`${succeeded.length} job(s) cancelled successfully`);
            }
            if (failed.length > 0) {
                toast.error(`${failed.length} job(s) failed to cancel`);
            }
        },
        onError: (error: ApiError) => {
            toast.error(error.message || "Failed to cancel jobs");
        },
    });

    // Bulk delete mutation
    const bulkDeleteMutation = useMutation({
        mutationFn: (ids: number[]) =>
            handleActionResult(deleteMultipleJobsAction(ids)),
        onSuccess: (result) => {
            invalidateAllJobs();
            const { succeeded, failed } = result.data || {
                succeeded: [],
                failed: [],
            };
            if (succeeded.length > 0) {
                toast.success(`${succeeded.length} job(s) deleted successfully`);
            }
            if (failed.length > 0) {
                toast.error(`${failed.length} job(s) failed to delete`);
            }
        },
        onError: (error: ApiError) => {
            toast.error(error.message || "Failed to delete jobs");
        },
    });

    return {
        createMutation,
        cancelMutation,
        retryMutation,
        deleteMutation,
        bulkCancelMutation,
        bulkDeleteMutation,
        invalidateAllJobs,
        invalidateJob,
    };
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Hook for tracking a single job's progress
 */
export function useJobProgress(id: number) {
    const { data: job, isLoading, error } = useJobWithPolling(
        id,
        true // Always poll initially, query will handle the logic
    );

    const isRunning = job?.status === "running";
    const isCompleted = job?.status === "completed";
    const isFailed = job?.status === "failed";
    const isCancelled = job?.status === "cancelled";
    const isTerminal = isCompleted || isFailed || isCancelled;

    return {
        job,
        isLoading,
        error,
        isRunning,
        isCompleted,
        isFailed,
        isCancelled,
        isTerminal,
        progress: job?.progress || 0,
        progressMessage: job?.progress_message || "",
    };
}

/**
 * Hook for job dashboard data
 */
export function useJobDashboard() {
    const stats = useJobStatsWithPolling(true);
    const runningJobs = useRunningJobsWithPolling(true);
    const jobTypes = useJobTypes();

    return {
        stats: stats.data,
        statsLoading: stats.isLoading,
        statsError: stats.error,
        runningJobs: runningJobs.data || [],
        runningJobsLoading: runningJobs.isLoading,
        runningJobsError: runningJobs.error,
        jobTypes: jobTypes.data || [],
        jobTypesLoading: jobTypes.isLoading,
        jobTypesError: jobTypes.error,
        isLoading: stats.isLoading || runningJobs.isLoading || jobTypes.isLoading,
        hasError: !!stats.error || !!runningJobs.error || !!jobTypes.error,
    };
}

/**
 * Prefetch job data
 */
export function usePrefetchJob() {
    const queryClient = useQueryClient();

    const prefetchJob = async (id: number) => {
        await queryClient.prefetchQuery({
            queryKey: JOB_QUERY_KEYS.detail(id),
            queryFn: async () => {
                const result = await handleActionResult(getJobByIdAction(id));
                return result.data;
            },
            staleTime: 5 * 1000,
        });
    };

    const prefetchJobLogs = async (id: number, limit: number = 100) => {
        await queryClient.prefetchQuery({
            queryKey: JOB_QUERY_KEYS.logs(id),
            queryFn: async () => {
                const result = await handleActionResult(
                    getJobLogsAction(id, limit)
                );
                return result.data;
            },
            staleTime: 5 * 1000,
        });
    };

    return {
        prefetchJob,
        prefetchJobLogs,
    };
}