// lib/pagination/queryBuilder.ts

import {
    FilterOperator,
    FilterValue,
    PaginationParams,
} from "@/types/pagination";

export class QueryStringBuilder {
    private params = new Map<string, string[]>();

    limit(value: number): this {
        return this.set("limit", value.toString());
    }

    offset(value: number): this {
        return this.set("offset", value.toString());
    }

    page(page: number, limit: number): this {
        return this.offset((page - 1) * limit);
    }

    sort(...fields: string[]): this {
        return this.set("sort", fields.join(","));
    }

    filter(
        field: string,
        operator: FilterOperator | "eq",
        value: string | string[]
    ): this {
        const values = Array.isArray(value) ? value : [value];
        const formatted =
            operator === "eq" ? values : [`${operator}:${values.join(",")}`];
        this.params.set(field, formatted);
        return this;
    }

    filters(filters: Record<string, FilterValue>): this {
        Object.entries(filters).forEach(
            ([field, { operator = "eq", value }]) => {
                this.filter(field, operator, value);
            }
        );
        return this;
    }

    set(key: string, value: string | string[]): this {
        this.params.set(key, Array.isArray(value) ? value : [value]);
        return this;
    }

    build(): URLSearchParams {
        const searchParams = new URLSearchParams();
        this.params.forEach((values, key) =>
            values.forEach((val) => searchParams.append(key, val))
        );
        return searchParams;
    }

    toString(): string {
        return this.build().toString();
    }

    toObject(): Record<string, string[]> {
        return Object.fromEntries(this.params);
    }

    static from(params: PaginationParams): QueryStringBuilder {
        const builder = new QueryStringBuilder();
        Object.entries(params).forEach(([key, value]) => {
            if (value != null) {
                builder.set(key, Array.isArray(value) ? value : String(value));
            }
        });
        return builder;
    }
}

export const createQueryBuilder = () => new QueryStringBuilder();

/**
 * Parse query string or Next.js searchParams to PaginationParams
 * Handles both string and object inputs
 */
export function parseQueryString(
    search: string | URLSearchParams | { [key: string]: string | string[] | undefined }
): PaginationParams {
    let params: URLSearchParams;
    
    // Handle Next.js searchParams object
    if (typeof search === 'object' && !(search instanceof URLSearchParams)) {
        params = new URLSearchParams();
        Object.entries(search).forEach(([key, value]) => {
            if (value !== undefined) {
                if (Array.isArray(value)) {
                    value.forEach(v => params.append(key, v));
                } else {
                    params.set(key, value);
                }
            }
        });
    } 
    // Handle URLSearchParams or string
    else {
        params = typeof search === 'string' 
            ? new URLSearchParams(search) 
            : search;
    }

    const result: PaginationParams = {};

    for (const [key, value] of params) {
        if (key === 'limit' || key === 'offset') {
            result[key] = value; // Keep as string for consistency
        } else if (result[key]) {
            // Handle multiple values for same key
            result[key] = [
                ...(Array.isArray(result[key]) ? (result[key] as string[]) : [result[key] as string]),
                value,
            ] as string[];
        } else {
            result[key] = value;
        }
    }

    return result;
}