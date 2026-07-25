import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type { StorageProvider, StoredObject, UploadInput } from "./types";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");

/**
 * Local filesystem storage for development.
 * Objects are served from /uploads/<key>.
 */
export class LocalStorageProvider implements StorageProvider {
  readonly kind = "local" as const;

  async upload(input: UploadInput): Promise<StoredObject> {
    const safeKey = input.key.replace(/\.\./g, "").replace(/^\/+/, "");
    const absolute = path.join(UPLOAD_ROOT, safeKey);
    await mkdir(path.dirname(absolute), { recursive: true });
    await writeFile(absolute, input.data);

    return {
      key: safeKey,
      url: this.getPublicUrl(safeKey),
      contentType: input.contentType,
      sizeBytes: input.data.byteLength,
    };
  }

  async delete(key: string): Promise<void> {
    const safeKey = key.replace(/\.\./g, "").replace(/^\/+/, "");
    const absolute = path.join(UPLOAD_ROOT, safeKey);
    await unlink(absolute).catch(() => undefined);
  }

  getPublicUrl(key: string): string {
    const safeKey = key.replace(/\.\./g, "").replace(/^\/+/, "");
    return `/uploads/${safeKey}`;
  }
}
