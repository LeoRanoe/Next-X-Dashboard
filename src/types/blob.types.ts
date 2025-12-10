export interface BlobUploadResponse {
  url: string
  filename: string
  size: number
  type: string
}

export interface BlobDeleteResponse {
  success: boolean
}

export interface BlobErrorResponse {
  error: string
}

export interface FileValidationResult {
  valid: boolean
  error?: string
}

export const BLOB_CONFIG = {
  MAX_FILE_SIZE_MB: 5,
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  FOLDERS: {
    ITEMS: 'items',
    PRODUCTS: 'products',
    UPLOADS: 'uploads',
  } as const,
} as const

export type BlobFolder = typeof BLOB_CONFIG.FOLDERS[keyof typeof BLOB_CONFIG.FOLDERS]
