export type StoredObject = {
  key: string;
  url: string;
  contentType: string;
  sizeBytes: number;
};

export type UploadInput = {
  key: string;
  data: Buffer | Uint8Array;
  contentType: string;
};

/**
 * Storage port — local for MVP; S3/R2 adapters can implement this later.
 */
export interface StorageProvider {
  readonly kind: "local" | "s3" | "r2";
  upload(input: UploadInput): Promise<StoredObject>;
  delete(key: string): Promise<void>;
  getPublicUrl(key: string): string;
}
