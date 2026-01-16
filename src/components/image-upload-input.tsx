"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, Loader2 } from "lucide-react";
import { DragDropZone } from "./drag-drop-zone";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "sonner";
import {
  validateImageFile,
  fileToBase64,
  formatFileSize,
  type ImageData,
} from "@/lib/image-utils";

interface ImageUploadInputProps {
  onImageSelected?: (imageData: ImageData) => void;
  onChange?: (imageData: ImageData | null) => void;
  value?: ImageData | null;
  onClear?: () => void;
  maxSizeMB?: number;
  showCaption?: boolean;
  disabled?: boolean;
}

export function ImageUploadInput({
  onImageSelected,
  onChange,
  value,
  onClear,
  maxSizeMB = 5,
  showCaption = true,
  disabled = false,
}: ImageUploadInputProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<number>(0);
  const [caption, setCaption] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Sync with controlled value prop
  useEffect(() => {
    if (value && value.imageBase64) {
      setPreviewUrl(value.imageBase64);
      setFileName(value.fileName || "");
      setFileSize(value.fileSize || 0);
      setCaption(value.caption || "");
    } else if (value === null) {
      // Reset if value is explicitly set to null
      setPreviewUrl(null);
      setFileName("");
      setFileSize(0);
      setCaption("");
      setSelectedFile(null);
    }
  }, [value]);

  const handleFileSelected = async (file: File) => {
    // Validate the file
    const validationError = validateImageFile(file, maxSizeMB);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setProcessing(true);

    try {
      // Create preview URL
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
      setFileName(file.name);
      setFileSize(file.size);
      setSelectedFile(file);

      // Convert to Base64
      const base64 = await fileToBase64(file);

      // Create ImageData object
      const imageData: ImageData = {
        imageBase64: base64,
        caption: caption.trim() || undefined,
        mimeType: file.type,
        fileSize: file.size,
        fileName: file.name,
      };

      // Call the appropriate callback
      if (onImageSelected) {
        onImageSelected(imageData);
      }
      if (onChange) {
        onChange(imageData);
      }

      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Failed to process image:", error);
      toast.error("Failed to process image. Please try again.");
      handleClearImage();
    } finally {
      setProcessing(false);
    }
  };

  const handleClearImage = () => {
    // Revoke the preview URL to free memory
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(null);
    setFileName("");
    setFileSize(0);
    setCaption("");
    setSelectedFile(null);

    if (onClear) {
      onClear();
    }
    if (onChange) {
      onChange(null);
    }
  };

  const handleCaptionChange = async (newCaption: string) => {
    setCaption(newCaption);

    // Update the image data with new caption
    if (selectedFile) {
      try {
        const base64 = await fileToBase64(selectedFile);
        const imageData: ImageData = {
          imageBase64: base64,
          caption: newCaption.trim() || undefined,
          mimeType: selectedFile.type,
          fileSize: selectedFile.size,
          fileName: selectedFile.name,
        };
        if (onImageSelected) {
          onImageSelected(imageData);
        }
        if (onChange) {
          onChange(imageData);
        }
      } catch (error) {
        console.error("Failed to update caption:", error);
      }
    }
  };

  // Show upload zone if no image is selected
  if (!previewUrl) {
    return (
      <div className="space-y-4">
        <DragDropZone
          onFileSelected={handleFileSelected}
          maxSizeMB={maxSizeMB}
          disabled={disabled || processing}
        />

        {processing && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processing image...</span>
          </div>
        )}
      </div>
    );
  }

  // Show preview with caption if image is selected
  return (
    <div className="space-y-4">
      {/* Image Preview */}
      <div className="relative rounded-xl border border-border overflow-hidden bg-muted">
        <Image
          src={previewUrl}
          alt="Preview"
          className="w-full h-full object-cover"
          width={200}
          height={200}
        />

        {/* Remove button */}
        <Button
          variant="destructive"
          size="sm"
          className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full shadow-lg"
          onClick={handleClearImage}
          disabled={disabled}
          aria-label="Remove image"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </Button>

        {/* File info */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm text-white px-3 py-2">
          <p className="text-xs truncate">{fileName}</p>
          <p className="text-xs text-white/80">{formatFileSize(fileSize)}</p>
        </div>
      </div>

      {/* Caption Input */}
      {showCaption && (
        <div className="space-y-2">
          <label
            htmlFor="image-caption"
            className="text-sm font-medium text-foreground"
          >
            Caption (optional)
          </label>
          <Input
            id="image-caption"
            type="text"
            placeholder="Add a caption to your image..."
            value={caption}
            onChange={(e) => handleCaptionChange(e.target.value)}
            disabled={disabled}
            maxLength={200}
            className="text-sm"
          />
          <p className="text-xs text-muted-foreground">
            {caption.length}/200 characters
          </p>
        </div>
      )}
    </div>
  );
}
