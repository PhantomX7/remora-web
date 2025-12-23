// @/components/common/searchable-select.tsx
"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useDebounce } from "use-debounce";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

/**
 * Interface representing the return value of a data fetching hook.
 * Includes 'undefined' to handle TanStack Query states safely.
 */
interface SearchHookResult<T = any> {
    /**
     * The data returned by the hook.
     * Can be a direct array T[], a paginated response object { data: T[] }, or null/undefined.
     */
    data?: T[] | { data?: T[] } | null;
    /** Whether the data is currently being fetched */
    isLoading: boolean;
}

/**
 * Props for SearchableSelect component.
 *
 * @template TData The type of the option object (e.g., Category, Brand)
 * @template TId The type of the ID used for looking up single items (default: any)
 */
interface SearchableSelectProps<TData = any, TId = any> {
    /** The currently selected value (ID) */
    value?: TId;

    /**
     * Callback fired when the selection changes.
     * @param value The new selected value (ID)
     */
    onValueChange?: (value: TId) => void;

    /** Callback fired when the input loses focus */
    onBlur?: () => void;

    /**
     * Hook to fetch options based on a search string.
     * @param search The current search string typed by the user
     * @param enabled Whether the query should run (usually true only when the dropdown is open)
     */
    useSearchHook: (
        search: string,
        enabled: boolean
    ) => SearchHookResult<TData>;

    /**
     * Hook to fetch a single item by ID for initial label display.
     * Uses TId to allow hooks that strictly expect numbers OR strings.
     * @param id The ID of the currently selected value
     */
    useSingleItemHook: (id: TId) => { data?: TData; isLoading?: boolean };

    /**
     * Function to extract the display label from an option object.
     * @default (opt) => opt.name
     */
    getOptionLabel?: (option: TData) => string;

    /**
     * Function to extract the unique value (ID) from an option object.
     * @default (opt) => opt.id
     */
    getOptionValue?: (option: TData) => string;

    /** Placeholder text displayed when no selection is made */
    placeholder?: string;

    /** Disables the interaction */
    disabled?: boolean;

    /** Custom CSS classes for the trigger button */
    className?: string;

    /** Whether the button should display error styling */
    error?: boolean;
}

/**
 * An async searchable select component (Combobox) with debounced search.
 * Handles searching, loading states, and resolving the initial label for a selected ID.
 *
 * @template TData - The shape of the data object (e.g. Brand, Category)
 * @template TId - The type of the ID (string or number)
 *
 * @example
 * ```tsx
 * <SearchableSelect
 *   value={brandId}
 *   onValueChange={setBrandId}
 *   useSearchHook={useSearchBrands}
 *   useSingleItemHook={useBrand}
 *   getOptionLabel={(brand) => brand.name}
 *   getOptionValue={(brand) => brand.id.toString()}
 *   placeholder="Select a brand..."
 * />
 * ```
 */
export function SearchableSelect<TData = any, TId = any>({
    value,
    onValueChange,
    onBlur,
    useSearchHook,
    useSingleItemHook,
    getOptionLabel = (opt: any) => opt?.name || "",
    getOptionValue = (opt: any) => String(opt?.id || ""),
    placeholder = "Select an option...",
    disabled,
    className,
    error,
}: SearchableSelectProps<TData, TId>) {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch] = useDebounce(searchTerm, 300);

    // 1. Fetch single item data to resolve label if ID exists
    const { data: selectedItem } = useSingleItemHook((value || 0) as TId);

    // 2. Fetch search results
    const { data: searchResult, isLoading } = useSearchHook(
        debouncedSearch,
        open
    );

    // Safe parsing: Handle if data is undefined, an array, or an object with .data
    const options = Array.isArray(searchResult)
        ? searchResult
        : searchResult?.data || [];

    // 3. Resolve Display Label
    // Prioritize finding the selected value in the search results, fallback to the single item fetch
    const selectedOption =
        options.find((opt: any) => getOptionValue(opt) === String(value)) ||
        selectedItem;
    const displayLabel = selectedOption
        ? getOptionLabel(selectedOption)
        : placeholder;

    const handleSelect = (currentValue: string) => {
        // Attempt to parse number to match backend types (if ID was a number)
        const numericVal = Number(currentValue);
        const finalVal = isNaN(numericVal) ? currentValue : numericVal;

        onValueChange?.(finalVal as TId);
        setOpen(false);
        setSearchTerm("");
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    onBlur={onBlur}
                    className={cn(
                        "w-full justify-between font-normal",
                        !value && "text-muted-foreground",
                        error &&
                            "border-destructive hover:border-destructive/80",
                        className
                    )}
                >
                    <span className="truncate">{displayLabel}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent
                className="w-[--radix-popover-trigger-width] p-0"
                align="start"
            >
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search..."
                        value={searchTerm}
                        onValueChange={setSearchTerm}
                    />
                    <CommandList>
                        {isLoading ? (
                            <div className="py-6 flex justify-center text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                        ) : options.length === 0 ? (
                            <CommandEmpty>No results found.</CommandEmpty>
                        ) : (
                            <CommandGroup>
                                {options.map((option: any) => {
                                    const val = getOptionValue(option);
                                    const isSelected = String(value) === val;

                                    return (
                                        <CommandItem
                                            key={val}
                                            value={val}
                                            onSelect={handleSelect}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    isSelected
                                                        ? "opacity-100"
                                                        : "opacity-0"
                                                )}
                                            />
                                            {getOptionLabel(option)}
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
