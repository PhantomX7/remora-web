// @/components/form/form-image-upload.tsx
import { AnyFieldApi } from "@tanstack/react-form";
import ImageUpload from "@/components/common/image-upload";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Props for FormImageUpload component
 */
interface FormImageUploadProps {
    /** The TanStack Form field API object */
    field: AnyFieldApi;

    /** The label text displayed above the upload area */
    label: string;

    /**
     * URL for an image that was uploaded previously.
     * Useful for "Edit" forms to show the current avatar/banner.
     */
    initialImage?: string;

    /**
     * Maximum file size in bytes.
     * @default 5MB (5 * 1024 * 1024)
     */
    maxSize?: number;

    /**
     * Accepted MIME types string.
     * @default "image/jpeg,image/png,image/webp"
     */
    accept?: string;

    /**
     * Displays a red asterisk next to the label to indicate importance.
     * Note: Does not enforce validation logic itself.
     */
    required?: boolean;

    /** Custom CSS classes applied to the outer container */
    className?: string;

    /**
     * Manually override the error message.
     * If not provided, it uses the error from the field state.
     */
    error?: string;
}

/**
 * A single image upload form field component.
 *
 * @example
 * <FormImageUpload
 *   field={field}
 *   label="Avatar"
 *   maxSize={2000000}
 * />
 */
export function FormImageUpload({
    field,
    label,
    initialImage,
    maxSize = 5 * 1024 * 1024,
    accept = "image/jpeg,image/png,image/webp",
    required,
    error,
    className,
}: FormImageUploadProps) {
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

            <ImageUpload
                value={value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                initialImage={initialImage}
                error={error || fieldError}
                maxSize={maxSize}
                accept={accept}
            />
        </div>
    );
}
