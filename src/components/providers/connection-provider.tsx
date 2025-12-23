// providers/connection-provider.tsx
"use client";

import {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { WifiOff, RefreshCw, X, LogOut, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    ErrorTypes,
    type ErrorType,
    type ApiErrorDetails,
} from "@/lib/helpers";
import { logoutAction } from "@/actions/admin/auth";

// --- Types ---
interface ConnectionState {
    isOffline: boolean;
    error: string | null;
    errorType: ErrorType | null;
}

interface ConnectionContextType extends ConnectionState {
    retry: () => void;
    dismiss: () => void;
    forceLogout: () => Promise<void>;
}

// --- Context ---
const ConnectionContext = createContext<ConnectionContextType | null>(null);

export function useConnection() {
    const context = useContext(ConnectionContext);
    if (!context) {
        throw new Error("useConnection must be used within ConnectionProvider");
    }
    return context;
}

// --- Provider ---
export function ConnectionProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient();

    const [state, setState] = useState<ConnectionState>({
        isOffline: false,
        error: null,
        errorType: null,
    });

    // Actions
    const dismiss = useCallback(() => {
        setState((prev) => ({ ...prev, error: null, errorType: null }));
    }, []);

    const retry = useCallback(() => {
        dismiss();
        setState((prev) => ({ ...prev, isOffline: false }));
        queryClient.invalidateQueries(); // Retrigger data fetch
    }, [dismiss, queryClient]);

    const forceLogout = useCallback(async () => {
        try {
            await logoutAction();
        } catch (e) {
            console.error("Logout failed", e);
        } finally {
            queryClient.clear();
            window.location.href = "/admin/login";
        }
    }, [queryClient]);

    // Event Listeners (Network & Custom API Events)
    useEffect(() => {
        const handleOnline = () => {
            setState((prev) => ({ ...prev, isOffline: false }));

            queryClient.resumePausedMutations();
            queryClient.invalidateQueries();
        };

        const handleOffline = () => {
            setState({
                isOffline: true,
                error: "You are offline. Please check your internet connection.",
                errorType: ErrorTypes.CONNECTION_ERROR,
            });
        };

        // Listen for the custom event dispatched by ReactQueryProvider
        const handleApiError = (event: Event) => {
            const detail = (event as CustomEvent<ApiErrorDetails>).detail;
            setState((prev) => ({
                ...prev,
                error: detail.message,
                errorType: detail.type,
                isOffline: detail.type === ErrorTypes.CONNECTION_ERROR,
            }));
        };

        // Initial check
        if (!navigator.onLine) handleOffline();

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
        window.addEventListener("app:api-error", handleApiError);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
            window.removeEventListener("app:api-error", handleApiError);
        };
    }, [queryClient]);

    return (
        <ConnectionContext.Provider
            value={{ ...state, retry, dismiss, forceLogout }}
        >
            {children}
            {state.error && <ConnectionErrorBanner />}
        </ConnectionContext.Provider>
    );
}

// --- Sub-Component: Banner ---
function ConnectionErrorBanner() {
    const { error, errorType, retry, dismiss, forceLogout } = useConnection();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const isConnection = errorType === ErrorTypes.CONNECTION_ERROR;
    const isServer = errorType === ErrorTypes.SERVER_ERROR;

    // Determine styles based on error type
    const styles = isConnection
        ? { bg: "bg-orange-700", Icon: WifiOff }
        : isServer
        ? { bg: "bg-red-700", Icon: AlertTriangle }
        : { bg: "bg-destructive", Icon: AlertTriangle };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300">
            <div className={`mx-auto max-w-3xl p-3 shadow-lg ${styles.bg}`}>
                <div className="flex flex-col gap-3 text-white sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <styles.Icon className="h-5 w-5 shrink-0" />
                        <p className="text-sm font-medium leading-tight">
                            {error}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                        <Button
                            size="sm"
                            variant="secondary"
                            className="h-8 border-0 bg-white/10 text-white hover:bg-white/20"
                            onClick={retry}
                        >
                            <RefreshCw className="mr-2 h-3.5 w-3.5" />
                            Retry
                        </Button>

                        <Button
                            size="sm"
                            variant="secondary"
                            className="h-8 border-0 bg-white/10 text-white hover:bg-white/20"
                            onClick={async () => {
                                setIsLoggingOut(true);
                                await forceLogout();
                            }}
                            disabled={isLoggingOut}
                        >
                            <LogOut className="mr-2 h-3.5 w-3.5" />
                            {isLoggingOut ? "..." : "Exit"}
                        </Button>

                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={dismiss}
                            className="h-8 w-8 p-0 text-white hover:bg-white/20 hover:text-white"
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Dismiss</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
