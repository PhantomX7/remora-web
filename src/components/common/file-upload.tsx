// components/ui/file-upload.tsx
import { Upload, File, X } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Props for FileUpload component
 * @interface FileUploadProps
 */
interface FileUploadProps {
    /** Current file value */
    value?: File | null;
    /** File change handler */
    onChange: (file: File | null) => void;
    /** Blur event handler */
    onBlur?: () => void;
    /** Maximum file size in bytes */
    maxSize?: number;
    /** Accepted file types */
    accept?: string;
    /** Placeholder text */
    placeholder?: string;
    /** Error message to display */
    error?: string;
    /** Whether the input is disabled */
    disabled?: boolean;
    /** Additional CSS classes */
    className?: string;
}

/**
 * A file upload component with drag and drop support
 * @component FileUpload
 */
export function FileUpload({
    value,
    onChange,
    onBlur,
    maxSize = 10 * 1024 * 1024, // 10MB default
    accept = "*/*",
    placeholder = "Select a file",
    error,
    disabled = false,
    className,
}: FileUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileSelect = (file: File) => {
        if (maxSize && file.size > maxSize) {
            return;
        }
        onChange(file);
        onBlur?.();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(null);
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (!disabled) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (disabled) return;

        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    return (
        <div className="space-y-2">
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={handleFileChange}
                disabled={disabled}
                id="file-upload-input"
            />

            <div
                onClick={() => !disabled && inputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                    isDragging && "border-primary bg-primary/5",
                    error && "border-destructive",
                    disabled && "opacity-50 cursor-not-allowed",
                    !value && "hover:border-primary/50",
                    className
                )}
            >
                {value ? (
                    <div className="space-y-3">
                        <File className="mx-auto h-12 w-12 text-primary" />
                        <div>
                            <p className="font-medium text-sm">{value.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {formatFileSize(value.size)}
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleRemove}
                            disabled={disabled}
                            className="gap-2"
                        >
                            <X className="h-4 w-4" />
                            Remove
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium">{placeholder}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {isDragging
                                    ? "Drop file here"
                                    : "Click to browse or drag and drop"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Max size: {formatFileSize(maxSize)}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <p className="text-sm text-destructive">{error}</p>
            )}
        </div>
    );
}