// @/components/data-table/table-search.tsx
"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Props for the TableSearch component.
 */
interface TableSearchProps {
    /**
     * The raw search string coming from the parent state or URL.
     * This is the "controlled" value.
     */
    value: string;

    /**
     * Callback fired after the debounce delay (300ms) has passed
     * since the last keystroke.
     */
    onSearch: (value: string) => void;

    /**
     * Placeholder text for the input field.
     * @default "Search..."
     */
    placeholder?: string;

    /** Additional CSS classes for the wrapper div. */
    className?: string;
}

/**
 * A search input component designed for Data Tables.
 *
 * Features:
 * - **Debouncing**: Updates the parent state only after the user stops typing (300ms delay), preventing excessive API calls.
 * - **Immediate Feedback**: Maintains local state so the input feels responsive while typing.
 * - **External Sync**: Automatically updates if the parent value changes (e.g., via a "Clear Filters" button).
 * - **Clear Button**: Integrated "X" button to instantly clear the search.
 *
 * @example
 * ```tsx
 * <TableSearch
 *   value={urlParams.search}
 *   onSearch={(val) => updateUrl({ search: val })}
 *   placeholder="Search users..."
 * />
 * ```
 */
export function TableSearch({
    value,
    onSearch,
    placeholder = "Search...",
    className,
}: TableSearchProps) {
    // Internal state allows immediate UI feedback while typing,
    // decoupling the display value from the debounced parent update.
    const [localValue, setLocalValue] = React.useState(value);

    // Sync local state if parent value changes externally
    // (e.g., URL changed via back button or "Clear All" action)
    React.useEffect(() => {
        setLocalValue(value || "");
    }, [value]);

    const debouncedUpdate = useDebouncedCallback((val: string) => {
        onSearch(val);
    }, 300);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setLocalValue(val);
        debouncedUpdate(val);
    };

    const handleClear = () => {
        setLocalValue("");
        debouncedUpdate.cancel(); // Cancel any pending debounces
        onSearch(""); // Trigger immediate update
    };

    return (
        <div className={cn("relative flex-1 w-full", className)}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder={placeholder}
                value={localValue}
                onChange={handleChange}
                className="pl-10 pr-10"
            />
            {localValue && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-transparent text-muted-foreground hover:text-foreground"
                    type="button"
                    aria-label="Clear search"
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}
