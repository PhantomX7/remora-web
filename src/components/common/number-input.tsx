"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

// ----------------------------------------------------------------------
// Number Input
// ----------------------------------------------------------------------

interface NumberInputProps
    extends Omit<
        React.ComponentProps<"input">,
        "value" | "onChange" | "min" | "max"
    > {
    /** The numeric value (or string representation). */
    value?: string | number;
    /** Callback returning the raw numeric string (e.g., "1000"). */
    onValueChange?: (value: string) => void;
    /** Minimum allowed value. */
    min?: number;
    /** Maximum allowed value. */
    max?: number;
    /** Locale for formatting (default: "en-US"). Use "de-DE" for dots as separators. */
    locale?: string;
}

/**
 * A numeric input that formats numbers with thousand separators on blur.
 * Switches to raw input on focus for easy editing.
 *
 * @example
 * <NumberInput
 *   value={price}
 *   onValueChange={setPrice}
 *   placeholder="0"
 *   locale="de-DE" // results in 1.000.000
 * />
 */
export function NumberInput({
    value,
    onValueChange,
    onBlur,
    min,
    max,
    locale = "en-US", // Default to standard comma separators
    className,
    ...props
}: NumberInputProps) {
    // Internal state to manage display value (raw vs formatted)
    const [displayValue, setDisplayValue] = React.useState("");
    const [isFocused, setIsFocused] = React.useState(false);

    // Formatter instance
    const formatter = React.useMemo(
        () => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }),
        [locale]
    );

    // Sync internal state with external value prop
    React.useEffect(() => {
        if (isFocused) return; // Don't interrupt typing
        if (value === undefined || value === "") {
            setDisplayValue("");
        } else {
            const num = Number(value);
            setDisplayValue(isNaN(num) ? "" : formatter.format(num));
        }
    }, [value, isFocused, formatter]);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        // On focus, show raw number for editing
        setDisplayValue(value?.toString() || "");
        props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);

        // 1. Parse current input to number
        // Remove non-numeric chars except possible negative signs
        const rawNum = displayValue.replace(/[^0-9-]/g, "");
        let finalVal = rawNum === "" ? "" : Number(rawNum);

        // 2. Apply constraints
        if (typeof finalVal === "number") {
            if (min !== undefined && finalVal < min) finalVal = min;
            if (max !== undefined && finalVal > max) finalVal = max;
        }

        // 3. Emit change
        onValueChange?.(finalVal.toString());

        // 4. Update display to formatted version immediately
        if (finalVal !== "") {
            setDisplayValue(formatter.format(finalVal as number));
        }

        onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Allow digits only while typing
        const raw = e.target.value.replace(/[^0-9-]/g, "");
        setDisplayValue(raw);
    };

    return (
        <Input
            {...props}
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={cn("bg-background", className)}
        />
    );
}

// ----------------------------------------------------------------------
// Number Range Input
// ----------------------------------------------------------------------

interface NumberRangeInputProps
    extends Omit<NumberInputProps, "value" | "onValueChange"> {
    /** Current range value in format "min,max" (e.g., "100,500"). */
    value?: string;
    /** Callback returning "min,max". */
    onValueChange?: (value: string) => void;
    /** Placeholder for the start input. */
    minPlaceholder?: string;
    /** Placeholder for the end input. */
    maxPlaceholder?: string;
}

/**
 * A compound input for selecting a numeric range (min/max).
 *
 * @example
 * <NumberRangeInput
 *   value={rangeString} // "100,500"
 *   onValueChange={setRangeString}
 *   min={0}
 * />
 */
export function NumberRangeInput({
    value,
    onValueChange,
    minPlaceholder = "Min",
    maxPlaceholder = "Max",
    className,
    ...props
}: NumberRangeInputProps) {
    // Safe split: handles undefined/null gracefully
    const [minValue, maxValue] = (value || "").split(",");

    const handleMinChange = (newMin: string) => {
        onValueChange?.(`${newMin},${maxValue || ""}`);
    };

    const handleMaxChange = (newMax: string) => {
        onValueChange?.(`${minValue || ""},${newMax}`);
    };

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <NumberInput
                {...props}
                value={minValue}
                onValueChange={handleMinChange}
                placeholder={minPlaceholder}
                className="flex-1"
            />
            <span className="text-muted-foreground text-sm font-medium">
                to
            </span>
            <NumberInput
                {...props}
                value={maxValue}
                onValueChange={handleMaxChange}
                placeholder={maxPlaceholder}
                className="flex-1"
            />
        </div>
    );
}
