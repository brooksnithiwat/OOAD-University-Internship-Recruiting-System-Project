import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageService } from './storage.interface';
import { LocalStorageService } from './local-storage.service';
import { SupabaseStorageService } from './supabase-storage.service';

@Injectable()
export class StorageFactory {
  constructor(
    private configService: ConfigService,
    private localStorage: LocalStorageService,
    private supabaseStorage: SupabaseStorageService,
  ) {}

  /**
   * Detect which storage mode to use based on environment variables
   * If any Supabase config is missing, fallback to local storage
   */
  getStorageService(): StorageService {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY');
    const supabaseBucketName = this.configService.get<string>('SUPABASE_BUCKET_NAME');

    // If any required Supabase config is missing, use local storage
    if (!supabaseUrl || !supabaseAnonKey || !supabaseBucketName) {
      console.log(
        '[Storage] Using LOCAL storage (Supabase config incomplete)',
      );
      return this.localStorage;
    }

    console.log('[Storage] Using SUPABASE storage');
    return this.supabaseStorage;
  }
}
