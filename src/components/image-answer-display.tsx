"use client";

import { useState } from "react";
import { Maximize2 } from "lucide-react";
import Image from "next/image";
import { ImageModalViewer } from "./image-modal-viewer";
import { Button } from "./ui/button";
import { type ImageData } from "@/lib/image-utils";

interface ImageAnswerDisplayProps {
  imageData: ImageData;
  className?: string;
}

export function ImageAnswerDisplay({
  imageData,
  className = "",
}: ImageAnswerDisplayProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className={`space-y-3 ${className}`}>
        {/* Image preview with expand button */}
        <div className="relative group rounded-xl overflow-hidden border border-border bg-muted">
          <Image
            src={imageData.imageBase64}
            alt={imageData.caption || "Uploaded image"}
            className="w-full h-auto max-h-96 object-contain cursor-pointer transition-transform group-hover:scale-[1.02]"
            onClick={() => setIsModalOpen(true)}
            width={500} // Placeholder width, adjust as needed or use 'fill'
            height={300} // Placeholder height, adjust as needed or use 'fill'
            priority // Optional: prioritize loading this image
          />

          {/* Expand button overlay */}
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-3 right-3 h-9 w-9 p-0 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setIsModalOpen(true)}
          >
            <Maximize2 className="w-4 h-4" />
          </Button>

          {/* Click to expand hint */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm text-white text-xs text-center py-2 opacity-0 group-hover:opacity-100 transition-opacity">
            Click to view full size
          </div>
        </div>

        {/* Caption */}
        {imageData.caption && (
          <div className="px-1">
            <p className="text-sm text-foreground italic">
              {imageData.caption}
            </p>
          </div>
        )}
      </div>

      {/* Full-size modal */}
      <ImageModalViewer
        imageUrl={imageData.imageBase64}
        caption={imageData.caption}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        alt={imageData.caption || "Uploaded image"}
      />
    </>
  );
}
