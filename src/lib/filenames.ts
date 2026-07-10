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

export function defaultOutputStem(originalName: string): string {
  return `${stripExtension(originalName)}_resized`;
}

export function resizedOutputFilename(
  originalName: string,
  extension: string,
  preferredStem?: string,
): string {
  const ext = extension.replace(/^\./, '').toLowerCase();
  if (preferredStem?.trim()) {
    return `${sanitizeFilenameStem(preferredStem)}.${ext}`;
  }
  return `${sanitizeFilenameStem(defaultOutputStem(originalName))}.${ext}`;
}
