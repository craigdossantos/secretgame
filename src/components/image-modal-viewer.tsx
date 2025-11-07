'use client';

import { Dialog, DialogContent, DialogDescription } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageModalViewerProps {
  isOpen: boolean;
  onClose: () => void;
  imageBase64: string;
  caption?: string;
}

export function ImageModalViewer({
  isOpen,
  onClose,
  imageBase64,
  caption,
}: ImageModalViewerProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Image */}
        <div className="relative bg-black/95">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageBase64}
            alt={caption || 'Full size image'}
            className="w-full h-auto max-h-[85vh] object-contain"
          />
        </div>

        {/* Caption at bottom */}
        {caption && (
          <div className="bg-card p-4 border-t">
            <DialogDescription className="text-center text-base">
              {caption}
            </DialogDescription>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
