// lib/pagination/nextAdapter.ts
import { NextRequest } from 'next/server';
import { PaginationParams } from '@/types/pagination';

/**
 * Extracts and parses pagination parameters from a Next.js request
 * 
 * Handles:
 * - Numeric conversion for limit/page
 * - Multiple values for the same parameter
 * - Sort fields
 * 
 * @param request - Next.js request object
 * @returns Parsed pagination parameters
 * 
 * @example
 * ```ts
 * // GET /api/users?limit=20&page=3&status=active&status=pending
 * const params = extractPaginationParams(request);
 * // { limit: 20, page: 3, status: ['active', 'pending'] }
 * ```
 */
export function extractPaginationParams(request: NextRequest): PaginationParams {
  const params: PaginationParams = {};
  
  for (const [key, value] of request.nextUrl.searchParams) {
    if (key === 'limit' || key === 'page') {
      params[key] = value;
    } else if (params[key]) {
      params[key] = [...(Array.isArray(params[key]) ? (params[key] as string[]) : [params[key] as string]), value] as string[];
    } else {
      params[key] = value;
    }
  }
  
  return params;
}

/**
 * Converts page-based pagination to offset-based for backend
 * 
 * @param params - Pagination parameters (page-based)
 * @returns Parameters with offset calculated from page
 * 
 * @example
 * ```ts
 * const params = { page: 3, limit: 20 };
 * const backendParams = convertPageToOffset(params);
 * // { offset: 40, limit: 20 }
 * ```
 */
export function convertPageToOffset(params: PaginationParams): PaginationParams {
  const { page, limit, ...rest } = params;
  
  if (page && limit) {
    const pageNum = parseInt(String(page), 10);
    const limitNum = parseInt(String(limit), 10);
    const offset = (pageNum - 1) * limitNum;
    
    return {
      ...rest,
      offset: offset.toString(),
      limit: limit.toString(),
    };
  }
  
  // If only page is provided (no limit), default to limit of 20
  if (page) {
    const pageNum = parseInt(String(page), 10);
    const defaultLimit = 20;
    const offset = (pageNum - 1) * defaultLimit;
    
    return {
      ...rest,
      offset: offset.toString(),
      limit: defaultLimit.toString(),
    };
  }
  
  return params;
}

/**
 * Converts pagination parameters to backend-compatible format
 * 
 * Normalizes all values to string arrays, filtering out null/undefined
 * Converts page to offset for backend compatibility
 * 
 * @param params - Pagination parameters to convert
 * @returns Object with all values as string arrays
 * 
 * @example
 * ```ts
 * const params = { limit: 20, page: 2, status: 'active', tags: ['tech', 'news'] };
 * const backend = convertToBackendParams(params);
 * // { limit: ['20'], offset: ['20'], status: ['active'], tags: ['tech', 'news'] }
 * ```
 */
export function convertToBackendParams(
  params: PaginationParams
): Record<string, string[]> {
  // Convert page to offset first
  const convertedParams = convertPageToOffset(params);
  
  return Object.fromEntries(
    Object.entries(convertedParams)
      .filter(([, value]) => value != null)
      .map(([key, value]) => [
        key,
        Array.isArray(value) ? value : [String(value)]
      ])
  );
}

/**
 * Builds a complete backend API URL with query parameters
 * Automatically converts page to offset for backend
 * 
 * Automatically handles:
 * - Array values (multiple params with same key)
 * - URL encoding
 * - Empty query strings
 * - Page to offset conversion
 * 
 * @param baseUrl - Base API endpoint URL
 * @param params - Pagination parameters to append
 * @returns Complete URL with query string
 * 
 * @example
 * ```ts
 * const url = buildBackendUrl('/api/users', { 
 *   limit: 20, 
 *   page: 2,
 *   status: 'active' 
 * });
 * // '/api/users?limit=20&offset=20&status=active'
 * 
 * const url2 = buildBackendUrl('/api/posts', {
 *   page: 3,
 *   limit: 10,
 *   tags: ['tech', 'news'],
 *   sort: 'created_at desc'
 * });
 * // '/api/posts?limit=10&offset=20&tags=tech&tags=news&sort=created_at+desc'
 * ```
 */
export function buildBackendUrl(
  baseUrl: string,
  params: PaginationParams
): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(convertToBackendParams(params)).forEach(([key, values]) => {
    values.forEach(value => searchParams.append(key, value));
  });
  
  const queryString = searchParams.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Extracts pagination params and builds backend URL in one step
 * 
 * Convenience function that combines extraction and URL building
 * Automatically converts page to offset for backend
 * 
 * @param request - Next.js request object
 * @param backendBaseUrl - Base backend API URL
 * @returns Complete backend URL with extracted query params
 * 
 * @example
 * ```ts
 * // In a Next.js API route handler
 * // Request: GET /api/users?page=2&limit=20
 * export async function GET(request: NextRequest) {
 *   const backendUrl = buildBackendUrlFromRequest(
 *     request,
 *     'https://api.example.com/users'
 *   );
 *   // 'https://api.example.com/users?offset=20&limit=20'
 *   
 *   const response = await fetch(backendUrl);
 *   return response;
 * }
 * ```
 */
export function buildBackendUrlFromRequest(
  request: NextRequest,
  backendBaseUrl: string
): string {
  return buildBackendUrl(backendBaseUrl, extractPaginationParams(request));
}

/**
 * Converts offset-based response to page number
 * 
 * @param offset - Current offset value
 * @param limit - Items per page
 * @returns Current page number (1-indexed)
 * 
 * @example
 * ```ts
 * const page = convertOffsetToPage(40, 20); // 3
 * const page = convertOffsetToPage(0, 20);  // 1
 * ```
 */
export function convertOffsetToPage(offset: number, limit: number): number {
  return Math.floor(offset / limit) + 1;
}