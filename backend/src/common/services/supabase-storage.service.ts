import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { randomUUID } from 'crypto';
import { StorageService } from './storage.interface';

@Injectable()
export class SupabaseStorageService implements StorageService {
  private supabaseUrl: string;
  private supabaseBucket: string;
  private supabaseAnonKey: string;
  private client: AxiosInstance;

  constructor(private configService: ConfigService) {
    this.supabaseUrl = this.configService.get<string>('SUPABASE_URL') || '';
    this.supabaseBucket = this.configService.get<string>('SUPABASE_BUCKET_NAME') || '';
    this.supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY') || '';

    this.client = axios.create({
      baseURL: `${this.supabaseUrl}/storage/v1`,
    });
  }

  async uploadFile(file: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
  }): Promise<{ fileKey: string; fileUrl: string }> {
    try {
      const id = randomUUID();
      const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileKey = `resumes/${id}-${safeOriginal}`;

      // Upload file to Supabase Storage
      const uploadUrl = `/object/${this.supabaseBucket}/${fileKey}`;

      await this.client.post(uploadUrl, file.buffer, {
        headers: {
          'Content-Type': file.mimetype,
          'Authorization': `Bearer ${this.supabaseAnonKey}`,
        },
      });

      // Construct public URL
      const fileUrl = `${this.supabaseUrl}/storage/v1/object/public/${this.supabaseBucket}/${fileKey}`;

      return { fileKey, fileUrl };
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Unknown error';
      throw new InternalServerErrorException(
        `Failed to upload file to Supabase: ${errorMessage}`,
      );
    }
  }

  async deleteFile(fileKey: string): Promise<void> {
    try {
      const deleteUrl = `/object/${this.supabaseBucket}/${fileKey}`;
      await this.client.delete(deleteUrl, {
        headers: {
          'Authorization': `Bearer ${this.supabaseAnonKey}`,
        },
      });
    } catch (error: any) {
      // If file doesn't exist, still consider it success
      if (error?.response?.status === 404) {
        return;
      }
      const errorMessage = error?.response?.data?.message || error?.message || 'Unknown error';
      throw new InternalServerErrorException(
        `Failed to delete file from Supabase: ${errorMessage}`,
      );
    }
  }

  getFileUrl(fileKey: string): string {
    // Construct full public URL from fileKey
    return `${this.supabaseUrl}/storage/v1/object/public/${this.supabaseBucket}/${fileKey}`;
  }

  getStorageMode(): string {
    return 'SUPABASE';
  }
}
