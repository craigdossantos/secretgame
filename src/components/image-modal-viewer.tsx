'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { Button } from './ui/button';

interface ImageModalViewerProps {
  imageUrl: string;
  caption?: string;
  isOpen: boolean;
  onClose: () => void;
  alt?: string;
}

export function ImageModalViewer({
  imageUrl,
  caption,
  isOpen,
  onClose,
  alt = 'Full size image',
}: ImageModalViewerProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full p-0 overflow-hidden bg-black/95 border-none">
        {/* Close button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 z-50 h-10 w-10 p-0 rounded-full bg-white/10 hover:bg-white/20 text-white"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </Button>

        {/* Image container */}
        <div className="relative flex items-center justify-center min-h-[300px] max-h-[90vh] bg-black">
          <img
            src={imageUrl}
            alt={alt}
            className="max-w-full max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Caption */}
        {caption && (
          <div className="bg-black/80 text-white px-6 py-4 border-t border-white/10">
            <p className="text-sm text-center">{caption}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
