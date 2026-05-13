export interface StorageService {
  /**
   * Upload a file to storage
   * @param file Buffer, originalname, mimetype
   * @returns fileKey for database, fileUrl for download
   */
  uploadFile(file: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
  }): Promise<{ fileKey: string; fileUrl: string }>;

  /**
   * Delete a file from storage
   * @param fileKey The file key/path
   */
  deleteFile(fileKey: string): Promise<void>;

  /**
   * Convert fileKey to downloadable fileUrl
   * For local storage, this is the same
   * For Supabase, this constructs the full URL
   */
  getFileUrl(fileKey: string): string;

  /**
   * Get the storage mode (for logging/debugging)
   */
  getStorageMode(): string;
}
