// components/data-table/table-filter-panel.tsx
"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Common Inputs
import { MultiSelect } from "@/components/common/multi-select";
import { DatePicker } from "@/components/common/date-picker";
import { SearchableSelect } from "@/components/common/searchable-select";
import {
    NumberInput,
    NumberRangeInput,
} from "@/components/common/number-input";

// Types & Utils
import { FilterFieldConfig, FilterOperator } from "@/types/pagination";

// ----------------------------------------------------------------------
// Constants & Utils
// ----------------------------------------------------------------------

const OPERATOR_LABELS: Record<FilterOperator, string> = {
    eq: "Is",
    neq: "Is not",
    in: "Is one of",
    not_in: "Is not one of",
    like: "Contains",
    between: "Between",
    gt: "Greater than",
    gte: "Greater or equal",
    lt: "Less than",
    lte: "Less or equal",
};

function parseFilterValue(raw: string, defaultOp: FilterOperator = "eq") {
    if (!raw) return { operator: defaultOp, value: "" };

    const sortedOps = Object.keys(OPERATOR_LABELS).sort(
        (a, b) => b.length - a.length
    );

    for (const op of sortedOps) {
        if (raw.startsWith(`${op}:`)) {
            return {
                operator: op as FilterOperator,
                value: raw.slice(op.length + 1),
            };
        }
    }

    return { operator: defaultOp, value: raw };
}

function formatFilterValue(operator: FilterOperator, value: string): string {
    if (!value) return "";
    return operator === "eq" ? value : `${operator}:${value}`;
}

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------

interface TableFilterPanelProps {
    fields: FilterFieldConfig[];
    values: Record<string, string>;
    activeCount: number;
    onChange: (field: string, value: string) => void;
    onClearAll: () => void;
}

export function TableFilterPanel({
    fields,
    values,
    activeCount,
    onChange,
    onClearAll,
}: TableFilterPanelProps) {
    return (
        <div className="rounded-lg border bg-muted/40 p-4 shadow-sm animate-in slide-in-from-top-2">
            <div className="mb-4 flex items-center justify-between">
                <h4 className="text font-semibold tracking-tight">
                    Advanced Filters
                </h4>
                {activeCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClearAll}
                        className="h-8 px-2 text-muted-foreground hover:text-destructive"
                    >
                        <X className="mr-2 h-3.5 w-3.5" />
                        Clear All
                    </Button>
                )}
            </div>

            {/* Layout: Max 3 columns per row */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {fields.map((field) => (
                    <FilterFieldItem
                        key={field.field}
                        field={field}
                        rawFilterValue={values[field.field] || ""}
                        onChange={(val) => onChange(field.field, val)}
                    />
                ))}
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// Individual Filter Item
// ----------------------------------------------------------------------

function FilterFieldItem({
    field,
    rawFilterValue,
    onChange,
}: {
    field: FilterFieldConfig;
    rawFilterValue: string;
    onChange: (val: string) => void;
}) {
    const defaultOp = field.operators?.[0] || "eq";
    const { operator: parsedOperator, value: parsedValue } = parseFilterValue(
        rawFilterValue,
        defaultOp
    );

    // Maintain local operator state so UI persists even if value is empty
    const [currentOperator, setCurrentOperator] =
        React.useState<FilterOperator>(parsedOperator);

    React.useEffect(() => {
        if (parsedValue) {
            setCurrentOperator(parsedOperator);
        }
    }, [parsedOperator, parsedValue]);

    const handleOperatorChange = (newOp: FilterOperator) => {
        setCurrentOperator(newOp);
        if (parsedValue) {
            onChange(formatFilterValue(newOp, parsedValue));
        }
    };

    const handleValueChange = (newVal: string) => {
        onChange(formatFilterValue(currentOperator, newVal));
    };

    const showOperatorSelector = (field.operators?.length || 0) > 1;

    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground">
                {field.label}
            </label>

            <div className="flex w-full gap-2">
                {showOperatorSelector && (
                    <Select
                        value={currentOperator}
                        onValueChange={(v) =>
                            handleOperatorChange(v as FilterOperator)
                        }
                    >
                        {/* Width adjusted for text-sm */}
                        <SelectTrigger className="w-[120px] shrink-0 bg-background text-sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {field.operators?.map((op) => (
                                <SelectItem
                                    key={op}
                                    value={op}
                                    className="text-sm"
                                >
                                    {OPERATOR_LABELS[op]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}

                <FilterInputRenderer
                    field={field}
                    value={parsedValue}
                    operator={currentOperator}
                    onChange={handleValueChange}
                />
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// Input Renderer Strategy
// ----------------------------------------------------------------------

function FilterInputRenderer({
    field,
    value,
    operator,
    onChange,
}: {
    field: FilterFieldConfig;
    value: string;
    operator: FilterOperator;
    onChange: (val: string) => void;
}) {
    // Strategy: Select / MultiSelect
    const options = React.useMemo(() => {
        if (field.options) return field.options;
        if (field.enumValues) {
            return field.enumValues.map((val) => ({
                label:
                    val.charAt(0).toUpperCase() +
                    val.slice(1).replace(/_/g, " "),
                value: val,
            }));
        }
        return [];
    }, [field.options, field.enumValues]);

    // Strategy: ID with Async Search
    if (field.type === "ID" && field.useSearchHook && field.useSingleItemHook) {
        return (
            <SearchableSelect
                value={value || undefined}
                onValueChange={(val) => {
                    // Toggle logic: If clicking the selected item, uncheck it (set to empty)
                    const stringVal = String(val);
                    if (stringVal === value) {
                        onChange("");
                    } else {
                        onChange(stringVal);
                    }
                }}
                placeholder={field.placeholder || "Search..."}
                useSearchHook={field.useSearchHook}
                useSingleItemHook={field.useSingleItemHook}
                getOptionLabel={field.getOptionLabel}
                getOptionValue={field.getOptionValue}
                className="w-full"
            />
        );
    }

    // Strategy: Number
    if (field.type === "NUMBER") {
        if (operator === "between") {
            // Use buffered input to prevent searching on partial data
            return <BufferedNumberRange value={value} onChange={onChange} />;
        }
        return (
            <NumberInput
                value={value}
                onValueChange={onChange}
                placeholder={field.placeholder}
                className="w-full"
            />
        );
    }

    // Strategy: Date
    if (field.type === "DATE" || field.type === "DATETIME") {
        return (
            <DatePicker
                value={value}
                onChange={onChange}
                withTime={field.type === "DATETIME"}
                mode={operator === "between" ? "range" : "single"}
                placeholder={field.placeholder}
                className="w-full flex-1"
            />
        );
    }

    if (options.length > 0 || field.type === "BOOL") {
        const isMulti = operator === "in" || operator === "not_in";
        const finalOptions = options.length
            ? options
            : [
                  { label: "Yes", value: "true" },
                  { label: "No", value: "false" },
              ];

        if (isMulti) {
            return (
                <MultiSelect
                    options={finalOptions}
                    selected={value ? value.split(",") : []}
                    onChange={(vals) => onChange(vals.join(","))}
                    placeholder={field.placeholder}
                    className="w-full"
                />
            );
        }

        return (
            <Select
                value={value || "ALL"}
                onValueChange={(v) => onChange(v === "ALL" ? "" : v)}
            >
                <SelectTrigger className="w-full bg-background text-sm">
                    <SelectValue placeholder={field.placeholder || "All"} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL" className="text-sm">
                        All
                    </SelectItem>
                    {finalOptions.map((opt) => (
                        <SelectItem
                            key={opt.value}
                            value={opt.value}
                            className="text-sm"
                        >
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        );
    }

    // Strategy: Default Text
    return (
        <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className="bg-background"
        />
    );
}

// ----------------------------------------------------------------------
// Internal Helper: Buffered Number Range
// ----------------------------------------------------------------------

/**
 * A wrapper around NumberRangeInput that only triggers `onChange`
 * when BOTH values are present (or BOTH are empty).
 * This prevents the table from searching while the user has only typed one side.
 */
function BufferedNumberRange({
    value,
    onChange,
}: {
    value: string;
    onChange: (val: string) => void;
}) {
    // Local state allows immediate UI updates while typing
    const [localValue, setLocalValue] = React.useState(value);

    // Sync from parent (e.g. if "Clear All" is clicked)
    React.useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleLocalChange = (newVal: string) => {
        setLocalValue(newVal);

        const [min, max] = newVal.split(",");

        // Valid conditions to trigger search:
        // 1. Both Empty (Clearing)
        // 2. Both Filled (Ready to search)
        const isBothEmpty = !min && !max;
        const isBothFilled = min && max;

        if (isBothEmpty || isBothFilled) {
            onChange(newVal);
        }
        // If partial (one filled, one empty), we update UI (setLocalValue)
        // but DO NOT trigger parent onChange.
    };

    return (
        <NumberRangeInput
            value={localValue}
            onValueChange={handleLocalChange}
            minPlaceholder="Min"
            maxPlaceholder="Max"
            className="w-full"
        />
    );
}
