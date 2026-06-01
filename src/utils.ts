import { WeddingData } from "./types";

/**
 * Encodes a WeddingData object into a Base64 string for URL portability.
 * Automatically strips large base64 assets to ensure URL stays within limits.
 */
export function encodeWeddingData(data: WeddingData): string {
  try {
    const strippedData = {
      ...data,
      // Strip massive base64 media to prevent URL truncation (limit ~8kb)
      customAudioBase64: undefined,
      qrisImage: data.qrisImage?.startsWith("data:") ? "" : data.qrisImage,
      images: data.images.map(img => img.startsWith("data:") ? "" : img).filter(Boolean)
    };

    const jsonStr = JSON.stringify(strippedData);
    const bytes = new TextEncoder().encode(jsonStr);
    const binary = Array.from(bytes, byte => String.fromCharCode(byte)).join("");
    return btoa(binary);
  } catch (e) {
    console.error("Gagal mengompresi data ke URL:", e);
    return "";
  }
}

/**
 * Decodes a Base64 string from URL parameter into a WeddingData object.
 */
export function decodeWeddingData(encoded: string): WeddingData | null {
  try {
    const binary = atob(encoded);
    const bytes = new Uint8Array(Array.from(binary, char => char.charCodeAt(0)));
    const jsonStr = new TextDecoder().decode(bytes);
    return JSON.parse(jsonStr) as WeddingData;
  } catch (e) {
    console.error("Gagal membaca link URL terenkripsi:", e);
    return null;
  }
}

class MemoryStorage {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

function getSafeLocalStorage(): {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
} {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const testKey = "__storage_test__";
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      
      const storage = window.localStorage;
      return {
        getItem: (key: string) => {
          try {
            return storage.getItem(key);
          } catch (err) {
            return null;
          }
        },
        setItem: (key: string, value: string) => {
          try {
            storage.setItem(key, value);
          } catch (err) {
            console.error("Quota penyimpanan lokal terlampaui:", err);
            // Non-blocking user warning
            const isQuota = err instanceof DOMException && (
              err.name === "QuotaExceededError" ||
              err.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
              err.code === 22
            );
            if (isQuota) {
              console.warn("Penyimpanan lokal penuh! Silakan kurangi ukuran file musik atau gambar kustom yang diunggah.");
            }
          }
        },
        removeItem: (key: string) => {
          try {
            storage.removeItem(key);
          } catch (err) {}
        },
        clear: () => {
          try {
            storage.clear();
          } catch (err) {}
        }
      };
    }
  } catch (e) {
    console.warn("localStorage is not accessible, falling back to memory storage:", e);
  }
  return new MemoryStorage();
}

export const safeLocalStorage = getSafeLocalStorage();


export interface MapValidationResult {
  isValid: boolean;
  type: "empty" | "iframe" | "search" | "coordinates" | "shortlink" | "standard" | "invalid";
  embedUrl: string;
  extractedUrl: string;
  message: string;
}

/**
 * Validates any Google Maps URL or iframe code, automatically converting
 * them into an always-embeddable URL for loading inside an iframe preview.
 */
export function validateGoogleMapsUrl(urlStr: string, fallbackQuery: string = ""): MapValidationResult {
  const url = (urlStr || "").trim();
  
  if (!url) {
    const defaultEmbed = `https://maps.google.com/maps?q=${encodeURIComponent(fallbackQuery || "Desa Kota Dalam")}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
    return {
      isValid: true,
      type: "empty",
      embedUrl: defaultEmbed,
      extractedUrl: "",
      message: "Menampilkan peta otomatis berdasarkan teks lokasi acara."
    };
  }

  // Case 1: Is it full iframe code?
  if (url.toLowerCase().includes("<iframe") && url.toLowerCase().includes("src=")) {
    const match = url.match(/src=["']([^"']+)["']/i);
    if (match && match[1]) {
      const srcUrl = match[1];
      if (srcUrl.toLowerCase().includes("google.com/maps")) {
        return {
          isValid: true,
          type: "iframe",
          embedUrl: srcUrl,
          extractedUrl: srcUrl,
          message: "✓ Sukses mengekstrak URL peta interaktif dari kode iframe!"
        };
      }
    }
  }

  let targetUrl = url;
  if (url.toLowerCase().startsWith("<iframe")) {
    const match = url.match(/https?:\/\/[^\s"']+/i);
    if (match) {
      targetUrl = match[0];
    }
  }

  const mapsRegex = /https?:\/\/([a-z0-9-.]*\.)?(google\.[a-z]{2,3}(\.[a-z]{2})?|goo\.gl)\/maps/i;
  const shortRegex = /https?:\/\/maps\.app\.goo\.gl/i;
  const shortGooGlRegex = /https?:\/\/goo\.gl\/maps/i;

  const isGoogleMap = mapsRegex.test(targetUrl) || shortRegex.test(targetUrl) || shortGooGlRegex.test(targetUrl);

  if (!isGoogleMap) {
    const defaultEmbed = `https://maps.google.com/maps?q=${encodeURIComponent(fallbackQuery || "Desa Kota Dalam")}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
    return {
      isValid: false,
      type: "invalid",
      embedUrl: defaultEmbed,
      extractedUrl: targetUrl,
      message: "⚠ Format URL bukan Google Maps resmi. Tombol rute tetap diarahkan, namun peta preview disesuaikan otomatis."
    };
  }

  // Case 2: Embed URL
  if (targetUrl.includes("/embed") || targetUrl.includes("output=embed")) {
    return {
      isValid: true,
      type: "iframe",
      embedUrl: targetUrl,
      extractedUrl: targetUrl,
      message: "✓ Link sematan Google Maps valid!"
    };
  }

  // Case 3: Shortener
  if (shortRegex.test(targetUrl) || shortGooGlRegex.test(targetUrl)) {
    const defaultEmbed = `https://maps.google.com/maps?q=${encodeURIComponent(fallbackQuery || "Desa Kota Dalam")}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
    return {
      isValid: true,
      type: "shortlink",
      embedUrl: defaultEmbed,
      extractedUrl: targetUrl,
      message: "ⓘ Link pintasan valid untuk tombol rute! (Iframe preview otomatis dimuat via pencarian teks lokasi)."
    };
  }

  // Case 4: Coordinate match
  const coordMatch = targetUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (coordMatch && coordMatch[1] && coordMatch[2]) {
    const lat = coordMatch[1];
    const lng = coordMatch[2];
    const embedUrl = `https://maps.google.com/maps?q=${lat},${lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    return {
      isValid: true,
      type: "coordinates",
      embedUrl,
      extractedUrl: targetUrl,
      message: "✓ Deteksi Titik Koordinat GPS Sukses! Peta interaktif berhasil diload."
    };
  }

  // Case 5: Place match
  const placeMatch = targetUrl.match(/\/place\/([^/]+)/);
  if (placeMatch && placeMatch[1]) {
    const decodedPlace = decodeURIComponent(placeMatch[1].replace(/\+/g, " "));
    const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(decodedPlace)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    return {
      isValid: true,
      type: "standard",
      embedUrl,
      extractedUrl: targetUrl,
      message: "✓ Lokasi spesifik terdeteksi! Peta siap ditampilkan."
    };
  }

  // Search parameters
  const qMatch = targetUrl.match(/[?&]q=([^&]+)/);
  if (qMatch && qMatch[1]) {
    const decodedQ = decodeURIComponent(qMatch[1].replace(/\+/g, " "));
    const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(decodedQ)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    return {
      isValid: true,
      type: "standard",
      embedUrl,
      extractedUrl: targetUrl,
      message: "✓ Query pencarian terdeteksi! Peta siap disematkan."
    };
  }

  const defaultEmbed = `https://maps.google.com/maps?q=${encodeURIComponent(fallbackQuery || "Desa Kota Dalam")}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
  return {
    isValid: true,
    type: "standard",
    embedUrl: defaultEmbed,
    extractedUrl: targetUrl,
    message: "✓ Link Google Maps valid!"
  };
}

/**
 * Generates an SEO-friendly, clean human-readable slug base from names.
 */
export function generateSlug(groomName: string, brideName: string): string {
  const clean = (str: string) => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "") // remove irregular chars
      .replace(/\s+/g, "-") // replace multiple spaces with single hyphen
      .replace(/-+/g, "-");
  };
  const g = clean(groomName.split(" ")[0] || "");
  const b = clean(brideName.split(" ")[0] || "");
  if (g && b) {
    return `${g}-${b}`;
  }
  return `wedding-${Math.random().toString(36).substr(2, 6)}`;
}

/**
 * Guarantees a unique slug across existing clients. Appends -2, -2026 if duplicate exists.
 */
export function getUniqueSlug(baseSlug: string, existingClients: Array<{ slug?: string; id: string }>, excludeId?: string): string {
  let slug = baseSlug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  
  if (!slug) slug = "wedding";
  
  let candidate = slug;
  let attempt = 1;

  const isDuplicate = (cand: string) => {
    return existingClients.some(c => c.slug === cand && c.id !== excludeId);
  };

  while (isDuplicate(candidate)) {
    attempt++;
    if (attempt === 2) {
      candidate = `${slug}-2`;
    } else {
      // 3rd attempt and beyond, e.g. -2026, -2027 etc.
      candidate = `${slug}-${2024 + attempt}`;
    }
  }

  return candidate;
}

