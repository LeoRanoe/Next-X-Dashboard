import { put, del } from '@vercel/blob'
import { BLOB_CONFIG, type FileValidationResult } from '@/types/blob.types'

/**
 * Upload a file to Vercel Blob storage
 * @param file - The file to upload
 * @param folder - Optional folder path (e.g., 'items', 'products')
 * @returns The public URL of the uploaded file
 */
export async function uploadToBlob(file: File, folder: string = 'uploads'): Promise<string> {
  try {
    const filename = `${folder}/${Date.now()}-${file.name}`
    const blob = await put(filename, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })
    return blob.url
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error)
    throw new Error('Failed to upload file')
  }
}

/**
 * Delete a file from Vercel Blob storage
 * @param url - The blob URL to delete
 */
export async function deleteFromBlob(url: string): Promise<void> {
  try {
    await del(url, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })
  } catch (error) {
    console.error('Error deleting from Vercel Blob:', error)
    throw new Error('Failed to delete file')
  }
}

/**
 * Validate file before upload
 * @param file - The file to validate
 * @param maxSizeMB - Maximum file size in MB (default: 5MB)
 * @param allowedTypes - Array of allowed MIME types
 */
export function validateFile(
  file: File,
  maxSizeMB: number = BLOB_CONFIG.MAX_FILE_SIZE_MB,
  allowedTypes: string[] = [...BLOB_CONFIG.ALLOWED_TYPES]
): FileValidationResult {
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `File size must be less than ${maxSizeMB}MB` }
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type must be one of: ${allowedTypes.join(', ')}` }
  }

  return { valid: true }
}
