"use client";

import { useState, useCallback } from "react";
import { useFileUpload, type FileWithPreview } from "@/hooks/use-file-upload";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    CloudUpload,
    ImageIcon,
    TriangleAlert,
    Upload,
    XIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ImageUploadProps {
    maxSize?: number;
    accept?: string;
    className?: string;
    value?: File | null;
    onChange?: (file: File | null) => void;
    onBlur?: () => void;
    initialImage?: string;
    aspectRatio?: string | number;
    showTips?: boolean;
    error?: string;
}

export default function ImageUpload({
    maxSize = 5 * 1024 * 1024,
    accept = "image/*",
    className,
    value,
    onChange,
    onBlur,
    initialImage,
    aspectRatio = "1 / 1",
    showTips = true,
    error,
}: ImageUploadProps) {
    const [coverImage, setCoverImage] = useState<FileWithPreview | null>(() => {
        if (value) {
            return {
                id: "value-image",
                file: value,
                preview: URL.createObjectURL(value),
            };
        }
        if (!initialImage) return null;
        return {
            id: "initial-image",
            file: {
                id: "initial-image",
                name: "image.jpg",
                size: 0,
                type: "image/jpeg",
                url: initialImage,
            },
            preview: initialImage,
        };
    });

    const [imageLoading, setImageLoading] = useState(!!initialImage);

    // Memoize the callback to prevent re-renders
    const handleFilesChange = useCallback((files: FileWithPreview[]) => {
        if (files[0]) {
            setImageLoading(true);
            setCoverImage(files[0]);
            
            // Defer the state update to the next tick
            setTimeout(() => {
                onChange?.(files[0].file as File);
            }, 0);
        }
    }, [onChange]);

    const [
        { isDragging, errors },
        {
            handleDragEnter,
            handleDragLeave,
            handleDragOver,
            handleDrop,
            openFileDialog,
            getInputProps,
        },
    ] = useFileUpload({
        maxFiles: 1,
        maxSize,
        accept,
        multiple: false,
        onFilesChange: handleFilesChange,
    });

    const handleRemove = useCallback(() => {
        setCoverImage(null);
        setImageLoading(false);
        
        // Defer the state update to the next tick
        setTimeout(() => {
            onChange?.(null);
        }, 0);
    }, [onChange]);

    const containerStyle = {
        aspectRatio:
            typeof aspectRatio === "number" ? String(aspectRatio) : aspectRatio,
    };

    const displayErrors = error ? [error] : errors;

    return (
        <div className={cn("w-full space-y-4", className)}>
            {/* Upload Area */}
            <div
                className={cn(
                    "group relative overflow-hidden rounded-lg border transition-all duration-200",
                    isDragging && "border-dashed border-primary bg-primary/5",
                    coverImage
                        ? "border-border hover:border-primary/50"
                        : "border-dashed border-muted-foreground/25 bg-muted/30 hover:border-primary hover:bg-primary/5",
                    error && "border-destructive"
                )}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <input
                    {...getInputProps()}
                    className="sr-only"
                    onBlur={onBlur}
                />

                {coverImage ? (
                    <div className="relative w-full" style={containerStyle}>
                        {/* Loading State */}
                        {imageLoading && (
                            <div className="absolute inset-0 flex items-center justify-center animate-pulse bg-muted">
                                <ImageIcon className="size-8 text-muted-foreground" />
                            </div>
                        )}

                        {/* Image */}
                        <Image
                            src={coverImage.preview}
                            alt="Upload preview"
                            className={cn(
                                "h-full w-full object-cover transition-opacity",
                                imageLoading ? "opacity-0" : "opacity-100"
                            )}
                            width={200}
                            height={200}
                            onLoad={() => setImageLoading(false)}
                            onError={() => setImageLoading(false)}
                        />

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200" />

                        {/* Action Buttons */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex gap-2">
                                <Button
                                    onClick={openFileDialog}
                                    variant="secondary"
                                    size="sm"
                                    className="bg-white/90 hover:bg-white"
                                    type="button"
                                >
                                    <Upload className="size-4" />
                                    Change
                                </Button>
                                <Button
                                    onClick={handleRemove}
                                    variant="destructive"
                                    size="sm"
                                    type="button"
                                >
                                    <XIcon className="size-4" />
                                    Remove
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Empty State */
                    <div
                        className="flex w-full cursor-pointer flex-col items-center justify-center gap-4 p-8 text-center"
                        style={containerStyle}
                        onClick={openFileDialog}
                    >
                        <div className="rounded-full bg-primary/10 p-4">
                            <CloudUpload className="size-8 text-primary" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">
                                Upload Image
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Drag and drop an image here, or click to browse
                            </p>
                        </div>
                        <Button variant="outline" size="sm" type="button">
                            <ImageIcon className="size-4" />
                            Browse Files
                        </Button>
                    </div>
                )}
            </div>

            {/* Errors - Fixed Structure */}
            {displayErrors.length > 0 && (
                <Alert variant="destructive">
                    {/* Icon must be direct child */}
                    <TriangleAlert /> 
                    
                    {/* Title must be direct child */}
                    <AlertTitle>Upload Error</AlertTitle>
                    
                    {/* Description must be direct child */}
                    <AlertDescription>
                        {displayErrors.map((error, i) => (
                            <p key={i}>{error}</p>
                        ))}
                    </AlertDescription>
                </Alert>
            )}

            {/* Tips */}
            {showTips && (
                <div className="rounded-lg bg-muted/50 p-4">
                    <h4 className="mb-2 text-sm font-medium">
                        Image Guidelines
                    </h4>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                        <li>• Supported formats: JPG, PNG, WebP</li>
                        <li>
                            • Maximum file size:{" "}
                            {(maxSize / 1024 / 1024).toFixed(0)}MB
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
}