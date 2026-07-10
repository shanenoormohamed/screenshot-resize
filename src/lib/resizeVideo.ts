import { fetchFile } from '@ffmpeg/util';
import type { FFmpeg } from '@ffmpeg/ffmpeg';
import { resetFfmpegFiles } from '../hooks/useFfmpeg';
import { readVideoDimensions } from './fileMeta';
import { resizedOutputFilename } from './filenames';

function inputName(file: File): string {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'mov';
  return `input.${ext}`;
}

function isMovFile(file: File): boolean {
  return (
    file.type === 'video/quicktime' ||
    /\.mov$/i.test(file.name)
  );
}

/** Pick scale filter in JS so ffmpeg.wasm gets literal -2 (not expression results). */
function videoScaleFilter(
  maxEdge: number,
  width: number,
  height: number,
): string {
  if (height > width) {
    return `scale=-2:'min(${maxEdge},ih)'`;
  }
  return `scale='min(${maxEdge},iw)':-2`;
}

function videoBytesFromFfmpegData(data: Uint8Array | string): Uint8Array {
  if (typeof data === 'string') {
    throw new Error('Video output was not binary');
  }
  if (data.byteLength === 0) {
    throw new Error('Video output was empty');
  }
  return data.slice();
}

export async function resizeVideo(
  ffmpeg: FFmpeg,
  file: File,
  maxEdge: number,
  outputStem?: string,
): Promise<{ blob: Blob; filename: string }> {
  const inName = inputName(file);
  const outName = 'output.mp4';
  resetFfmpegFiles(ffmpeg, [inName, outName]);

  await ffmpeg.writeFile(inName, await fetchFile(file));

  const { width, height } = await readVideoDimensions(file);
  const scale = videoScaleFilter(maxEdge, width, height);

  const args = ['-threads', '1'];
  if (isMovFile(file)) {
    args.push('-f', 'mov');
  }
  args.push(
    '-i',
    inName,
    '-vf',
    scale,
    '-c:v',
    'libx264',
    '-pix_fmt',
    'yuv420p',
    '-crf',
    '28',
    '-preset',
    'fast',
    '-movflags',
    '+faststart',
    '-an',
    outName,
  );

  const exitCode = await ffmpeg.exec(args);
  if (exitCode !== 0) {
    throw new Error(`Video resize failed (exit ${exitCode})`);
  }

  const data = await ffmpeg.readFile(outName);
  const filename = resizedOutputFilename(file.name, 'mp4', outputStem);
  const bytes = videoBytesFromFfmpegData(data);
  return {
    blob: new Blob([new Uint8Array(bytes)], { type: 'video/mp4' }),
    filename,
  };
}
