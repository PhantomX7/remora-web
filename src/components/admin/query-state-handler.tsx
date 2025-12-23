// @/components/admin/query-state-handler.tsx
import Link from "next/link";
import { PropsWithChildren } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, RefreshCcw, Loader2 } from "lucide-react";

interface QueryStateHandlerProps<T = unknown> extends PropsWithChildren {
  isLoading: boolean;
  error?: Error | string | null;
  data?: T;
  onRetry?: () => void;
  backLink?: string;
  loadingText?: string;
  errorTitle?: string;
  emptyMessage?: string;
}

export function QueryStateHandler({
  isLoading,
  error,
  data,
  children,
  onRetry,
  backLink,
  loadingText = "Loading...",
  errorTitle = "Something went wrong",
  emptyMessage = "No data available",
}: QueryStateHandlerProps) {
  
  // Loading State
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{loadingText}</p>
      </div>
    );
  }

  // Error State
  if (error) {
    const errorMessage = error instanceof Error ? error.message : typeof error === "string" ? error : "An unexpected error occurred";

    return (
      <div className="flex flex-col items-center justify-center py-12 max-w-md mx-auto text-center gap-4">
        <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-3">
          <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{errorTitle}</h3>
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {onRetry && (
            <Button onClick={onRetry} className="gap-2">
              <RefreshCcw className="h-4 w-4" /> Try Again
            </Button>
          )}
          {backLink && (
            <Button variant="outline" asChild className="gap-2">
              <Link href={backLink}>
                <ArrowLeft className="h-4 w-4" /> Go Back
              </Link>
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Empty State (Strict check for null/undefined allows 0 or false to pass)
  if (data === null || data === undefined) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  // 4. Success
  return <>{children}</>;
}