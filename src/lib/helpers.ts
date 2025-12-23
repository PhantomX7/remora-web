// lib/helpers.ts
import type {
    ActionResponse,
    ApiResponse,
    PaginationMeta,
} from "@/types/common";

// ============================================================================
// Error Type Constants
// ============================================================================

export const ErrorTypes = {
    NOT_AUTHENTICATED: "NOT_AUTHENTICATED",
    CONNECTION_ERROR: "CONNECTION_ERROR",
    SERVER_ERROR: "SERVER_ERROR",
    VALIDATION_ERROR: "VALIDATION_ERROR",
    NOT_FOUND: "NOT_FOUND",
    FORBIDDEN: "FORBIDDEN",
    UNKNOWN: "UNKNOWN",
} as const;

export type ErrorType = (typeof ErrorTypes)[keyof typeof ErrorTypes];

export interface ApiErrorDetails {
    message: string;
    type: ErrorType;
    status?: number;
    details?: unknown;
}

// ============================================================================
// Error Detection Utilities
// ============================================================================

/**
 * Checks if the error is a connection/network error
 */
const isConnectionError = (error: unknown): boolean => {
    if (!error || typeof error !== "object") return false;

    const err = error as Record<string, unknown>;

    // Check common connection error codes
    const connectionCodes = [
        "ECONNREFUSED",
        "ENOTFOUND",
        "ECONNRESET",
        "ETIMEDOUT",
        "ENETUNREACH",
        "EAI_AGAIN",
        "EHOSTUNREACH",
    ];

    if (typeof err.code === "string" && connectionCodes.includes(err.code)) {
        return true;
    }

    // Check nested cause (Node.js fetch errors)
    if (err.cause && typeof err.cause === "object") {
        const cause = err.cause as Record<string, unknown>;
        if (
            typeof cause.code === "string" &&
            connectionCodes.includes(cause.code)
        ) {
            return true;
        }
    }

    // Check error message for fetch failures
    if (typeof err.message === "string") {
        const connectionMessages = [
            "fetch failed",
            "network error",
            "failed to fetch",
            "networkerror",
            "network request failed",
            "unable to connect",
            "connection refused",
        ];
        const lowerMessage = err.message.toLowerCase();
        if (connectionMessages.some((msg) => lowerMessage.includes(msg))) {
            return true;
        }
    }

    // Check for TypeError with fetch (common in Next.js)
    if (error instanceof TypeError && err.message === "fetch failed") {
        return true;
    }

    return false;
};

/**
 * Checks if the error is an authentication error (401)
 */
const isAuthError = (error: unknown): boolean => {
    if (!error || typeof error !== "object") return false;

    const err = error as Record<string, unknown>;

    // Check status code
    if (err.status === 401) return true;

    // Check for auth-specific codes
    if (err.code === "AUTH_FAILED" || err.code === "UNAUTHORIZED") return true;

    // Check statusCode (some APIs use this)
    if (err.statusCode === 401) return true;

    return false;
};

/**
 * Checks if the error is a forbidden error (403)
 */
const isForbiddenError = (error: unknown): boolean => {
    if (!error || typeof error !== "object") return false;

    const err = error as Record<string, unknown>;
    return err.status === 403 || err.statusCode === 403;
};

/**
 * Checks if the error is a not found error (404)
 */
const isNotFoundError = (error: unknown): boolean => {
    if (!error || typeof error !== "object") return false;

    const err = error as Record<string, unknown>;
    return err.status === 404 || err.statusCode === 404;
};

/**
 * Checks if the error is a validation error (400/422)
 */
const isValidationError = (error: unknown): boolean => {
    if (!error || typeof error !== "object") return false;

    const err = error as Record<string, unknown>;
    return (
        err.status === 400 ||
        err.status === 422 ||
        err.statusCode === 400 ||
        err.statusCode === 422
    );
};

/**
 * Checks if the error is a server error (5xx)
 */
const isServerError = (error: unknown): boolean => {
    if (!error || typeof error !== "object") return false;

    const err = error as Record<string, unknown>;
    const status = (err.status || err.statusCode) as number | undefined;
    return typeof status === "number" && status >= 500 && status < 600;
};

/**
 * Extracts error message from various error formats
 */
const extractErrorMessage = (
    error: unknown,
    fallbackMessage: string
): string => {
    if (!error) return fallbackMessage;

    if (typeof error === "string") return error;

    if (error instanceof Error) return error.message;

    if (typeof error === "object") {
        const err = error as Record<string, unknown>;

        // Check common message fields
        if (typeof err.message === "string") return err.message;
        if (typeof err.error === "string") return err.error;

        // Check nested error object
        if (err.error && typeof err.error === "object") {
            const nestedErr = err.error as Record<string, unknown>;
            if (typeof nestedErr.message === "string") return nestedErr.message;
        }

        // Check data.message (some APIs nest it)
        if (err.data && typeof err.data === "object") {
            const data = err.data as Record<string, unknown>;
            if (typeof data.message === "string") return data.message;
        }
    }

    return fallbackMessage;
};

/**
 * Extracts status code from error
 */
const extractStatusCode = (error: unknown): number | undefined => {
    if (!error || typeof error !== "object") return undefined;

    const err = error as Record<string, unknown>;

    if (typeof err.status === "number") return err.status;
    if (typeof err.statusCode === "number") return err.statusCode;

    return undefined;
};

/**
 * Detects the error type from an error object
 */
const detectErrorType = (error: unknown): ErrorType => {
    if (isConnectionError(error)) return ErrorTypes.CONNECTION_ERROR;
    if (isAuthError(error)) return ErrorTypes.NOT_AUTHENTICATED;
    if (isForbiddenError(error)) return ErrorTypes.FORBIDDEN;
    if (isNotFoundError(error)) return ErrorTypes.NOT_FOUND;
    if (isValidationError(error)) return ErrorTypes.VALIDATION_ERROR;
    if (isServerError(error)) return ErrorTypes.SERVER_ERROR;
    return ErrorTypes.UNKNOWN;
};

// ============================================================================
// Main Helper Functions
// ============================================================================

/**
 * Creates a standardized error response for failed actions
 * Automatically detects error type (connection, auth, server, etc.)
 * @param error - The error object from the API or operation
 * @param fallbackMessage - Default error message if none provided
 * @returns ActionResponse with success: false and typed error
 */
export const handleApiError = (
    error: Record<string, unknown> | unknown,
    fallbackMessage: string
): ActionResponse<never> => {
    const errorType = detectErrorType(error);
    const message = extractErrorMessage(error, fallbackMessage);
    const status = extractStatusCode(error);

    // Use user-friendly messages for specific error types
    const friendlyMessages: Partial<Record<ErrorType, string>> = {
        [ErrorTypes.CONNECTION_ERROR]:
            "Unable to connect to server. Please check your connection.",
        [ErrorTypes.NOT_AUTHENTICATED]: "Session expired. Please login again.",
        [ErrorTypes.FORBIDDEN]:
            "You do not have permission to perform this action.",
        [ErrorTypes.NOT_FOUND]: "The requested resource was not found.",
        [ErrorTypes.SERVER_ERROR]: "Server error. Please try again later.",
    };

    const errorDetails: ApiErrorDetails = {
        message: friendlyMessages[errorType] || message,
        type: errorType,
        status,
        ...(error as Record<string, unknown>),
    };

    return {
        success: false,
        error: errorDetails,
    };
};

/**
 * Creates a standardized success response for actions
 * @param data - Optional data to include in response
 * @param meta - Optional pagination metadata
 * @returns ActionResponse with success: true
 */
export const handleApiSuccess = <T>(
    data?: T,
    meta?: PaginationMeta
): ActionResponse<T> => {
    const response: ActionResponse<T> = {
        success: true,
    };

    if (data !== undefined) {
        response.data = data;
    }

    if (meta) {
        response.meta = meta;
    }

    return response;
};

/**
 * Extracts data and metadata from API response into ActionResponse format
 * @param response - The raw API response object
 * @returns ActionResponse with extracted data and optional metadata
 */
export const extractApiData = <T>(
    response: ApiResponse<T>
): ActionResponse<T> => {
    const actionResponse: ActionResponse<T> = {
        success: true,
        data: response.data,
    };

    if (response.meta) {
        actionResponse.meta = response.meta;
    }

    return actionResponse;
};

/**
 * Handles action result and throws error if action failed
 * Used in React Query hooks to convert ActionResponse to throwable errors
 * @param action - Promise that returns an ActionResponse
 * @returns The result if successful, throws Error if failed
 */
export const handleActionResult = async <T>(
    action: Promise<ActionResponse<T>>
): Promise<ActionResponse<T>> => {
    const result = await action;
    if (!result.success) {
        throw result.error;
    }
    return result;
};

// ============================================================================
// Utility Functions for Components
// ============================================================================

/**
 * Check if an error response is a connection error
 */
export const isConnectionErrorResponse = (
    response: ActionResponse<unknown>
): boolean => {
    if (response.success) return false;
    const error = response.error as ApiErrorDetails | undefined;
    return error?.type === ErrorTypes.CONNECTION_ERROR;
};

/**
 * Check if an error response is an authentication error
 */
export const isAuthErrorResponse = (
    response: ActionResponse<unknown>
): boolean => {
    if (response.success) return false;
    const error = response.error as ApiErrorDetails | undefined;
    return error?.type === ErrorTypes.NOT_AUTHENTICATED;
};

/**
 * Get error message from ActionResponse
 */
export const getErrorMessage = (
    response: ActionResponse<unknown>,
    fallback = "An error occurred"
): string => {
    if (response.success) return "";

    const error = response.error;

    if (typeof error === "string") return error;
    if (error && typeof error === "object" && "message" in error) {
        return (error as ApiErrorDetails).message;
    }

    return fallback;
};

/**
 * Get error type from ActionResponse
 */
export const getErrorType = (
    response: ActionResponse<unknown>
): ErrorType | null => {
    if (response.success) return null;

    const error = response.error;

    if (error && typeof error === "object" && "type" in error) {
        return (error as ApiErrorDetails).type;
    }

    return ErrorTypes.UNKNOWN;
};
