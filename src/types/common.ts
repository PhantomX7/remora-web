export interface PaginationMeta {
    total: number;
    limit: number;
    offset: number;
}

export interface ApiResponse<T> {
    status: boolean;
    message: string;
    meta: PaginationMeta;
    data: T;
}

export interface ApiError {
    status: boolean;
    message: string;
    error: ValidationError;
}

export interface ActionResponse<T = void> {
  success: boolean;
  data?: T;
  error?: any;
  meta?: PaginationMeta;
}

export interface ValidationError {
    fields: Record<string, string>;
}
export type SortOption = string;
