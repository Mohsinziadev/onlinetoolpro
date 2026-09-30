/**
 * Client-side image loading and validation. Images are decoded in the browser
 * and never uploaded.
 */

export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_FILE_BYTES = 20 * 1024 * 1024;
export const MIN_DIMENSION = 64;

export type LoadedImage = {
  file: File;
  url: string;
  width: number;
  height: number;
  bitmap: ImageBitmap;
};

export class ImageValidationError extends Error {}

export function validateImageFile(file: File): void {
  if (!(ACCEPTED_TYPES as readonly string[]).includes(file.type)) {
    const ext = file.name.split(".").pop()?.toUpperCase() ?? "this";
    throw new ImageValidationError(`${ext} files aren't supported. Upload a JPG, PNG or WebP image.`);
  }
  if (file.size === 0) throw new ImageValidationError("This file is empty.");
  if (file.size > MAX_FILE_BYTES) {
    throw new ImageValidationError(`This file is ${(file.size / 1024 / 1024).toFixed(1)} MB. The maximum is 20 MB.`);
  }
}

export async function loadImage(file: File): Promise<LoadedImage> {
  validateImageFile(file);
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new ImageValidationError("This image couldn't be decoded. The file may be corrupted or not a real image.");
  }
  if (bitmap.width < MIN_DIMENSION || bitmap.height < MIN_DIMENSION) {
    bitmap.close();
    throw new ImageValidationError(`This image is too small to analyze (minimum ${MIN_DIMENSION}×${MIN_DIMENSION} px).`);
  }
  return { file, url: URL.createObjectURL(file), width: bitmap.width, height: bitmap.height, bitmap };
}

/** Draw a bitmap into a canvas of the given size and return its pixels. */
export function rasterize(source: CanvasImageSource, width: number, height: number): ImageData {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, width, height);
  return ctx.getImageData(0, 0, width, height);
}

/** Pixels of the image scaled so its width is `targetWidth` (aspect preserved). */
export function rasterizeToWidth(bitmap: ImageBitmap, targetWidth: number): ImageData {
  const w = Math.min(targetWidth, bitmap.width);
  const h = Math.max(1, Math.round((bitmap.height / bitmap.width) * w));
  return rasterize(bitmap, w, h);
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

const COMMON_RATIOS: [string, number][] = [
  ["16:9", 16 / 9],
  ["4:3", 4 / 3],
  ["1:1", 1],
  ["9:16", 9 / 16],
  ["3:2", 3 / 2],
  ["21:9", 21 / 9],
  ["4:5", 4 / 5],
];

export function describeAspectRatio(width: number, height: number): { exact: string; nearest: string; isSixteenNine: boolean } {
  const g = gcd(width, height);
  const exact = `${width / g}:${height / g}`;
  const r = width / height;
  const [nearest] = COMMON_RATIOS.reduce((best, cur) => (Math.abs(cur[1] - r) < Math.abs(best[1] - r) ? cur : best));
  return { exact, nearest, isSixteenNine: Math.abs(r - 16 / 9) < 0.01 };
}
