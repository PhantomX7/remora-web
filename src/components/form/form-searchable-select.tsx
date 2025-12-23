// @/components/form/form-searchable-select.tsx
"use client";

import { SearchableSelect } from "@/components/common/searchable-select";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import type { AnyFieldApi } from "@tanstack/react-form";

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
 * Props for FormSearchableSelect component.
 *
 * @template TData The type of the option object (e.g., Category, Brand)
 * @template TId The type of the ID used for looking up single items (default: any)
 */
interface FormSearchableSelectProps<TData = any, TId = any> {
    /** The TanStack Form field API object */
    field: AnyFieldApi;

    /** The label text displayed above the select input */
    label: string;

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

    /**
     * Custom ID for the field.
     * Defaults to the field name if not provided.
     */
    id?: string;

    /**
     * Displays a red asterisk next to the label.
     */
    required?: boolean;

    /**
     * Disables the interaction
     */
    disabled?: boolean;

    /**
     * Manually override the error message.
     * Useful for server-side errors not caught by form validation.
     */
    error?: string;

    /** Custom CSS classes for the outer Field wrapper */
    className?: string;
}

/**
 * A searchable select form field component integrated with TanStack Form.
 *
 * Wraps the SearchableSelect component with standard Label and Error handling.
 *
 * @template TData - The shape of the data object (e.g. Brand, Category)
 * @template TId - The type of the ID (string or number)
 *
 * @example
 * ```tsx
 * <FormSearchableSelect
 *   field={field}
 *   label="Brand"
 *   useSearchHook={useSearchBrands}
 *   useSingleItemHook={useBrand}
 *   getOptionLabel={(brand) => brand.name}
 *   getOptionValue={(brand) => brand.id.toString()}
 *   required
 * />
 * ```
 */
export function FormSearchableSelect<TData = any, TId = any>({
    field,
    label,
    id,
    required,
    error,
    className,
    ...selectProps
}: FormSearchableSelectProps<TData, TId>) {
    const { name, state, handleChange, handleBlur } = field;
    const { value, meta } = state;
    const fieldId = id || name;

    // Determine active errors (Custom error prop > Validation errors)
    const activeErrors = error
        ? [{ message: error }]
        : meta.isTouched && meta.errors.length
        ? meta.errors
        : undefined;

    return (
        <Field className={className}>
            <FieldLabel htmlFor={fieldId}>
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
            </FieldLabel>

            <SearchableSelect
                {...selectProps}
                value={value as TId}
                onValueChange={handleChange}
                onBlur={handleBlur}
                error={!!activeErrors}
            />

            {activeErrors && (
                <FieldError className="pl-2" errors={activeErrors} />
            )}
        </Field>
    );
}
