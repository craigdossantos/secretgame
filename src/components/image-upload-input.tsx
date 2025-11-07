'use client';

import { useState } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DragDropZone } from '@/components/drag-drop-zone';
import { validateImageFile, fileToBase64, formatFileSize, ImageData } from '@/lib/image-utils';
import { toast } from 'sonner';

interface ImageUploadInputProps {
  value: ImageData | null;
  onChange: (data: ImageData | null) => void;
  maxSizeMB?: number;
  showCaption?: boolean;
  disabled?: boolean;
}

export function ImageUploadInput({
  value,
  onChange,
  maxSizeMB = 5,
  showCaption = true,
  disabled = false,
}: ImageUploadInputProps) {
  const [preview, setPreview] = useState<string | null>(value?.imageBase64 || null);
  const [caption, setCaption] = useState(value?.caption || '');
  const [loading, setLoading] = useState(false);

  const handleFile = async (file: File) => {
    if (disabled) return;

    // Validate file
    const validationError = validateImageFile(file, maxSizeMB);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setLoading(true);

      // Convert to base64
      const base64 = await fileToBase64(file);

      // Create image data
      const imageData: ImageData = {
        imageBase64: base64,
        caption: caption,
        mimeType: file.type,
        fileSize: file.size,
        fileName: file.name,
      };

      setPreview(base64);
      onChange(imageData);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Failed to upload image:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setCaption('');
    onChange(null);
  };

  const handleCaptionChange = (newCaption: string) => {
    setCaption(newCaption);
    if (value) {
      onChange({
        ...value,
        caption: newCaption,
      });
    }
  };

  // Show preview if image is uploaded
  if (preview) {
    return (
      <div className="space-y-4">
        {/* Image preview */}
        <div className="relative rounded-2xl overflow-hidden bg-muted border-2 border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Uploaded preview"
            className="w-full h-auto max-h-96 object-contain"
          />

          {/* Remove button */}
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 rounded-full shadow-lg"
            onClick={handleRemove}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* File info overlay */}
          {value && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
              <p className="text-white text-xs">
                {value.fileName} • {formatFileSize(value.fileSize)}
              </p>
            </div>
          )}
        </div>

        {/* Caption input */}
        {showCaption && (
          <div className="space-y-2">
            <label htmlFor="image-caption" className="text-sm font-medium">
              Caption <span className="text-muted-foreground">(optional)</span>
            </label>
            <Input
              id="image-caption"
              type="text"
              placeholder="Add a caption to your image..."
              value={caption}
              onChange={(e) => handleCaptionChange(e.target.value)}
              maxLength={200}
              disabled={disabled}
            />
            {caption && (
              <p className="text-xs text-muted-foreground text-right">
                {caption.length}/200
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  // Show upload zone if no image
  return (
    <div className="space-y-4">
      {loading ? (
        <div className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground">Uploading image...</p>
        </div>
      ) : (
        <DragDropZone
          onFile={handleFile}
          maxSizeMB={maxSizeMB}
          disabled={disabled}
        />
      )}
    </div>
  );
}
