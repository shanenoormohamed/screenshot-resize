export function stripExtension(name: string): string {
  return name.replace(/\.[^.]+$/i, '');
}

export function sanitizeFilenameStem(name: string): string {
  const stem = stripExtension(name.trim())
    .replace(/[^\w.-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return stem || 'asset';
}

export function resizedOutputFilename(
  originalName: string,
  extension: string,
  preferredStem?: string,
): string {
  const stem = preferredStem?.trim()
    ? sanitizeFilenameStem(preferredStem)
    : sanitizeFilenameStem(originalName);
  const ext = extension.replace(/^\./, '').toLowerCase();
  return `${stem}-resized.${ext}`;
}
