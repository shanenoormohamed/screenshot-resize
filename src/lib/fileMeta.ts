import type { FileKind, InputFile } from '../types';
import { ACCEPTED_TYPES } from '../types';

export function detectKind(file: File): FileKind | null {
  if (file.type === 'image/gif') return 'gif';
  if (file.type === 'image/png' || file.type === 'image/jpeg') return 'still';
  if (
    file.type === 'video/quicktime' ||
    file.type === 'video/mp4' ||
    /\.mov$/i.test(file.name) ||
    /\.mp4$/i.test(file.name)
  ) {
    return 'video';
  }
  return null;
}

export function isAccepted(file: File): boolean {
  if (ACCEPTED_TYPES.includes(file.type)) return true;
  return /\.(png|jpe?g|gif|mov|mp4)$/i.test(file.name);
}

export async function readImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const dims = { width: bitmap.width, height: bitmap.height };
  bitmap.close();
  return dims;
}

export async function readVideoDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      resolve({ width: video.videoWidth, height: video.videoHeight });
      URL.revokeObjectURL(url);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read video metadata'));
    };
    video.src = url;
  });
}

export async function buildInputFile(file: File): Promise<InputFile | null> {
  const kind = detectKind(file);
  if (!kind || !isAccepted(file)) return null;

  const id = crypto.randomUUID();
  const entry: InputFile = { id, file, kind };

  try {
    if (kind === 'video') {
      const dims = await readVideoDimensions(file);
      entry.width = dims.width;
      entry.height = dims.height;
    } else {
      const dims = await readImageDimensions(file);
      entry.width = dims.width;
      entry.height = dims.height;
    }
  } catch {
    // dimensions optional
  }

  return entry;
}
