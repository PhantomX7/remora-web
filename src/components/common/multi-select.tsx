// @/components/common/multi-select.tsx
"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
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

export interface MultiSelectProps<TData = any> {
    /** List of items to select from */
    options: TData[];

    /** Array of selected values */
    selected: string[];

    /** Callback when selection changes */
    onChange: (values: string[]) => void;

    /** Function to derive the unique value from an item */
    getOptionValue?: (option: TData) => string;

    /** Function to derive the display label from an item */
    getOptionLabel?: (option: TData) => string;

    /** Placeholder text when nothing is selected */
    placeholder?: string;

    /** Maximum number of badges to show before truncating (+X more) */
    maxCount?: number;

    /** Disable the component */
    disabled?: boolean;

    className?: string;
}

/**
 * A flexible Multi-Select component allowing selection of multiple items from a list.
 * Supports generic data types, search, and badge display.
 *
 * @example
 * ```tsx
 * <MultiSelect
 *   options={users}
 *   selected={selectedUserIds}
 *   onChange={setSelectedUserIds}
 *   getOptionValue={(u) => u.id}
 *   getOptionLabel={(u) => u.fullName}
 * />
 * ```
 */
export function MultiSelect<TData = any>({
    options,
    selected,
    onChange,
    getOptionValue = (opt: any) => opt?.value || String(opt),
    getOptionLabel = (opt: any) => opt?.label || String(opt),
    placeholder = "Select options...",
    maxCount = 3,
    disabled = false,
    className,
}: MultiSelectProps<TData>) {
    const [open, setOpen] = React.useState(false);

    const handleSelect = (optionValue: string) => {
        const newSelected = selected.includes(optionValue)
            ? selected.filter((item) => item !== optionValue)
            : [...selected, optionValue];
        onChange(newSelected);
    };

    const handleRemove = (e: React.MouseEvent, optionValue: string) => {
        e.stopPropagation();
        onChange(selected.filter((item) => item !== optionValue));
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div
                    role="combobox"
                    aria-controls="multi-select-popover"
                    aria-expanded={open}
                    aria-disabled={disabled}
                    className={cn(
                        buttonVariants({ variant: "outline" }),
                        "w-full justify-between h-auto min-h-10 py-2 px-3",
                        disabled && "opacity-50 cursor-not-allowed",
                        className
                    )}
                    onClick={() => !disabled && setOpen(!open)}
                >
                    <div className="flex flex-wrap gap-1 items-center">
                        {selected.length === 0 && (
                            <span className="text-muted-foreground font-normal">
                                {placeholder}
                            </span>
                        )}

                        {selected.slice(0, maxCount).map((value) => {
                            const option = options.find(
                                (o) => getOptionValue(o) === value
                            );
                            if (!option) return null;

                            return (
                                <Badge
                                    key={value}
                                    variant="secondary"
                                    className="rounded-sm px-1 font-normal"
                                >
                                    {getOptionLabel(option)}
                                    <button
                                        className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                handleRemove(e as any, value);
                                            }
                                        }}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                        onClick={(e) => handleRemove(e, value)}
                                    >
                                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                    </button>
                                </Badge>
                            );
                        })}

                        {selected.length > maxCount && (
                            <Badge
                                variant="secondary"
                                className="rounded-sm px-1 font-normal"
                            >
                                +{selected.length - maxCount} more
                            </Badge>
                        )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </div>
            </PopoverTrigger>

            <PopoverContent
                className="w-[--radix-popover-trigger-width] p-0"
                align="start"
            >
                <Command>
                    <CommandInput placeholder="Search..." />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                            {options.map((option) => {
                                const value = getOptionValue(option);
                                const label = getOptionLabel(option);
                                const isSelected = selected.includes(value);

                                return (
                                    <CommandItem
                                        key={value}
                                        value={label} // Search by label
                                        onSelect={() => handleSelect(value)}
                                    >
                                        <div
                                            className={cn(
                                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                isSelected
                                                    ? "bg-primary text-primary-foreground"
                                                    : "opacity-50 [&_svg]:invisible"
                                            )}
                                        >
                                            <Check className="h-4 w-4" />
                                        </div>
                                        {label}
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
