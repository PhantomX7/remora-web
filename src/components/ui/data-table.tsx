"use client";

import * as React from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    SortingState,
    getSortedRowModel,
    OnChangeFn,
    ColumnResizeMode,
} from "@tanstack/react-table";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    isLoading?: boolean;
    error?: Error | string | null;
    title?: string;
    emptyMessage?: string;
    emptyAction?: {
        label: string;
        onClick: () => void;
    };
    headerAction?: React.ReactNode;
    onSortingChange?: OnChangeFn<SortingState>;
    initialSorting?: SortingState;
    enableColumnResizing?: boolean;
    wrapText?: boolean;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    isLoading = false,
    error = null,
    title,
    emptyMessage = "No data found",
    emptyAction,
    headerAction,
    onSortingChange,
    initialSorting = [],
    enableColumnResizing = false,
    wrapText = true,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>(initialSorting);

    const table = useReactTable({
        data,
        columns,
        columnResizeMode: "onChange" as ColumnResizeMode,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: onSortingChange || setSorting,
        getSortedRowModel: getSortedRowModel(),
        enableColumnResizing,
        state: {
            sorting: onSortingChange ? initialSorting : sorting,
        },
    });

    // Render card wrapper
    const CardWrapper = ({ children }: { children: React.ReactNode }) => (
        <Card>
            {(title || headerAction) && (
                <CardHeader className="flex flex-row items-center justify-between">
                    {title && <CardTitle>{title}</CardTitle>}
                    {headerAction}
                </CardHeader>
            )}
            <CardContent>{children}</CardContent>
        </Card>
    );

    // Loading state
    if (isLoading) {
        return (
            <CardWrapper>
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-[250px]" />
                                <Skeleton className="h-4 w-[200px]" />
                            </div>
                        </div>
                    ))}
                </div>
            </CardWrapper>
        );
    }

    // Error state
    if (error) {
        return (
            <CardWrapper>
                <div className="flex items-center justify-center py-8">
                    <div className="text-sm text-destructive">
                        Error loading data:{" "}
                        {typeof error === "string"
                            ? error
                            : error?.message || "Unknown error"}
                    </div>
                </div>
            </CardWrapper>
        );
    }

    // Empty state
    if (!data || data.length === 0) {
        return (
            <CardWrapper>
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                    <p className="text-sm text-muted-foreground">
                        {emptyMessage}
                    </p>
                    {emptyAction && (
                        <Button onClick={emptyAction.onClick}>
                            {emptyAction.label}
                        </Button>
                    )}
                </div>
            </CardWrapper>
        );
    }

    // Table state
    return (
        <CardWrapper>
            <div className="overflow-auto w-full">
                <Table className="w-full table-fixed">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    const columnDef = header.column.columnDef;
                                    
                                    // Build style object with optional size constraints
                                    const style: React.CSSProperties = {
                                        position: "relative",
                                    };

                                    // Apply size (width) if defined
                                    if (columnDef.size !== undefined) {
                                        style.width = enableColumnResizing
                                            ? `${header.getSize()}px`
                                            : `${columnDef.size}px`;
                                    }

                                    // Apply minSize if defined
                                    if (columnDef.minSize !== undefined) {
                                        style.minWidth = `${columnDef.minSize}px`;
                                    }

                                    // Apply maxSize if defined
                                    if (columnDef.maxSize !== undefined) {
                                        style.maxWidth = `${columnDef.maxSize}px`;
                                    }

                                    return (
                                        <TableHead
                                            key={header.id}
                                            style={style}
                                            className={
                                                wrapText
                                                    ? "whitespace-normal"
                                                    : "whitespace-nowrap"
                                            }
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef.header,
                                                      header.getContext()
                                                  )}

                                            {/* Column resize handle */}
                                            {enableColumnResizing &&
                                                header.column.getCanResize() && (
                                                    <div
                                                        onMouseDown={header.getResizeHandler()}
                                                        onTouchStart={header.getResizeHandler()}
                                                        className={`absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none bg-border hover:bg-primary ${
                                                            header.column.getIsResizing()
                                                                ? "bg-primary w-2"
                                                                : ""
                                                        }`}
                                                        style={{
                                                            transform:
                                                                header.column.getIsResizing()
                                                                    ? `translateX(${
                                                                          table.getState()
                                                                              .columnSizingInfo
                                                                              .deltaOffset ?? 0
                                                                      }px)`
                                                                    : "",
                                                        }}
                                                    />
                                                )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                            >
                                {row.getVisibleCells().map((cell) => {
                                    const columnDef = cell.column.columnDef;
                                    
                                    // Build style object with optional size constraints
                                    const style: React.CSSProperties = {};

                                    // Apply size (width) if defined
                                    if (columnDef.size !== undefined) {
                                        style.width = enableColumnResizing
                                            ? `${cell.column.getSize()}px`
                                            : `${columnDef.size}px`;
                                    }

                                    // Apply minSize if defined
                                    if (columnDef.minSize !== undefined) {
                                        style.minWidth = `${columnDef.minSize}px`;
                                    }

                                    // Apply maxSize if defined
                                    if (columnDef.maxSize !== undefined) {
                                        style.maxWidth = `${columnDef.maxSize}px`;
                                    }

                                    return (
                                        <TableCell
                                            key={cell.id}
                                            style={style}
                                            className={
                                                wrapText
                                                    ? "wrap-break-word whitespace-normal"
                                                    : "truncate"
                                            }
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </CardWrapper>
    );
}