/**
 * Image utility functions for The Secret Game
 * Handles validation, conversion, and compression for image uploads
 */

export interface ImageData {
  imageBase64: string; // Legacy - for backward compatibility
  imageUrl?: string; // New - URL from Vercel Blob storage
  caption?: string;
  mimeType: string;
  fileSize: number;
  fileName: string;
}

/**
 * Converts a File object to a base64 data URL
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Validates an image file for upload
 * Returns null if valid, error message if invalid
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number = 5,
): string | null {
  // Check if it's an image
  if (!file.type.startsWith("image/")) {
    return "File must be an image (PNG, JPG, GIF, or WebP)";
  }

  // Check file size
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > maxSizeMB) {
    return `Image must be under ${maxSizeMB}MB (current: ${sizeMB.toFixed(1)}MB)`;
  }

  // Check specific formats we support
  const supportedFormats = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  if (!supportedFormats.includes(file.type)) {
    return "Unsupported image format. Please use JPG, PNG, GIF, or WebP";
  }

  return null;
}

/**
 * Formats file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Creates a thumbnail preview from a base64 image
 * (For future optimization - currently returns original)
 */
export function createThumbnail(base64Image: string): string {
  // For now, just return the original
  // In production, you'd want to resize this on the server
  return base64Image;
}

/**
 * Extracts image dimensions from a base64 data URL
 */
export async function getImageDimensions(
  base64: string,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    img.src = base64;
  });
}

/**
 * Compresses an image if it exceeds the max file size
 * Returns compressed base64 or original if already small enough
 */
export async function compressImageIfNeeded(
  file: File,
  maxSizeMB: number = 5,
): Promise<string> {
  const sizeMB = file.size / (1024 * 1024);

  // If already small enough, just convert to base64
  if (sizeMB <= maxSizeMB) {
    return fileToBase64(file);
  }

  // For now, reject large files
  // In production, implement canvas-based compression
  throw new Error(
    `Image is too large (${sizeMB.toFixed(1)}MB). Please choose a smaller image.`,
  );
}

/**
 * Upload image to Vercel Blob and return URL
 * This is the new preferred method for production
 */
export async function uploadImageToBlob(
  file: File,
  pathname: string,
): Promise<string> {
  // Validate first
  const validationError = validateImageFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  // Upload to Vercel Blob
  const { uploadImage } = await import("./blob-storage");
  return uploadImage(file, pathname);
}

/**
 * Process image for storage - returns both base64 (for backward compat) and blob URL
 */
export async function processImageForStorage(
  file: File,
  pathname: string,
): Promise<{ base64: string; url: string }> {
  const validationError = validateImageFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  // Process in parallel
  const [base64, url] = await Promise.all([
    fileToBase64(file),
    uploadImageToBlob(file, pathname),
  ]);

  return { base64, url };
}
