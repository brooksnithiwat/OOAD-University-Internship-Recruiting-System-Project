import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { StorageService } from './storage.interface';

@Injectable()
export class LocalStorageService implements StorageService {
  private readonly UPLOAD_DIR = path.join(process.cwd(), 'uploads');

  constructor() {
    // Ensure upload directory exists
    fs.mkdirSync(this.UPLOAD_DIR, { recursive: true });
  }

  async uploadFile(file: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
  }): Promise<{ fileKey: string; fileUrl: string }> {
    try {
      if (!file.buffer) {
        throw new Error('File buffer is required');
      }

      const id = randomUUID();
      const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filename = `${id}-${safeOriginal}`;
      const filePath = path.join(this.UPLOAD_DIR, filename);

      // Write file to disk
      fs.writeFileSync(filePath, file.buffer);

      // fileKey stored in DB, used for local path
      const fileKey = `uploads/${filename}`;

      return {
        fileKey,
        fileUrl: fileKey, // For local storage, URL and key are the same
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to upload file to local storage: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async deleteFile(fileKey: string): Promise<void> {
    try {
      const filePath = path.join(process.cwd(), fileKey);

      // Verify path is within uploads directory for security
      const realPath = fs.realpathSync(path.dirname(filePath));
      const uploadDirReal = fs.realpathSync(this.UPLOAD_DIR);

      if (!realPath.startsWith(uploadDirReal)) {
        throw new Error('Invalid file path - outside uploads directory');
      }

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to delete file from local storage: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  getFileUrl(fileKey: string): string {
    // For local storage, fileKey IS the URL (e.g., "uploads/{filename}")
    return fileKey;
  }

  getStorageMode(): string {
    return 'LOCAL';
  }
}
