'use client';

import { useState } from 'react';
import { Maximize2 } from 'lucide-react';
import { ImageData } from '@/lib/image-utils';
import { ImageModalViewer } from '@/components/image-modal-viewer';
import { cn } from '@/lib/utils';

interface ImageAnswerDisplayProps {
  imageData: ImageData | { imageBase64?: string; caption?: string };
  className?: string;
}

export function ImageAnswerDisplay({ imageData, className }: ImageAnswerDisplayProps) {
  const [showModal, setShowModal] = useState(false);

  const imageBase64 = imageData.imageBase64;
  const caption = imageData.caption;

  if (!imageBase64) {
    return (
      <div className="flex items-center justify-center p-8 bg-muted/30 rounded-lg border border-border">
        <p className="text-sm text-muted-foreground">Image not available</p>
      </div>
    );
  }

  return (
    <>
      <div className={cn('space-y-3', className)}>
        {/* Image container */}
        <div
          className="relative group cursor-pointer rounded-xl overflow-hidden bg-muted border-2 border-border hover:border-primary transition-all"
          onClick={() => setShowModal(true)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageBase64}
            alt={caption || 'Secret image'}
            className="w-full h-auto max-h-96 object-contain"
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                <Maximize2 className="h-6 w-6 text-foreground" />
              </div>
            </div>
          </div>

          {/* Click hint */}
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
              <p className="text-white text-xs font-medium">Click to enlarge</p>
            </div>
          </div>
        </div>

        {/* Caption */}
        {caption && (
          <div className="px-2">
            <p className="text-sm text-muted-foreground italic leading-relaxed">
              {caption}
            </p>
          </div>
        )}
      </div>

      {/* Modal viewer */}
      <ImageModalViewer
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        imageBase64={imageBase64}
        caption={caption}
      />
    </>
  );
}
