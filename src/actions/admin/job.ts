"use server";

import type { ApiResponse, ActionResponse } from "@/types/common";
import type { PaginationParams } from "@/types/pagination";
import { adminApiClient } from "@/lib/api";
import { ADMIN_API_ENDPOINTS } from "@/lib/constants";
import { buildBackendUrl } from "@/lib/pagination/serverUtils";
import { handleApiError, extractApiData } from "@/lib/helpers";
import type {
    Job,
    JobDetail,
    JobLog,
    JobType,
    JobStats,
    CreateJobRequest,
} from "@/types/job";

// ============================================================================
// Job CRUD Actions
// ============================================================================

/**
 * Create a new job
 */
export async function createJobAction(
    data: CreateJobRequest
): Promise<ActionResponse<Job>> {
    try {
        const response = await adminApiClient().post<ApiResponse<Job>>(
            ADMIN_API_ENDPOINTS.JOBS.GENERAL,
            data
        );

        return extractApiData(response);
    } catch (error) {
        return handleApiError(error, "Failed to create job");
    }
}

/**
 * Get paginated list of jobs
 */
export async function getPaginatedJobsAction(
    params: PaginationParams
): Promise<ActionResponse<Job[]>> {
    try {
        const response = await adminApiClient().get<ApiResponse<Job[]>>(
            buildBackendUrl(ADMIN_API_ENDPOINTS.JOBS.GENERAL, params),
        );
        return extractApiData(response);
    } catch (error) {
        return handleApiError(error, "Failed to fetch jobs");
    }
}

/**
 * Get job by ID with details
 */
export async function getJobByIdAction(
    id: number
): Promise<ActionResponse<JobDetail>> {
    try {
        const response = await adminApiClient().get<ApiResponse<JobDetail>>(
            ADMIN_API_ENDPOINTS.JOBS.DETAIL(id)
        );
        return extractApiData(response);
    } catch (error) {
        return handleApiError(error, `Failed to fetch job #${id}`);
    }
}

/**
 * Delete a job
 */
export async function deleteJobAction(
    id: number
): Promise<ActionResponse<void>> {
    try {
        await adminApiClient().delete<ApiResponse<void>>(
            ADMIN_API_ENDPOINTS.JOBS.DETAIL(id)
        );

        return { success: true };
    } catch (error) {
        return handleApiError(error, `Failed to delete job #${id}`);
    }
}

// ============================================================================
// Job Lifecycle Actions
// ============================================================================

/**
 * Cancel a pending or running job
 */
export async function cancelJobAction(
    id: number
): Promise<ActionResponse<void>> {
    try {
        await adminApiClient().post<ApiResponse<void>>(
            ADMIN_API_ENDPOINTS.JOBS.CANCEL(id)
        );

        return { success: true };
    } catch (error) {
        return handleApiError(error, `Failed to cancel job #${id}`);
    }
}

/**
 * Retry a failed job
 */
export async function retryJobAction(id: number): Promise<ActionResponse<Job>> {
    try {
        const response = await adminApiClient().post<ApiResponse<Job>>(
            ADMIN_API_ENDPOINTS.JOBS.RETRY(id)
        );

        return extractApiData(response);
    } catch (error) {
        return handleApiError(error, `Failed to retry job #${id}`);
    }
}

// ============================================================================
// Job Logs Actions
// ============================================================================

/**
 * Get logs for a specific job
 */
export async function getJobLogsAction(
    id: number,
    limit: number = 100
): Promise<ActionResponse<JobLog[]>> {
    try {
        const url = `${ADMIN_API_ENDPOINTS.JOBS.LOGS(id)}?limit=${limit}`;
        const response = await adminApiClient().get<ApiResponse<JobLog[]>>(url);
        return extractApiData(response);
    } catch (error) {
        return handleApiError(error, `Failed to fetch logs for job #${id}`);
    }
}

// ============================================================================
// Monitoring Actions
// ============================================================================

/**
 * Get job statistics
 */
export async function getJobStatsAction(): Promise<ActionResponse<JobStats>> {
    try {
        const response = await adminApiClient().get<ApiResponse<JobStats>>(
            ADMIN_API_ENDPOINTS.JOBS.STATS
        );
        return extractApiData(response);
    } catch (error) {
        return handleApiError(error, "Failed to fetch job statistics");
    }
}

/**
 * Get currently running jobs
 */
export async function getRunningJobsAction(): Promise<ActionResponse<Job[]>> {
    try {
        const response = await adminApiClient().get<ApiResponse<Job[]>>(
            ADMIN_API_ENDPOINTS.JOBS.RUNNING
        );
        return extractApiData(response);
    } catch (error) {
        return handleApiError(error, "Failed to fetch running jobs");
    }
}

/**
 * Get registered job types
 */
export async function getJobTypesAction(): Promise<ActionResponse<JobType[]>> {
    try {
        const response = await adminApiClient().get<ApiResponse<JobType[]>>(
            ADMIN_API_ENDPOINTS.JOBS.TYPES
        );
        return extractApiData(response);
    } catch (error) {
        return handleApiError(error, "Failed to fetch job types");
    }
}

/**
 * Get jobs by type
 */
export async function getJobsByTypeAction(
    type: string,
    params: PaginationParams
): Promise<ActionResponse<Job[]>> {
    try {
        const response = await adminApiClient().get<ApiResponse<Job[]>>(
            buildBackendUrl(ADMIN_API_ENDPOINTS.JOBS.BY_TYPE(type), params)
        );
        return extractApiData(response);
    } catch (error) {
        return handleApiError(error, `Failed to fetch jobs of type: ${type}`);
    }
}

// ============================================================================
// Bulk Actions (Optional)
// ============================================================================

/**
 * Cancel multiple jobs
 */
export async function cancelMultipleJobsAction(
    ids: number[]
): Promise<ActionResponse<{ succeeded: number[]; failed: number[] }>> {
    const succeeded: number[] = [];
    const failed: number[] = [];

    for (const id of ids) {
        try {
            await adminApiClient().post<ApiResponse<void>>(
                ADMIN_API_ENDPOINTS.JOBS.CANCEL(id)
            );
            succeeded.push(id);
        } catch {
            failed.push(id);
        }
    }

    return {
        success: failed.length === 0,
        data: { succeeded, failed },
    };
}

/**
 * Delete multiple jobs
 */
export async function deleteMultipleJobsAction(
    ids: number[]
): Promise<ActionResponse<{ succeeded: number[]; failed: number[] }>> {
    const succeeded: number[] = [];
    const failed: number[] = [];

    for (const id of ids) {
        try {
            await adminApiClient().delete<ApiResponse<void>>(
                ADMIN_API_ENDPOINTS.JOBS.DETAIL(id)
            );
            succeeded.push(id);
        } catch {
            failed.push(id);
        }
    }

    return {
        success: failed.length === 0,
        data: { succeeded, failed },
    };
}
