"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import Image from "next/image";
import { Button } from "./ui/button";

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
  alt = "Image",
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
          aria-label="Close image viewer"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </Button>

        {/* Image container */}
        <div className="relative flex items-center justify-center min-h-[300px] max-h-[90vh] bg-black">
          <Image
            src={imageUrl}
            alt={alt}
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            width={1200}
            height={800}
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
