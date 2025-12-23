// hooks/admin/use-configs.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    getPaginatedConfigsAction,
    updateConfigAction,
    getConfigByKeyAction,
} from "@/actions/admin/config";
import { handleActionResult } from "@/lib/helpers";
import type { PaginationParams } from "@/types/pagination";
import type { Config } from "@/types/config";
import type { ApiError } from "@/types/common";

const QUERY_KEY = ["configs"] as const;

// Paginated configs query
export function usePaginatedConfigs(params: PaginationParams) {
    return useQuery({
        queryKey: [...QUERY_KEY, "paginated", params],
        queryFn: () => handleActionResult(getPaginatedConfigsAction(params)),
        staleTime: 60 * 1000, // 1 minute
    });
}

// Get single config by key
export function useConfigByKey(key: string) {
    return useQuery({
        queryKey: [...QUERY_KEY, "detail", key],
        queryFn: async () => {
            const result = await handleActionResult(getConfigByKeyAction(key));
            return result.data;
        },
        enabled: !!key,
        staleTime: 60 * 1000, // 1 minute
    });
}

// Separated mutations hook
export function useConfigMutations() {
    const queryClient = useQueryClient();

    const invalidateAll = () => {
        queryClient.invalidateQueries({
            queryKey: QUERY_KEY,
        });
    };

    const updateMutation = useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: number;
            data: Partial<Pick<Config, "value">>;
        }) => handleActionResult(updateConfigAction(id, data)),
        onSuccess: () => {
            invalidateAll();
            toast.success("Config updated successfully");
        },
        onError: (error: ApiError) => {
            toast.error(error.message);
        },
    });

    return {
        updateMutation,
    };
}
