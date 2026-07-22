// Read a user-selected image File, downscale it, and return a compact data URI
// suitable for storing in the local document. Keeps stored images small.

const MAX_DIM = 500;
const QUALITY = 0.82;

export async function fileToResizedDataUrl(file: File): Promise<string> {
  const dataUrl = await readAsDataUrl(file);
  const img = await loadImage(dataUrl);

  const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl; // fallback: store original
  ctx.drawImage(img, 0, 0, w, h);

  // Prefer WebP; fall back to JPEG if the browser can't encode WebP.
  const webp = canvas.toDataURL('image/webp', QUALITY);
  if (webp.startsWith('data:image/webp')) return webp;
  return canvas.toDataURL('image/jpeg', QUALITY);
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Kunne ikke læse billedet.'));
    img.src = src;
  });
}
