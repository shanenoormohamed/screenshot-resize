import type { FFmpeg } from '@ffmpeg/ffmpeg';
import type { InputFile, ProcessedOutput, ResizeSettings } from '../types';
import { extractFrames } from './extractFrames';
import { gifOutputFilename, resizeGif } from './resizeGif';
import { outputFilename, resizeStillImage } from './resizeImage';
import { resizeVideo } from './resizeVideo';

export async function processFile(
  input: InputFile,
  settings: ResizeSettings,
  ffmpeg: FFmpeg | null,
  onProgress?: (ratio: number) => void,
): Promise<ProcessedOutput[]> {
  onProgress?.(0.1);

  if (input.kind === 'still') {
    const blob = await resizeStillImage(
      input.file,
      settings.maxEdge,
      settings.stillFormat,
      settings.jpegQuality,
    );
    onProgress?.(1);
    const filename = outputFilename(
      input.file.name,
      settings.stillFormat,
      input.outputStem,
    );
    return [{ blob, filename }];
  }

  if (input.kind === 'gif') {
    const blob = await resizeGif(input.file, settings.maxEdge);
    onProgress?.(1);
    const filename = gifOutputFilename(input.file.name, input.outputStem);
    return [{ blob, filename }];
  }

  if (!ffmpeg) {
    throw new Error('Video processor not loaded');
  }

  if (settings.movMode === 'resize') {
    const result = await resizeVideo(
      ffmpeg,
      input.file,
      settings.maxEdge,
      input.outputStem,
    );
    onProgress?.(1);
    return [result];
  }

  const frames = await extractFrames(
    ffmpeg,
    input.file,
    settings.maxEdge,
    settings.frameIntervalSec,
    input.outputStem,
  );
  onProgress?.(1);
  return frames;
}
