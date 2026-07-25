import { LocalStorageProvider } from "./local-provider";
import type { StorageProvider } from "./types";

export type { StorageProvider, StoredObject, UploadInput } from "./types";

let provider: StorageProvider | null = null;

export function getStorageProvider(): StorageProvider {
  if (!provider) {
    // Future: switch on STORAGE_PROVIDER=s3|r2
    provider = new LocalStorageProvider();
  }
  return provider;
}
