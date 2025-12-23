import { Filter, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { SortFieldConfig } from "@/types/pagination";

// ----------------------------------------------------------------------
// 1. Filter Toggle Button
// ----------------------------------------------------------------------

interface TableFilterToggleProps {
    /** Number of currently active filters. */
    activeCount: number;
    /** Whether the filter panel is currently visible. */
    isOpen: boolean;
    /** Callback to toggle the panel. */
    onToggle: () => void;
}

export function TableFilterToggle({
    activeCount,
    isOpen,
    onToggle,
}: TableFilterToggleProps) {
    return (
        <Button
            variant={isOpen ? "secondary" : "outline"}
            size="sm"
            onClick={onToggle}
            className="h-9 gap-2 lg:flex"
        >
            <Filter className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Filters</span>
            {activeCount > 0 && (
                <Badge
                    variant="secondary"
                    className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full px-0 text-[10px]"
                >
                    {activeCount}
                </Badge>
            )}
        </Button>
    );
}

// ----------------------------------------------------------------------
// 2. Sort Selector
// ----------------------------------------------------------------------

interface TableSortProps {
    /** Array of sortable field configurations */
    fields: SortFieldConfig[];
    /** Current sort value (e.g. "name asc") */
    value: string;
    /** Callback when sort changes */
    onChange: (value: string) => void;
}

export function TableSort({ fields, value, onChange }: TableSortProps) {
    if (fields.length === 0) return null;

    return (
        <Select
            value={value || "default"}
            onValueChange={(val) => onChange(val === "default" ? "" : val)}
        >
            <SelectTrigger className="h-9 w-[140px] sm:w-[160px]">
                <div className="flex items-center gap-2 truncate">
                    <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                    <SelectValue placeholder="Sort by..." />
                </div>
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="default">
                    <span className="text-muted-foreground">
                        Default (No Sort)
                    </span>
                </SelectItem>
                {fields.map((field) => (
                    <div key={field.field}>
                        <SelectItem value={`${field.field} asc`}>
                            <div className="flex items-center gap-2">
                                <ArrowUp className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>{field.label} (Asc)</span>
                            </div>
                        </SelectItem>
                        <SelectItem value={`${field.field} desc`}>
                            <div className="flex items-center gap-2">
                                <ArrowDown className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>{field.label} (Desc)</span>
                            </div>
                        </SelectItem>
                    </div>
                ))}
            </SelectContent>
        </Select>
    );
}

// ----------------------------------------------------------------------
// 3. Page Size (Limit) Selector
// ----------------------------------------------------------------------

interface TablePageSizeSelectorProps {
    /** Current selection (e.g., 10). */
    value: number;
    /** Callback when value changes. */
    onChange: (value: number) => void;
    /** Available options. Default: [10, 20, 50, 100] */
    options?: number[];
}

export function TablePageSizeSelector({
    value,
    onChange,
    options = [10, 20, 50, 100],
}: TablePageSizeSelectorProps) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground hidden sm:inline-block">
                Rows:
            </span>
            <Select
                value={String(value)}
                onValueChange={(val) => onChange(Number(val))}
            >
                <SelectTrigger className="h-9 w-[70px]">
                    <SelectValue placeholder={value} />
                </SelectTrigger>
                <SelectContent side="bottom">
                    {options.map((pageSize) => (
                        <SelectItem key={pageSize} value={String(pageSize)}>
                            {pageSize}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
