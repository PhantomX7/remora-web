// actions/admin/config.ts
"use server";

import { revalidateTag } from "next/cache";
import type { ApiResponse, ActionResponse } from "@/types/common";
import type { PaginationParams } from "@/types/pagination";
import { adminApiClient } from "@/lib/api";
import { ADMIN_API_ENDPOINTS } from "@/lib/constants";
import { buildBackendUrl } from "@/lib/pagination/serverUtils";
import { handleApiError, extractApiData } from "@/lib/helpers";
import type { Config } from "@/types/config";

export async function getPaginatedConfigsAction(
    params: PaginationParams
): Promise<ActionResponse<Config[]>> {
    try {
        const response = await adminApiClient().get<ApiResponse<Config[]>>(
            buildBackendUrl(ADMIN_API_ENDPOINTS.CONFIG.GENERAL, params)
        );
        return extractApiData(response);
    } catch (error) {
        return handleApiError(error, "Failed to fetch paginated configs");
    }
}

export async function getConfigByKeyAction(
    key: string
): Promise<ActionResponse<Config>> {
    try {
        const response = await adminApiClient().get<ApiResponse<Config>>(
            ADMIN_API_ENDPOINTS.CONFIG.FIND_BY_KEY(key)
        );
        return extractApiData(response);
    } catch (error) {
        return handleApiError(error, `Failed to find config with key: ${key}`);
    }
}

export async function updateConfigAction(
    id: number,
    configData: Partial<Pick<Config, "value">>
): Promise<ActionResponse<Config>> {
    try {
        const response = await adminApiClient().patch<ApiResponse<Config>>(
            ADMIN_API_ENDPOINTS.CONFIG.DETAIL(id),
            configData
        );
        revalidateTag("configs", "max");
        return extractApiData(response);
    } catch (error) {
        return handleApiError(error, "Failed to update config");
    }
}
