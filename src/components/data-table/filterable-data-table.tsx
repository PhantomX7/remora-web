"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useDebounce } from "use-debounce";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";

// Hooks & Types
import { useTableUrlState } from "@/hooks/use-pagination";
import { PaginationMeta } from "@/types/common";
import {
    FilterFieldConfig,
    SortFieldConfig,
    PaginationParams,
} from "@/types/pagination";

// Components
import { TableSearch } from "./table-search";
import {
    TableFilterToggle,
    TablePageSizeSelector,
    TableSort,
} from "./table-controls";
import { TableFilterPanel } from "./table-filter-panel";
import { TablePagination } from "./table-pagination";
import { TableError } from "./table-error";
import { TableExportButton } from "./table-export-button";

/**
 * Props for the FilterableDataTable component.
 */
export interface FilterableDataTableProps<TData> {
    /** Array of data to display in the table. */
    data: TData[];
    /** Pagination metadata (total, limit, offset) from the API. */
    meta: PaginationMeta | null;
    /** Column definitions for TanStack Table. */
    columns: ColumnDef<TData>[];

    /** Whether data is currently being fetched. */
    isLoading?: boolean;
    /** Error object if the fetch failed. */
    error?: Error | null;

    /** Configuration for the filter panel fields. */
    filterFields?: FilterFieldConfig[];
    /** Configuration for the sort dropdown. */
    sortFields?: SortFieldConfig[];
    /** Default number of rows per page. Default: 20. */
    defaultLimit?: number;

    /** Enable/Disable the global search bar. Default: true. */
    enableGlobalSearch?: boolean;
    /** Placeholder text for the search input. */
    globalSearchPlaceholder?: string;
    /** The URL param key for search (e.g., 'q', 'search'). Default: 'search'. */
    globalSearchField?: string;
    /** The operator to prepend to the search term (e.g., 'like', 'eq'). Default: 'like'. */
    globalSearchOperator?: string;

    /** Message to show when data is empty. */
    emptyMessage?: string;
    /** Optional action button to show when empty (e.g., "Create Item"). */
    emptyAction?: { label: string; onClick: () => void };

    /** Callback to refresh data (usually `queryClient.invalidateQueries`). */
    onRefresh: () => void;
    /** Async function to export current view. */
    onExport?: (filters: PaginationParams) => Promise<void>;
    /** Async function to export all data. */
    onExportAll?: () => Promise<void>;
    /** Label for the export button. */
    exportLabel?: string;
    /** Label for the export all button. */
    exportAllLabel?: string;

    /** Additional CSS classes for the wrapper. */
    className?: string;
}

/**
 * A feature-rich Data Table wrapper that handles:
 * - URL-based State Management (Pagination, Sorting, Filtering)
 * - Global Search with Debouncing
 * - Advanced Filtering Panel
 * - Export Functionality
 * - Error & Loading States
 *
 * @example
 * <FilterableDataTable
 *   data={data}
 *   meta={meta}
 *   columns={columns}
 *   filterFields={filterConfig}
 *   onRefresh={refetch}
 * />
 */
export function FilterableDataTable<TData>({
    data = [],
    meta,
    isLoading = false,
    error = null,
    columns,
    filterFields = [],
    sortFields = [],
    enableGlobalSearch = true,
    globalSearchPlaceholder = "Search...",
    globalSearchField = "search",
    globalSearchOperator = "like",
    defaultLimit = 20,
    emptyMessage = "No data found",
    emptyAction,
    onRefresh,
    onExport,
    onExportAll,
    exportLabel,
    exportAllLabel,
    className,
}: FilterableDataTableProps<TData>) {
    // ----------------------------------------------------------------
    // 1. State & Hooks
    // ----------------------------------------------------------------

    const [showFilters, setShowFilters] = React.useState(false);

    // URL State Manager (Custom Hook)
    const {
        urlParams,
        currentLimit,
        currentPage,
        currentSort,
        currentSearch,
        updateUrl,
    } = useTableUrlState({ defaultLimit, globalSearchField });

    // Local filter state (Debounced to prevent excessive URL updates while typing in filter panel)
    const [localFilters, setLocalFilters] = React.useState<
        Record<string, string>
    >({});
    const [debouncedFilters] = useDebounce(localFilters, 300);
    const prevFiltersRef = React.useRef<Record<string, string>>({});

    // ----------------------------------------------------------------
    // 2. Effects
    // ----------------------------------------------------------------

    // Sync debounced local filters to the URL
    React.useEffect(() => {
        // Filter out empty values
        const activeFilters = Object.entries(debouncedFilters).filter(
            ([, val]) => val !== "" && val !== null && val !== undefined
        );

        if (
            activeFilters.length === 0 &&
            Object.keys(prevFiltersRef.current).length === 0
        )
            return;

        // Convert to object for comparison
        const currentParams = Object.fromEntries(activeFilters);

        // Only update URL if filters actually changed (prevents loops)
        const hasChanged =
            JSON.stringify(currentParams) !==
            JSON.stringify(prevFiltersRef.current);

        if (hasChanged) {
            prevFiltersRef.current = currentParams;
            updateUrl(currentParams);
        }
    }, [debouncedFilters, updateUrl]);

    // ----------------------------------------------------------------
    // 3. Computed Values
    // ----------------------------------------------------------------

    // Remove operator prefix from search string for display (e.g., "like:term" -> "term")
    const displaySearchValue = React.useMemo(() => {
        if (!currentSearch) return "";
        return currentSearch.includes(":")
            ? currentSearch.split(":")[1]
            : currentSearch;
    }, [currentSearch]);

    // Merge URL params back into filter values for the panel (Priority: Local > URL)
    const filterValues = React.useMemo(() => {
        const values: Record<string, string> = {};
        filterFields.forEach((f) => {
            values[f.field] =
                localFilters[f.field] ?? (urlParams[f.field] as string) ?? "";
        });
        return values;
    }, [urlParams, filterFields, localFilters]);

    const activeFilterCount = filterFields.filter(
        (f) => urlParams[f.field]
    ).length;
    const isFiltered = activeFilterCount > 0 || !!currentSearch;

    // ----------------------------------------------------------------
    // 4. Handlers (Memoized)
    // ----------------------------------------------------------------

    const handleGlobalSearch = React.useCallback(
        (val: string) => {
            const formatted = val ? `${globalSearchOperator}:${val}` : null;
            updateUrl({ [globalSearchField]: formatted });
        },
        [globalSearchField, globalSearchOperator, updateUrl]
    );

    const handleFilterChange = React.useCallback(
        (field: string, val: string) => {
            setLocalFilters((prev) => {
                if (!val) {
                    const next = { ...prev };
                    delete next[field];
                    return next;
                }
                return { ...prev, [field]: val };
            });

            // Immediate removal from URL if cleared
            if (!val) updateUrl({ [field]: null });
        },
        [updateUrl]
    );

    const handleClearAll = React.useCallback(() => {
        prevFiltersRef.current = {};
        setLocalFilters({});
        const updates: Record<string, null> = { [globalSearchField]: null };
        filterFields.forEach((f) => (updates[f.field] = null));
        updateUrl(updates);
    }, [filterFields, globalSearchField, updateUrl]);

    const handleExport = React.useCallback(async () => {
        if (onExport) await onExport(urlParams);
    }, [onExport, urlParams]);

    // Memoized state updaters
    const handleSortChange = React.useCallback(
        (val: string) => updateUrl({ sort: val || null }, false),
        [updateUrl]
    );
    const handleLimitChange = React.useCallback(
        (val: number) => updateUrl({ limit: val }),
        [updateUrl]
    );
    const handlePageChange = React.useCallback(
        (val: number) => updateUrl({ page: val }, false),
        [updateUrl]
    );

    // ----------------------------------------------------------------
    // 5. Render
    // ----------------------------------------------------------------

    if (error) {
        return (
            <TableError
                error={error}
                onRetry={onRefresh}
                className={className}
            />
        );
    }

    return (
        <div className={`space-y-4 w-full ${className}`}>
            {/* --- Toolbar --- */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between w-full">
                {/* Left: Search Bar (Grows to fill space) */}
                <div className="flex-1 w-full min-w-0">
                    {enableGlobalSearch && (
                        <TableSearch
                            value={displaySearchValue}
                            onSearch={handleGlobalSearch}
                            placeholder={globalSearchPlaceholder}
                            className="w-full"
                        />
                    )}
                </div>

                {/* Right: Controls (Scrollable on very small screens) */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 shrink-0">
                    {filterFields.length > 0 && (
                        <TableFilterToggle
                            activeCount={activeFilterCount}
                            isOpen={showFilters}
                            onToggle={() => setShowFilters(!showFilters)}
                        />
                    )}

                    {sortFields.length > 0 && (
                        <TableSort
                            fields={sortFields}
                            value={currentSort}
                            onChange={handleSortChange}
                        />
                    )}

                    <TablePageSizeSelector
                        value={currentLimit}
                        onChange={handleLimitChange}
                    />

                    {onExport && (
                        <TableExportButton
                            onExport={handleExport}
                            onExportAll={onExportAll}
                            exportLabel={exportLabel}
                            exportAllLabel={exportAllLabel}
                            isFiltered={isFiltered}
                        />
                    )}
                </div>
            </div>

            {/* --- Expanded Filter Panel --- */}
            {showFilters && filterFields.length > 0 && (
                <TableFilterPanel
                    fields={filterFields}
                    values={filterValues}
                    activeCount={activeFilterCount}
                    onChange={handleFilterChange}
                    onClearAll={handleClearAll}
                />
            )}

            {/* --- Data Table --- */}
            {!isLoading && data.length === 0 && isFiltered ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center animate-in fade-in-50 bg-muted/20">
                    <p className="text-muted-foreground">
                        No results found matching your filters.
                    </p>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearAll}
                    >
                        Clear Filters
                    </Button>
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={data}
                    isLoading={isLoading}
                    emptyMessage={emptyMessage}
                    emptyAction={emptyAction}
                />
            )}

            {/* --- Pagination --- */}
            {meta && meta.total > 0 && (
                <div className="pt-2">
                    <TablePagination
                        currentPage={currentPage}
                        pageSize={currentLimit}
                        totalCount={meta.total}
                        onPageChange={handlePageChange}
                        isLoading={isLoading}
                    />
                </div>
            )}
        </div>
    );
}
