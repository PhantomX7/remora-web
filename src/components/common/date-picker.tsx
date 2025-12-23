"use client";

import * as React from "react";
import { format, isValid, parseISO } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

// ----------------------------------------------------------------------
// Types & Interfaces
// ----------------------------------------------------------------------

interface DatePickerProps {
    /**
     * The selected value.
     * - Single mode: ISO string ("2024-01-01T12:00") or Date string ("2024-01-01")
     * - Range mode: Comma separated string ("2024-01-01,2024-01-05")
     */
    value?: string;

    /** Callback returning the formatted string value. */
    onChange: (value: string) => void;

    /** Placeholder text when no date is selected. */
    placeholder?: string;

    /** If true, enables range selection (start date to end date). */
    mode?: "single" | "range";

    /** If true, shows a time picker input (Only available in 'single' mode). */
    withTime?: boolean;

    /** Disable the component. */
    disabled?: boolean;

    className?: string;
}

// ----------------------------------------------------------------------
// Helper Functions
// ----------------------------------------------------------------------

/** Safe parser for single dates (handles ISO and YYYY-MM-DD) */
const parseSingleDate = (val?: string): Date | undefined => {
    if (!val) return undefined;
    const date = parseISO(val); // robustly parses ISO 8601
    return isValid(date) ? date : undefined;
};

/** Safe parser for date ranges ("start,end") */
const parseDateRange = (val?: string): DateRange | undefined => {
    if (!val) return undefined;
    const [startStr, endStr] = val.split(",");
    const from = parseSingleDate(startStr);
    const to = parseSingleDate(endStr);
    return from ? { from, to } : undefined;
};

// ----------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------

/**
 * A flexible DatePicker component supporting Single Date, Date+Time, and Date Ranges.
 *
 * @example
 * // Single Date
 * <DatePicker value={date} onChange={setDate} />
 *
 * // Date + Time
 * <DatePicker value={date} onChange={setDate} withTime />
 *
 * // Date Range
 * <DatePicker value="2024-01-01,2024-01-05" onChange={setRange} mode="range" />
 */
export function DatePicker({
    value,
    onChange,
    mode = "single",
    withTime = false,
    placeholder = "Pick a date",
    disabled = false,
    className,
}: DatePickerProps) {
    const [isOpen, setIsOpen] = React.useState(false);

    // ----------------------------------------------------------------
    // Logic: Display Text
    // ----------------------------------------------------------------
    const displayValue = React.useMemo(() => {
        if (!value) return null;

        if (mode === "range") {
            const range = parseDateRange(value);
            if (!range?.from) return null;
            if (range.to) {
                return `${format(range.from, "LLL dd, y")} - ${format(
                    range.to,
                    "LLL dd, y"
                )}`;
            }
            return format(range.from, "LLL dd, y");
        }

        const date = parseSingleDate(value);
        if (!date) return null;
        return format(date, withTime ? "PPP p" : "PPP");
    }, [value, mode, withTime]);

    // ----------------------------------------------------------------
    // Logic: Handlers
    // ----------------------------------------------------------------

    // Handle Single Date Selection
    const handleSingleSelect = (date: Date | undefined) => {
        if (!date) {
            onChange("");
            return;
        }

        // If time is enabled, preserve existing time or default to 00:00
        if (withTime) {
            const current = parseSingleDate(value) || new Date();
            date.setHours(current.getHours());
            date.setMinutes(current.getMinutes());
            onChange(format(date, "yyyy-MM-dd'T'HH:mm"));
        } else {
            onChange(format(date, "yyyy-MM-dd"));
            setIsOpen(false);
        }
    };

    // Handle Time Change
    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const timeStr = e.target.value; // "HH:mm"
        const date = parseSingleDate(value) || new Date();
        const [hours, minutes] = timeStr.split(":").map(Number);

        date.setHours(hours);
        date.setMinutes(minutes);

        onChange(format(date, "yyyy-MM-dd'T'HH:mm"));
    };

    // Handle Range Selection
    const handleRangeSelect = (range: DateRange | undefined) => {
        if (!range?.from) {
            onChange("");
            return;
        }
        if (range.to) {
            onChange(
                `${format(range.from, "yyyy-MM-dd")},${format(
                    range.to,
                    "yyyy-MM-dd"
                )}`
            );
        } else {
            // Only start date selected so far
            onChange(`${format(range.from, "yyyy-MM-dd")}`);
        }
    };

    const handleClear = () => {
        onChange("");
        setIsOpen(false);
    };

    // Get current time string for the input
    const timeInputValue = React.useMemo(() => {
        const date = parseSingleDate(value);
        return date ? format(date, "HH:mm") : "00:00";
    }, [value]);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    disabled={disabled}
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !value && "text-muted-foreground",
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                    {displayValue || <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode={mode as any} // Cast because strict types differ slightly between single/range
                    selected={
                        mode === "range"
                            ? parseDateRange(value)
                            : parseSingleDate(value)
                    }
                    onSelect={
                        mode === "range"
                            ? (handleRangeSelect as any)
                            : handleSingleSelect
                    }
                    numberOfMonths={mode === "range" ? 2 : 1}
                    autoFocus
                />

                {/* Footer: Time Picker or Clear Button */}
                {(withTime || value) && (
                    <div className="border-t p-3 space-y-3">
                        {mode === "single" && withTime && (
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">
                                    Time
                                </span>
                                <Input
                                    type="time"
                                    className="h-8 flex-1"
                                    value={timeInputValue}
                                    onChange={handleTimeChange}
                                />
                            </div>
                        )}

                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-muted-foreground hover:text-foreground"
                            onClick={handleClear}
                        >
                            Clear Selection
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
