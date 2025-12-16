// Vercel Blob storage utilities for image uploads
import { put, del, list } from "@vercel/blob";

/**
 * Upload an image to Vercel Blob storage
 * @param file File object or Buffer to upload
 * @param pathname Path where the file will be stored (e.g., 'avatars/user-123.jpg')
 * @returns URL of the uploaded file
 */
export async function uploadImage(
  file: File | Buffer,
  pathname: string,
): Promise<string> {
  const blob = await put(pathname, file, {
    access: "public",
    addRandomSuffix: false, // Use exact pathname
  });
  return blob.url;
}

/**
 * Upload an avatar image for a user
 * @param userId User ID
 * @param file Image file
 * @returns URL of the uploaded avatar
 */
export async function uploadUserAvatar(
  userId: string,
  file: File | Buffer,
): Promise<string> {
  const pathname = `avatars/${userId}.jpg`;
  return uploadImage(file, pathname);
}

/**
 * Upload an answer image for a secret
 * @param roomId Room ID
 * @param secretId Secret ID
 * @param file Image file
 * @param filename Original filename
 * @returns URL of the uploaded image
 */
export async function uploadAnswerImage(
  roomId: string,
  secretId: string,
  file: File | Buffer,
  filename: string,
): Promise<string> {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const pathname = `answer-images/${roomId}/${secretId}/${timestamp}-${sanitizedFilename}`;
  return uploadImage(file, pathname);
}

/**
 * Delete an image from Vercel Blob storage
 * @param url URL of the image to delete
 */
export async function deleteImage(url: string): Promise<void> {
  await del(url);
}

/**
 * List all images in a specific path
 * @param prefix Path prefix to filter by
 * @returns Array of blob metadata
 */
export async function listImages(prefix: string) {
  const { blobs } = await list({ prefix });
  return blobs;
}

/**
 * Delete all answer images for a room
 * @param roomId Room ID
 */
export async function deleteRoomImages(roomId: string): Promise<void> {
  const blobs = await listImages(`answer-images/${roomId}/`);
  await Promise.all(blobs.map((blob) => del(blob.url)));
}

/**
 * Delete all answer images for a secret
 * @param roomId Room ID
 * @param secretId Secret ID
 */
export async function deleteSecretImages(
  roomId: string,
  secretId: string,
): Promise<void> {
  const blobs = await listImages(`answer-images/${roomId}/${secretId}/`);
  await Promise.all(blobs.map((blob) => del(blob.url)));
}
