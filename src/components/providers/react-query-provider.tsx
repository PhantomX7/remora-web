// providers/react-query-provider.tsx
"use client";

import {
    isServer,
    MutationCache,
    QueryCache,
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query";
import {
    ErrorTypes,
    type ApiErrorDetails,
    type ErrorType,
} from "@/lib/helpers";

// 1. Type Guard
function isApiError(error: unknown): error is ApiErrorDetails {
    return typeof error === "object" && error !== null && "type" in error;
}

// 2. Global Error Handler
function notifyGlobalError(error: unknown) {
    if (!isApiError(error)) return;

    if (
        error.type === ErrorTypes.CONNECTION_ERROR ||
        error.type === ErrorTypes.SERVER_ERROR
    ) {
        // Explicitly type the CustomEvent generic for better safety
        const event = new CustomEvent<ApiErrorDetails>("app:api-error", {
            detail: error,
        });
        window.dispatchEvent(event);
    }
}

function makeQueryClient() {
    return new QueryClient({
        queryCache: new QueryCache({ onError: notifyGlobalError }),
        mutationCache: new MutationCache({ onError: notifyGlobalError }),
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
                refetchOnWindowFocus: false,
                refetchOnReconnect: true,
                retryDelay: (attemptIndex) =>
                    Math.min(1000 * 2 ** attemptIndex, 5000),
                retry: (failureCount, error) => {
                    // If it's not our known API error format, stop retrying early
                    if (!isApiError(error)) return failureCount < 1;

                    // Otherwise TS infers it as a specific subset of strings (e.g. "NOT_AUTH" | "FORBIDDEN")
                    // and complains when you check if a wider type (e.g. "SERVER_ERROR") exists in it.
                    const nonRetriable: ErrorType[] = [
                        ErrorTypes.NOT_AUTHENTICATED,
                        ErrorTypes.FORBIDDEN,
                        ErrorTypes.NOT_FOUND,
                    ];

                    if (nonRetriable.includes(error.type)) return false;

                    // Retry connection errors twice, others once
                    if (error.type === ErrorTypes.CONNECTION_ERROR) {
                        return failureCount < 2;
                    }

                    return false;
                },
            },
        },
    });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
    if (isServer) return makeQueryClient();
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
}

export default function ReactQueryProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const queryClient = getQueryClient();
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
