'use client';

import { useState, useCallback } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DragDropZoneProps {
  onFile: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  disabled?: boolean;
}

export function DragDropZone({
  onFile,
  accept = 'image/*',
  maxSizeMB = 5,
  disabled = false,
}: DragDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrag = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (disabled) return;

      if (e.type === 'dragenter' || e.type === 'dragover') {
        setIsDragOver(true);
      } else if (e.type === 'dragleave') {
        setIsDragOver(false);
      }
    },
    [disabled]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files && files[0]) {
        onFile(files[0]);
      }
    },
    [disabled, onFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;

      const files = e.target.files;
      if (files && files[0]) {
        onFile(files[0]);
      }
    },
    [disabled, onFile]
  );

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={cn(
        'relative border-2 border-dashed rounded-2xl p-8 transition-all duration-200',
        'flex flex-col items-center justify-center gap-4 cursor-pointer',
        'hover:border-primary hover:bg-primary/5',
        isDragOver && 'border-primary bg-primary/10 scale-[1.02]',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {/* Hidden file input */}
      <input
        type="file"
        accept={accept}
        onChange={handleFileInput}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        aria-label="Upload image"
      />

      {/* Icon */}
      <div
        className={cn(
          'w-16 h-16 rounded-full flex items-center justify-center transition-all',
          'bg-gradient-to-br from-blue-100 to-purple-100 text-primary',
          isDragOver && 'scale-110 from-blue-200 to-purple-200'
        )}
      >
        {isDragOver ? (
          <ImageIcon className="w-8 h-8" />
        ) : (
          <Upload className="w-8 h-8" />
        )}
      </div>

      {/* Text */}
      <div className="text-center">
        <p className="text-base font-medium text-foreground mb-1">
          {isDragOver ? 'Drop your image here' : 'Drop an image here'}
        </p>
        <p className="text-sm text-muted-foreground">
          or click to browse your files
        </p>
      </div>

      {/* Format info */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="px-2 py-1 rounded bg-muted">JPG</span>
        <span className="px-2 py-1 rounded bg-muted">PNG</span>
        <span className="px-2 py-1 rounded bg-muted">GIF</span>
        <span className="px-2 py-1 rounded bg-muted">WebP</span>
      </div>

      {/* Size limit */}
      <p className="text-xs text-muted-foreground">
        Maximum file size: {maxSizeMB}MB
      </p>
    </div>
  );
}
