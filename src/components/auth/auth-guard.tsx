// components/auth/auth-guard.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAdminAuth } from "@/hooks/admin/use-auth";
import { Loader2, WifiOff, RefreshCw, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuthGuardProps {
    children: React.ReactNode;
    requiredRoles?: string[];
}

const FORCE_LOGOUT_DELAY_MS = 5000;

export function AuthGuard({ children, requiredRoles }: AuthGuardProps) {
    const { user, status, error, refetch, forceLogout } = useAdminAuth();
    const router = useRouter();
    const pathname = usePathname();

    const [showForceLogout, setShowForceLogout] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Derived state
    const isLoading = status === "loading";
    const isError = status === "error";
    const isAuthenticated = status === "authenticated" || (isError && !!user);
    const hasAccess =
        !requiredRoles?.length || (user && requiredRoles.includes(user.role));

    // Blocking state check (Loading or Hard Error)
    const isBlocking = isLoading || (isError && !user);

    // Timer Effect
    useEffect(() => {
        // Only run timer logic if we are in a blocking state
        if (!isBlocking) return;

        const timer = setTimeout(() => {
            setShowForceLogout(true);
        }, FORCE_LOGOUT_DELAY_MS);

        // Cleanup: Clear timer AND reset state when dependencies change
        // (e.g. when loading finishes or component unmounts)
        return () => {
            clearTimeout(timer);
            setShowForceLogout(false);
        };
    }, [isBlocking]);

    // Handle Redirection
    useEffect(() => {
        if (isLoading) return;

        if (status === "unauthenticated") {
            const params = new URLSearchParams({ from: pathname });
            router.replace(`/admin/login?${params.toString()}`);
        } else if (user && !hasAccess) {
            router.replace("/error/403");
        }
    }, [status, user, hasAccess, isLoading, router, pathname]);

    // 1. Render Children (Happy Path or Offline/Cached Mode)
    if (isAuthenticated && hasAccess) {
        return <>{children}</>;
    }

    // 2. Prevent rendering while redirecting
    if (status === "unauthenticated" || (user && !hasAccess)) {
        return null;
    }

    // 3. Blocking States UI
    return (
        <FullScreenMessage
            icon={
                isError ? (
                    <div className="rounded-full bg-destructive/10 p-4">
                        <WifiOff className="h-8 w-8 text-destructive" />
                    </div>
                ) : (
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                )
            }
            title={
                isError
                    ? "Connection Error"
                    : showForceLogout
                    ? "Taking longer than expected..."
                    : "Verifying session..."
            }
            description={
                isError ? error || "Unable to connect to the server" : undefined
            }
        >
            {(showForceLogout || isError) && (
                <div className="mt-2 flex flex-col items-center gap-3">
                    {isError && (
                        <div className="flex gap-2">
                            {/* FIX: Wrap refetch in anonymous function to avoid type mismatch */}
                            <Button size="sm" onClick={() => refetch()}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Try Again
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.location.reload()}
                            >
                                Refresh Page
                            </Button>
                        </div>
                    )}

                    {showForceLogout && (
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={async () => {
                                setIsLoggingOut(true);
                                await forceLogout();
                            }}
                            disabled={isLoggingOut}
                            className="text-muted-foreground hover:text-destructive"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            {isLoggingOut ? "Logging out..." : "Force Logout"}
                        </Button>
                    )}
                </div>
            )}
        </FullScreenMessage>
    );
}

function FullScreenMessage({
    icon,
    title,
    description,
    children,
}: {
    icon: React.ReactNode;
    title: string;
    description?: string;
    children?: React.ReactNode;
}) {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
            {icon}
            <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">
                    {title}
                </p>
                {description && (
                    <p className="mt-1 text-xs text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
            {children}
        </div>
    );
}
