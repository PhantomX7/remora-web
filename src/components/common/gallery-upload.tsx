// components/admin/gallery-upload.tsx
'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  formatBytes,
  useFileUpload,
  type FileMetadata,
  type FileWithPreview,
} from '@/hooks/use-file-upload';
import { Alert, AlertDescription,  AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ImageIcon, TriangleAlert, Upload, XIcon, ZoomInIcon } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface GalleryUploadProps {
  maxFiles?: number;
  maxSize?: number;
  accept?: string;
  className?: string;
  value?: File[];
  onChange?: (files: File[]) => void;
  onBlur?: () => void;
  initialImages?: string[];
  onInitialImageRemove?: (imageUrl: string) => void;
  error?: string[];
}

export default function GalleryUpload({
  maxFiles = 10,
  maxSize = 5 * 1024 * 1024,
  accept = 'image/*',
  className,
  onChange,
  onBlur,
  initialImages = [],
  onInitialImageRemove,
  error,
}: GalleryUploadProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const initialFiles = useMemo<FileMetadata[]>(
    () =>
      initialImages.map((url, index) => ({
        id: `initial-${index}`,
        name: `image-${index + 1}.jpg`,
        size: 0,
        type: 'image/jpeg',
        url,
      })),
    [initialImages]
  );

  // Memoize the callback to prevent re-renders
  const handleFilesChange = useCallback((fileItems: FileWithPreview[]) => {
    const fileObjects = fileItems.map((f) => f.file).filter((f) => f instanceof File) as File[];
    
    // Defer the state update to the next tick
    setTimeout(() => {
      onChange?.(fileObjects);
    }, 0);
  }, [onChange]);

  const [
    { files, isDragging, errors },
    { removeFile, clearFiles, handleDragEnter, handleDragLeave, handleDragOver, handleDrop, openFileDialog, getInputProps },
  ] = useFileUpload({
    maxFiles,
    maxSize,
    accept,
    multiple: true,
    initialFiles: initialFiles.length > 0 ? initialFiles : undefined,
    onFilesChange: handleFilesChange,
  });

  const displayErrors = error?.length ? error : errors;
  const hasFiles = files.length > 0;
  const hasErrors = displayErrors.length > 0;
  const totalSize = useMemo(() => files.reduce((acc, file) => acc + file.file.size, 0), [files]);

  const handleRemove = useCallback((id: string) => {
    const fileItem = files.find((f) => f.id === id);
    
    if (fileItem) {
      const file = fileItem.file as File | FileMetadata;
      if ('url' in file && onInitialImageRemove) {
        // Defer the callback to prevent state updates during render
        setTimeout(() => {
          onInitialImageRemove(file.url);
        }, 0);
      }
    }
    
    removeFile(id);
  }, [files, onInitialImageRemove, removeFile]);

  return (
    <div className={cn('w-full', className)}>
      <UploadArea
        isDragging={isDragging}
        hasErrors={hasErrors}
        maxSize={maxSize}
        maxFiles={maxFiles}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onBlur={onBlur}
        getInputProps={getInputProps}
        openFileDialog={openFileDialog}
      />

      {hasFiles && <GalleryStats count={files.length} maxFiles={maxFiles} totalSize={totalSize} onClear={clearFiles} />}

      {hasFiles && <ImageGrid files={files} onView={setSelectedImage} onRemove={handleRemove} />}

      {hasErrors && <ErrorAlert errors={displayErrors} />}

      {selectedImage && <ImagePreviewModal image={selectedImage} onClose={() => setSelectedImage(null)} />}
    </div>
  );
}

interface UploadAreaProps {
  isDragging: boolean;
  hasErrors: boolean;
  maxSize: number;
  maxFiles: number;
  onDragEnter: (e: React.DragEvent<HTMLElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLElement>) => void;
  onDrop: (e: React.DragEvent<HTMLElement>) => void;
  onBlur?: () => void;
  getInputProps: () => any;
  openFileDialog: () => void;
}

function UploadArea({
  isDragging,
  hasErrors,
  maxSize,
  maxFiles,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onBlur,
  getInputProps,
  openFileDialog,
}: UploadAreaProps) {
  return (
    <div
      className={cn(
        'relative rounded-lg border border-dashed p-8 text-center transition-colors',
        isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50',
        hasErrors && 'border-destructive'
      )}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <input {...getInputProps()} className="sr-only" onBlur={onBlur} />

      <div className="flex flex-col items-center gap-4">
        <div className={cn('flex h-16 w-16 items-center justify-center rounded-full', isDragging ? 'bg-primary/10' : 'bg-muted')}>
          <ImageIcon className={cn('h-5 w-5', isDragging ? 'text-primary' : 'text-muted-foreground')} />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Upload images to gallery</h3>
          <p className="text-sm text-muted-foreground">Drag and drop images here or click to browse</p>
          <p className="text-xs text-muted-foreground">
            PNG, JPG, WebP up to {formatBytes(maxSize)} each (max {maxFiles} files)
          </p>
        </div>

        <Button onClick={openFileDialog} type="button">
          <Upload className="h-4 w-4" />
          Select images
        </Button>
      </div>
    </div>
  );
}

interface GalleryStatsProps {
  count: number;
  maxFiles: number;
  totalSize: number;
  onClear: () => void;
}

function GalleryStats({ count, maxFiles, totalSize, onClear }: GalleryStatsProps) {
  return (
    <div className="mt-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h4 className="text-sm font-medium">
          Gallery ({count}/{maxFiles})
        </h4>
        <div className="text-xs text-muted-foreground">Total: {formatBytes(totalSize)}</div>
      </div>
      <Button onClick={onClear} variant="outline" size="sm" type="button">
        Clear all
      </Button>
    </div>
  );
}

interface ImageGridProps {
  files: FileWithPreview[];
  onView: (preview: string) => void;
  onRemove: (id: string) => void;
}

function ImageGrid({ files, onView, onRemove }: ImageGridProps) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {files.map((fileItem) => (
        <ImageCard key={fileItem.id} fileItem={fileItem} onView={onView} onRemove={onRemove} />
      ))}
    </div>
  );
}

interface ImageCardProps {
  fileItem: FileWithPreview;
  onView: (preview: string) => void;
  onRemove: (id: string) => void;
}

function ImageCard({ fileItem, onView, onRemove }: ImageCardProps) {
  const file = fileItem.file as File | FileMetadata;
  const isImage = file.type?.startsWith('image/');
  const isInitialImage = 'url' in file;

  return (
    <div className="group relative aspect-square">
      {isImage && fileItem.preview ? (
        <Image
          src={fileItem.preview}
          alt={file.name}
          className="h-full w-full rounded-lg border object-cover transition-transform group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-lg border bg-muted">
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}

      {isInitialImage && (
        <div className="absolute top-2 left-2 rounded-full bg-blue-500 px-2 py-1 text-xs text-white">
          Existing
        </div>
      )}

      <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-lg bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
        {fileItem.preview && (
          <Button onClick={() => onView(fileItem.preview!)} variant="secondary" size="icon" className="size-7" type="button">
            <ZoomInIcon className="h-4 w-4" />
          </Button>
        )}
        <Button onClick={() => onRemove(fileItem.id)} variant="secondary" size="icon" className="size-7" type="button">
          <XIcon className="h-4 w-4" />
        </Button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-black/70 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100">
        <p className="truncate text-xs font-medium">{file.name}</p>
        <p className="text-xs text-gray-300">{formatBytes(file.size)}</p>
      </div>
    </div>
  );
}

interface ErrorAlertProps {
  errors: string[];
}

function ErrorAlert({ errors }: ErrorAlertProps) {
  return (
    <Alert variant="destructive" className="mt-5">
      <TriangleAlert /> 
      
      <AlertTitle>Upload Error</AlertTitle>
      
      <AlertDescription>
        {errors.map((err, index) => (
          <p key={index}>{err}</p>
        ))}
      </AlertDescription>
    </Alert>
  );
}

interface ImagePreviewModalProps {
  image: string;
  onClose: () => void;
}

function ImagePreviewModal({ image, onClose }: ImagePreviewModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="relative max-h-full max-w-full">
        <Image src={image} alt="Preview" className="max-h-full max-w-full rounded-lg object-contain" onClick={(e) => e.stopPropagation()} />
        <Button onClick={onClose} variant="secondary" size="icon" className="absolute end-2 top-2 size-7" type="button">
          <XIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}