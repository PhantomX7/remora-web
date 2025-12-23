// lib/api-client.ts
import { API_BASE_URL, ADMIN_API_ENDPOINTS, PUBLIC_API_ENDPOINTS } from "@/lib/constants";
import { getAuthTokens, setAuthTokens } from "@/lib/auth";
import type { AuthTokens } from "@/types/auth";
import type { AuthScope } from "@/lib/constants";

class ApiClient {
    private baseURL: string;
    private scope: AuthScope;
    private refreshPromise: Promise<AuthTokens | null> | null = null;

    constructor(baseURL: string, scope: AuthScope) {
        this.baseURL = baseURL;
        this.scope = scope;
    }

    private async refreshTokens(): Promise<AuthTokens | null> {
        if (this.refreshPromise) {
            return this.refreshPromise;
        }

        this.refreshPromise = (async () => {
            try {
                // Pass scope to get tokens
                const tokens = await getAuthTokens(this.scope);

                if (!tokens?.refresh_token) {
                    return null;
                }

                // Determine refresh endpoint based on scope
                const refreshEndpoint = this.scope === "admin"
                    ? ADMIN_API_ENDPOINTS.AUTH.REFRESH
                    : PUBLIC_API_ENDPOINTS.AUTH.REFRESH; // Ensure this exists in constants

                const response = await fetch(
                    `${this.baseURL}${refreshEndpoint}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            refresh_token: tokens.refresh_token,
                        }),
                        cache: "no-store",
                    }
                );

                if (!response.ok) return null;

                const result = await response.json();
                const newTokens = result.data || result;

                if (!newTokens.access_token || !newTokens.refresh_token) {
                    return null;
                }

                await setAuthTokens(this.scope, newTokens);
                return newTokens;
            } catch (error) {
                console.error(`Token refresh failed for ${this.scope}:`, error);
                return null;
            } finally {
                this.refreshPromise = null;
            }
        })();

        return this.refreshPromise;
    }

    private async getHeaders(
        headers?: HeadersInit,
        body?: unknown
    ): Promise<HeadersInit> {
        const defaultHeaders: Record<string, string> = {};

        if (body && !(body instanceof FormData)) {
            defaultHeaders["Content-Type"] = "application/json";
        }

        // Pass scope to get tokens
        const tokens = await getAuthTokens(this.scope);
        if (tokens?.access_token) {
            defaultHeaders["Authorization"] = `Bearer ${tokens.access_token}`;
        }

        return { ...defaultHeaders, ...headers };
    }

    async request<T>(
        endpoint: string,
        options: RequestInit = {},
        retryCount = 0
    ): Promise<T> {
        const MAX_RETRIES = 1;
        const url = `${this.baseURL}${endpoint}`;

        try {
            const response = await fetch(url, {
                ...options,
                headers: await this.getHeaders(options.headers, options.body),
            });

            if (response.status === 401 && retryCount < MAX_RETRIES) {
                const newTokens = await this.refreshTokens();
                if (newTokens) {
                    return this.request<T>(endpoint, options, retryCount + 1);
                }
                
                const error = new Error("Authentication failed") as any;
                error.status = 401;
                error.code = "AUTH_FAILED";
                throw error;
            }

            if (!response.ok) {
                const error = await response.json().catch(() => ({
                    message: response.statusText,
                    status: response.status,
                }));
                throw error;
            }

            const contentType = response.headers.get("content-type");
            if (contentType?.includes("application/json")) {
                return response.json();
            }

            return response.text() as T;
        } catch (error: any) {
            if (error.status === 401) throw error;
            if (error.status >= 500) console.error("API request failed:", error);
            throw error;
        }
    }

    async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: "GET" });
    }

    async post<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: "POST",
            body: data instanceof FormData ? data : JSON.stringify(data),
        });
    }

    async put<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: "PUT",
            body: data instanceof FormData ? data : JSON.stringify(data),
        });
    }

    async patch<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: "PATCH",
            body: data instanceof FormData ? data : JSON.stringify(data),
        });
    }

    async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: "DELETE" });
    }

    async getRaw(endpoint: string, options: RequestInit = {}, retryCount = 0): Promise<Response> {
        const MAX_RETRIES = 1;
        const url = `${this.baseURL}${endpoint}`;

        try {
            const headers = await this.getHeaders(options.headers, options.body);
            const response = await fetch(url, { ...options, method: "GET", headers });

            if (response.status === 401 && retryCount < MAX_RETRIES) {
                const newTokens = await this.refreshTokens();
                if (newTokens) return this.getRaw(endpoint, options, retryCount + 1);
            }

            if (!response.ok) throw new Error(`Download failed: ${response.statusText}`);
            return response;
        } catch (error) {
            console.error("API Raw request failed:", error);
            throw error;
        }
    }
}

// Export distinct instances
const adminClient = new ApiClient(API_BASE_URL, "admin");
const publicClient = new ApiClient(API_BASE_URL, "public");

// Named exports for clarity
export const adminApiClient = () => adminClient;
export const publicApiClient = () => publicClient;