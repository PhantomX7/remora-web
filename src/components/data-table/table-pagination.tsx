// components/data-table/table-pagination.tsx
import { Button } from "@/components/ui/button";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";

interface TablePaginationProps {
    /** Current active page (1-based index) */
    currentPage: number;
    /** Number of items per page */
    pageSize: number;
    /** Total number of items in the database */
    totalCount: number;
    /** Callback when page changes */
    onPageChange: (page: number) => void;
    /** Disables controls while data is fetching */
    isLoading?: boolean;
}

/**
 * A comprehensive pagination toolbar.
 * Displays result counts (e.g., "1 to 10 of 50") and navigation controls.
 *
 * @example
 * <TablePagination
 *   currentPage={meta.page}
 *   pageSize={meta.limit}
 *   totalCount={meta.total}
 *   onPageChange={handlePageChange}
 * />
 */
export function TablePagination({
    currentPage,
    pageSize,
    totalCount,
    onPageChange,
    isLoading = false,
}: TablePaginationProps) {
    const totalPages = Math.ceil(totalCount / pageSize);

    // Calculate display range (e.g., "Showing 1-10 of 50")
    const startRow = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endRow = Math.min(currentPage * pageSize, totalCount);

    // Helper to generate page numbers with a sliding window
    const getPageNumbers = () => {
        const delta = 2; // Number of pages to show on each side of current
        const range = [];
        const rangeWithDots = [];

        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 ||
                i === totalPages ||
                (i >= currentPage - delta && i <= currentPage + delta)
            ) {
                range.push(i);
            }
        }

        let l;
        for (const i of range) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push("...");
                }
            }
            rangeWithDots.push(i);
            l = i;
        }

        return rangeWithDots;
    };

    if (totalCount === 0) return null;

    return (
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between w-full">
            {/* Left Side: Result Text */}
            <p className="text-sm text-muted-foreground order-2 sm:order-1">
                Showing <span className="font-medium">{startRow}</span>
                {" to "}
                <span className="font-medium">{endRow}</span> of{" "}
                <span className="font-medium">{totalCount}</span> results
            </p>

            {/* Right Side: Navigation Buttons */}
            <div className="flex items-center space-x-2 order-1 sm:order-2">
                {/* First Page */}
                <Button
                    variant="outline"
                    className="hidden h-8 w-8 p-0 lg:flex"
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1 || isLoading}
                >
                    <span className="sr-only">Go to first page</span>
                    <ChevronsLeft className="h-4 w-4" />
                </Button>

                {/* Previous Page */}
                <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isLoading}
                >
                    <span className="sr-only">Go to previous page</span>
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, i) =>
                        page === "..." ? (
                            <span
                                key={`dots-${i}`}
                                className="text-muted-foreground px-2"
                            >
                                ...
                            </span>
                        ) : (
                            <Button
                                key={page}
                                variant={
                                    currentPage === page ? "default" : "outline"
                                }
                                className="h-8 w-10 p-0"
                                onClick={() => onPageChange(Number(page))}
                                disabled={isLoading}
                            >
                                {page}
                            </Button>
                        )
                    )}
                </div>

                {/* Next Page */}
                <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || isLoading}
                >
                    <span className="sr-only">Go to next page</span>
                    <ChevronRight className="h-4 w-4" />
                </Button>

                {/* Last Page */}
                <Button
                    variant="outline"
                    className="hidden h-8 w-8 p-0 lg:flex"
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages || isLoading}
                >
                    <span className="sr-only">Go to last page</span>
                    <ChevronsRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
