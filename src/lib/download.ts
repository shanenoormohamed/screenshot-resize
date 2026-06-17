import JSZip from 'jszip';
import type { ProcessedOutput } from '../types';

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function downloadAllAsZip(outputs: ProcessedOutput[]): Promise<void> {
  if (outputs.length === 0) return;

  const zip = new JSZip();
  const used = new Set<string>();

  for (const { blob, filename } of outputs) {
    let name = filename;
    let counter = 1;
    while (used.has(name)) {
      const dot = filename.lastIndexOf('.');
      const stem = dot >= 0 ? filename.slice(0, dot) : filename;
      const ext = dot >= 0 ? filename.slice(dot) : '';
      name = `${stem}-${counter}${ext}`;
      counter += 1;
    }
    used.add(name);
    zip.file(name, blob);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const stamp = new Date().toISOString().slice(0, 10);
  downloadBlob(zipBlob, `resized-media-${stamp}.zip`);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
