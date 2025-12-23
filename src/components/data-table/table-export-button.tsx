"use client";

import { useState } from "react";
import { Download, FileDown, Loader2 } from "lucide-react";
import { Button, ButtonProps } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface TableExportButtonProps extends ButtonProps {
    onExport: () => Promise<void>;
    onExportAll?: () => Promise<void>;
    exportLabel?: string;
    exportAllLabel?: string;
    isFiltered?: boolean;
}

export function TableExportButton({
    onExport,
    onExportAll,
    exportLabel = "Export Current",
    exportAllLabel = "Export All Data",
    isFiltered = false,
    variant = "outline",
    size = "sm",
    className,
    children, // Destructure children here for cleaner access
    ...props
}: TableExportButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleAction = async (action: () => Promise<void>) => {
        if (isLoading) return;
        setIsLoading(true);

        toast.promise(action(), {
            loading: "Preparing download...",
            success: "Export completed successfully",
            error: "Failed to export data",
            finally: () => setIsLoading(false),
        });
    };

    // FIX: Define this as a variable containing JSX, not a component function
    const content = (
        <>
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Download className="mr-2 h-4 w-4" />
            )}
            {/* If no children provided, default to "Export" */}
            {children || (isLoading ? "Exporting..." : "Export")}
        </>
    );

    // 1. Simple Mode: Just a button
    if (!onExportAll) {
        return (
            <Button
                variant={variant}
                size={size}
                disabled={isLoading}
                onClick={() => handleAction(onExport)}
                className={className}
                {...props}
            >
                {/* Render the variable directly */}
                {content}
            </Button>
        );
    }

    // 2. Dropdown Mode
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant={variant}
                    size={size}
                    disabled={isLoading}
                    className={className}
                    {...props}
                >
                    {/* Render the variable directly */}
                    {content}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleAction(onExport)}>
                    <Download className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{exportLabel}</span>
                    {isFiltered && (
                        <span className="ml-auto text-xs text-muted-foreground italic">
                            (Filtered)
                        </span>
                    )}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => handleAction(onExportAll)}>
                    <FileDown className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{exportAllLabel}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}