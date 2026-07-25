const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

/**
 * Validates and normalizes external URLs. Returns null if invalid.
 */
export function sanitizeUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

export function assertSafeUrl(raw: string): string {
  const sanitized = sanitizeUrl(raw);
  if (!sanitized) {
    throw new Error("URL inválida o protocolo no permitido");
  }
  return sanitized;
}
