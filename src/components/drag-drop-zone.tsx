"use client";

import { useCallback, useState } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DragDropZoneProps {
  onFileSelected: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  disabled?: boolean;
  className?: string;
}

export function DragDropZone({
  onFileSelected,
  accept = "image/*",
  maxSizeMB = 5,
  disabled = false,
  className,
}: DragDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        onFileSelected(file);
      }
    },
    [disabled, onFileSelected],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;

      const files = e.target.files;
      if (files && files.length > 0) {
        const file = files[0];
        onFileSelected(file);
      }
    },
    [disabled, onFileSelected],
  );

  return (
    <div
      className={cn(
        "relative border-2 border-dashed rounded-xl transition-all",
        isDragging
          ? "border-primary bg-primary/5 scale-[1.02]"
          : "border-border hover:border-primary/50 hover:bg-muted/30",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleFileInput}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        aria-label="Upload image"
      />

      <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
        <div
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center transition-colors",
            isDragging
              ? "bg-primary/20 text-primary"
              : "bg-muted text-muted-foreground",
          )}
        >
          {isDragging ? (
            <ImageIcon className="w-8 h-8" />
          ) : (
            <Upload className="w-8 h-8" />
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-foreground mb-1">
            {isDragging ? "Drop your image here" : "Drag & drop your image"}
          </p>
          <p className="text-xs text-muted-foreground">
            or click to browse • Max {maxSizeMB}MB
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="px-2 py-1 rounded-md bg-muted">JPG</span>
          <span className="px-2 py-1 rounded-md bg-muted">PNG</span>
          <span className="px-2 py-1 rounded-md bg-muted">GIF</span>
          <span className="px-2 py-1 rounded-md bg-muted">WebP</span>
        </div>
      </div>
    </div>
  );
}
