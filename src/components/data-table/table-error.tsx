import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TableErrorProps {
    /**
     * The error to display.
     * Can be a standard Error object or a custom string message.
     */
    error: Error | string;

    /**
     * Callback function to retry the failed action.
     * If omitted, the retry button will not be rendered.
     */
    onRetry?: () => void;

    /** Additional CSS classes for the container. */
    className?: string;
}

/**
 * A lightweight error state component designed for Data Tables or Dashboard widgets.
 * Displays an icon, the error message, and an optional retry button.
 *
 * @example
 * ```tsx
 * // Inside a Table Body or conditionally rendering the Table
 * if (isError) {
 *   return <TableError error={error} onRetry={refetch} />;
 * }
 * ```
 */
export function TableError({ error, onRetry, className }: TableErrorProps) {
    const message = typeof error === "string" ? error : error.message;

    return (
        <div
            role="alert"
            className={cn(
                "flex flex-col items-center justify-center py-10 px-4 text-center animate-in fade-in zoom-in-95",
                className
            )}
        >
            <div className="bg-destructive/10 p-3 rounded-full mb-4">
                <AlertCircle className="h-6 w-6 text-destructive" />
            </div>

            <h3 className="font-semibold text-lg tracking-tight">
                Something went wrong
            </h3>

            <p className="text-sm text-muted-foreground mt-1 mb-6 max-w-sm text-balance">
                {message}
            </p>

            {onRetry && (
                <Button
                    onClick={onRetry}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                >
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                </Button>
            )}
        </div>
    );
}
