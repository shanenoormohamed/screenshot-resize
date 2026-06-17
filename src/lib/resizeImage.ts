export function fitToMaxEdge(
  width: number,
  height: number,
  maxEdge: number,
): { width: number; height: number } {
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

export async function resizeStillImage(
  file: File,
  maxEdge: number,
  format: 'png' | 'jpeg',
  jpegQuality = 0.85,
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = fitToMaxEdge(bitmap.width, bitmap.height, maxEdge);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    throw new Error('Canvas unavailable');
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to encode image'));
      },
      format === 'png' ? 'image/png' : 'image/jpeg',
      jpegQuality,
    );
  });
}

export function outputFilename(
  originalName: string,
  format: 'png' | 'jpeg',
): string {
  const base = originalName.replace(/\.[^.]+$/, '');
  return `${base}-resized.${format === 'png' ? 'png' : 'jpg'}`;
}
