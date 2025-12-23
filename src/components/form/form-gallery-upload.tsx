// @/components/form/form-gallery-upload.tsx
import { AnyFieldApi } from "@tanstack/react-form";
import GalleryUpload from "@/components/common/gallery-upload";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Props for FormGalleryUpload component
 */
interface FormGalleryUploadProps {
    /** The TanStack Form field API object */
    field: AnyFieldApi;

    /** The label text displayed above the upload area */
    label: string;

    /**
     * Array of URLs for images that were uploaded previously.
     * Useful for "Edit" forms.
     */
    initialImages?: string[];

    /**
     * Callback function triggered when a user deletes one of the initialImages.
     * Use this to mark images for deletion in your backend.
     */
    onInitialImageRemove?: (imageUrl: string) => void;

    /**
     * Maximum number of files allowed.
     * @default 10
     */
    maxFiles?: number;

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
 * A gallery upload form field component for uploading multiple images.
 * Handles array-based error passing required by complex uploaders.
 *
 * @example
 * <FormGalleryUpload
 *   field={field}
 *   label="Product Gallery"
 *   maxFiles={5}
 * />
 */
export function FormGalleryUpload({
    field,
    label,
    initialImages = [],
    onInitialImageRemove,
    maxFiles = 10,
    maxSize = 5 * 1024 * 1024,
    accept = "image/jpeg,image/png,image/webp",
    required,
    error,
    className,
}: FormGalleryUploadProps) {
    const { value, meta } = field.state;
    const fieldError =
        meta.isTouched && meta.errors.length
            ? String(meta.errors[0])
            : undefined;

    // GalleryUpload likely expects an array of strings for errors
    const activeError = error ? [error] : fieldError ? [fieldError] : undefined;

    return (
        <div className={cn("space-y-2", className)}>
            <Label htmlFor={field.name}>
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
            </Label>

            <GalleryUpload
                value={value || []}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                initialImages={initialImages}
                onInitialImageRemove={onInitialImageRemove}
                error={activeError}
                maxFiles={maxFiles}
                maxSize={maxSize}
                accept={accept}
            />
        </div>
    );
}
