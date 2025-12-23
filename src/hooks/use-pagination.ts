// hooks/use-pagination.ts

"use client";

import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import {
    createQueryBuilder,
    parseQueryString,
} from "@/lib/pagination/queryBuilder";
import { PaginationParams } from "@/types/pagination";
import { ApiError } from "@/types/common";

export interface UsePaginationOptions<TData> {
    queryFn: (params: PaginationParams) => Promise<{
        data: TData[];
        meta?: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    queryKey: string | (string | number | undefined)[];
    defaultLimit?: number;
    globalSearchField?: string;
    enabled?: boolean;
}

interface UseTableUrlStateOptions {
    defaultLimit?: number;
    globalSearchField?: string;
}

export function useTableUrlState(options: UseTableUrlStateOptions = {}) {
    const { defaultLimit = 20, globalSearchField = "search" } = options;
    const router = useRouter();
    const searchParams = useSearchParams();

    // Parse URL params
    const urlParams = useMemo(
        () => parseQueryString(searchParams),
        [searchParams]
    );

    // Extract current values
    const currentLimit = Number(urlParams.limit) || defaultLimit;
    const currentPage = Number(urlParams.page) || 1;
    const currentOffset = (currentPage - 1) * currentLimit;
    const currentSort = (urlParams.sort as string) || "";
    
    // Extract search value (remove operator prefix if present)
    const rawSearch = (urlParams[globalSearchField] as string) || "";
    const currentSearch = useMemo(() => {
        if (!rawSearch) return "";
        const match = rawSearch.match(/^[^:]+:(.+)$/);
        return match ? match[1] : rawSearch;
    }, [rawSearch]);

    // Update URL - stable reference
    const updateUrl = useCallback(
        (updates: Record<string, any>, resetPage = true) => {
            const builder = createQueryBuilder();

            // Read current params from window.location to avoid dependency issues
            const currentUrl = new URLSearchParams(window.location.search);
            const currentParams = parseQueryString(currentUrl);

            // Copy current params
            Object.entries(currentParams).forEach(([key, value]) => {
                if (value != null) {
                    builder.set(
                        key,
                        Array.isArray(value) ? value : String(value)
                    );
                }
            });

            // Apply updates
            Object.entries(updates).forEach(([key, value]) => {
                if (value === null || value === undefined || value === "") {
                    (builder as any).params.delete(key);
                } else {
                    builder.set(key, String(value));
                }
            });

            // Reset to page 1 if needed (instead of offset 0)
            if (resetPage && !updates.page) {
                builder.set("page", "1");
            }

            const newQuery = builder.toString();
            const currentQuery = currentUrl.toString();

            // Only update if query actually changed
            if (newQuery !== currentQuery) {
                router.push(`?${newQuery}`, { scroll: false });
            }
        },
        [router]
    );

    return {
        urlParams,
        currentLimit,
        currentOffset,
        currentPage,
        currentSort,
        currentSearch,
        updateUrl,
    };
}

export function usePagination<TData>(options: UsePaginationOptions<TData>) {
    const {
        queryFn,
        queryKey,
        defaultLimit = 20,
        globalSearchField = "search",
        enabled = true,
    } = options;

    const {
        urlParams,
        currentLimit,
        currentOffset,
        currentPage,
        currentSort,
        currentSearch,
        updateUrl,
    } = useTableUrlState({ defaultLimit, globalSearchField });

    // Build query params for API call (with offset for backend)
    const params: PaginationParams = useMemo(
        () => ({
            ...urlParams,
            limit: currentLimit.toString(),
            offset: currentOffset.toString(),
        }),
        [urlParams, currentLimit, currentOffset]
    );

    // Query for data
    const {
        data: response,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: Array.isArray(queryKey) ? queryKey : [queryKey, params],
        queryFn: () => queryFn(params),
        enabled,
    });

    const data = response?.data || [];
    const meta = response?.meta;
    const totalPages = meta ? Math.ceil(meta.total / currentLimit) : 1;
    const hasNextPage = meta
        ? currentOffset + currentLimit < meta.total
        : false;
    const hasPreviousPage = currentPage > 1;

    // Actions
    const goToPage = useCallback(
        (page: number) => {
            updateUrl({ page }, false);
        },
        [updateUrl]
    );

    const nextPage = useCallback(() => {
        if (hasNextPage) {
            goToPage(currentPage + 1);
        }
    }, [hasNextPage, goToPage, currentPage]);

    const previousPage = useCallback(() => {
        if (hasPreviousPage) {
            goToPage(currentPage - 1);
        }
    }, [hasPreviousPage, goToPage, currentPage]);

    const setLimit = useCallback(
        (limit: number) => {
            updateUrl({ limit }, true);
        },
        [updateUrl]
    );

    const setSort = useCallback(
        (sort: string) => {
            updateUrl({ sort }, false);
        },
        [updateUrl]
    );

    const setFilter = useCallback(
        (field: string, value: string, operator = "eq") => {
            updateUrl(
                { [field]: operator === "eq" ? value : `${operator}:${value}` },
                true
            );
        },
        [updateUrl]
    );

    const clearFilter = useCallback(
        (field: string) => {
            updateUrl({ [field]: null }, true);
        },
        [updateUrl]
    );

    const clearAllFilters = useCallback(() => {
        // Keep only limit, page, sort, and search fields
        const newParams: Record<string, any> = {};
        if (currentLimit !== defaultLimit) newParams.limit = currentLimit;
        // Always reset to page 1 when clearing filters
        newParams.page = 1;
        if (currentSort) newParams.sort = currentSort;
        if (currentSearch) newParams[globalSearchField] = currentSearch;

        updateUrl(newParams, false); // Don't reset page since we're explicitly setting it
    }, [
        currentLimit,
        defaultLimit,
        currentSort,
        currentSearch,
        globalSearchField,
        updateUrl,
    ]);

    const refresh = useCallback(() => {
        refetch();
    }, [refetch]);

    return {
        data,
        meta,
        isLoading,
        error: error as ApiError | null,
        currentPage,
        totalPages,
        goToPage,
        nextPage,
        previousPage,
        setLimit,
        hasNextPage,
        hasPreviousPage,
        setSort,
        setFilter,
        clearFilter,
        clearAllFilters,
        refresh,
        params: urlParams,
    };
}