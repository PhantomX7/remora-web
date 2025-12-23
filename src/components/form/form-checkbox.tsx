// @/components/form/form-checkbox.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { AnyFieldApi } from "@tanstack/react-form";

/**
 * Props for the FormCheckbox component.
 */
interface FormCheckboxProps {
    /** The TanStack Form field API object */
    field: AnyFieldApi;

    /** The primary label for the checkbox */
    label: string;

    /** Optional ID (defaults to field name if omitted) */
    id?: string;

    /** Helper text displayed below the label */
    description?: string;

    /**
     * Where to place the label relative to the checkbox.
     * @default "right"
     */
    labelPosition?: "left" | "right";

    /** Custom class names for the wrapper div */
    className?: string;

    /** Disables the input and dims the label */
    disabled?: boolean;

    /** Adds a visual asterisk for required fields */
    required?: boolean;
}

/**
 * A checkbox component integrated with TanStack Form.
 * Handles validation states, error messages, and accessible labeling.
 *
 * @example
 * ```tsx
 * <FormCheckbox
 *   field={field}
 *   label="Subscribe to newsletter"
 *   description="We promise not to spam you."
 * />
 * ```
 */
export function FormCheckbox({
    field,
    label,
    id,
    description,
    labelPosition = "right",
    className,
    disabled,
    required,
}: FormCheckboxProps) {
    const inputId = id || field.name;

    // Extract state
    const { value, meta } = field.state;
    const error = meta.isTouched && meta.errors.length ? meta.errors[0] : null;
    const hasError = !!error;

    return (
        <div className={className}>
            <div
                className={cn(
                    "flex items-start gap-3",
                    // Use CSS for order swapping instead of conditional JSX
                    labelPosition === "left" && "flex-row-reverse justify-end"
                )}
            >
                {/* Checkbox Input */}
                <Checkbox
                    id={inputId}
                    checked={!!value}
                    onCheckedChange={field.handleChange}
                    onBlur={field.handleBlur}
                    disabled={disabled}
                    aria-invalid={hasError}
                    aria-describedby={hasError ? `${inputId}-error` : undefined}
                    className={cn("mt-1", hasError && "border-destructive")}
                />

                {/* Label Content */}
                <div className="flex-1 space-y-1 leading-none">
                    <Label
                        htmlFor={inputId}
                        className={cn(
                            "text-sm font-medium cursor-pointer",
                            disabled && "cursor-not-allowed opacity-70"
                        )}
                    >
                        {label}
                        {required && (
                            <span className="ml-1 text-destructive">*</span>
                        )}
                    </Label>

                    {description && (
                        <p className="text-xs text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <p
                    id={`${inputId}-error`}
                    className="text-sm text-destructive mt-1 pl-1"
                >
                    {String(error)}
                </p>
            )}
        </div>
    );
}
