export type StillFormat = 'png' | 'jpeg';
export type MovMode = 'resize' | 'extract';
export type FileKind = 'still' | 'gif' | 'video';
export type ProcessStatus = 'pending' | 'processing' | 'done' | 'error';

export const PR_MAX_EDGE = 800;

export type ResizeSettings = {
  maxEdge: number;
  stillFormat: StillFormat;
  jpegQuality: number;
  movMode: MovMode;
  frameIntervalSec: number;
};

export type InputFile = {
  id: string;
  file: File;
  kind: FileKind;
  previewUrl: string;
  outputStem: string;
  width?: number;
  height?: number;
};

export type ProcessedOutput = {
  blob: Blob;
  filename: string;
};

export type FileResult = {
  inputId: string;
  status: ProcessStatus;
  progress: number;
  error?: string;
  outputs: ProcessedOutput[];
};

export const ACCEPTED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'video/quicktime',
  'video/mp4',
];

export const DEFAULT_SETTINGS: ResizeSettings = {
  maxEdge: PR_MAX_EDGE,
  stillFormat: 'png',
  jpegQuality: 0.85,
  movMode: 'resize',
  frameIntervalSec: 1,
};
