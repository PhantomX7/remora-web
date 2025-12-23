// @/components/form/form-file-upload.tsx
import { AnyFieldApi } from "@tanstack/react-form";
import { FileUpload } from "@/components/common/file-upload";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Props for FormFileUpload component
 */
interface FormFileUploadProps {
    /** Field API from TanStack Form */
    field: AnyFieldApi;

    /** Upload field label */
    label: string;

    /**
     * Maximum file size in bytes
     * @default 10MB
     */
    maxSize?: number;

    /**
     * Accepted file types (MIME types or extensions)
     * @default "*_/_*"
     */
    accept?: string;

    /** Placeholder text */
    placeholder?: string;

    /** Custom CSS classes for the container */
    className?: string;

    /** Manually force an error message */
    error?: string;

    /** Disables interaction */
    disabled?: boolean;

    /** Adds a visual asterisk */
    required?: boolean;
}

/**
 * A file upload component integrated with TanStack Form.
 * Wraps the generic FileUpload component with Label and Error handling.
 *
 * @example
 * ```tsx
 * <FormFileUpload
 *   field={field}
 *   label="Profile Picture"
 *   accept="image/*"
 *   maxSize={5000000} // 5MB
 * />
 * ```
 */
export function FormFileUpload({
    field,
    label,
    maxSize = 10 * 1024 * 1024,
    accept = "*/*",
    placeholder = "Select a file",
    required,
    error,
    disabled,
    className,
}: FormFileUploadProps) {
    const { value, meta } = field.state;
    const fieldError =
        meta.isTouched && meta.errors.length
            ? String(meta.errors[0])
            : undefined;

    return (
        <div className={cn("space-y-2", className)}>
            <Label htmlFor={field.name}>
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
            </Label>

            <FileUpload
                value={value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                maxSize={maxSize}
                accept={accept}
                placeholder={placeholder}
                error={error || fieldError}
                disabled={disabled}
            />
        </div>
    );
}
