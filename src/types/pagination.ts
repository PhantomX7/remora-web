// lib/pagination/types.ts

export type FilterType =
    | "ID"
    | "NUMBER"
    | "STRING"
    | "BOOL"
    | "DATE"
    | "DATETIME"
    | "ENUM";

export type FilterOperator =
    | "eq"
    | "neq"
    | "in"
    | "not_in"
    | "like"
    | "between"
    | "gt"
    | "gte"
    | "lt"
    | "lte";

export interface FilterConfig {
    field: string;
    searchFields?: string[];
    type: FilterType;
    tableName?: string;
    operators?: FilterOperator[];
    enumValues?: string[];
}

export interface SortConfig {
    field: string;
    tableName?: string;
    allowed: boolean;
}

export interface FilterDefinition {
    filters: Record<string, FilterConfig>;
    sorts: Record<string, SortConfig>;
}

export interface PaginationParams {
    [key: string]: string | string[] | undefined;
    limit?: string;
    offset?: string;
    sort?: string;
}

export interface FilterValue {
    operator?: FilterOperator;
    value: string | string[];
}

export interface SearchHookResult {
    data: any;
    isLoading: boolean;
}

export interface FilterFieldConfig extends FilterConfig {
    label: string;
    placeholder?: string;
    options?: { value: string; label: string }[];
    // Add these for searchable ID fields
    useSearchHook?: (search: string, enabled: boolean) => SearchHookResult;
    useSingleItemHook?: (id: any) => SearchHookResult;
    getOptionLabel?: (option: any) => string;
    getOptionValue?: (option: any) => string;
}

export interface SortFieldConfig extends SortConfig {
    label: string;
}