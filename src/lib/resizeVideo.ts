import { fetchFile } from '@ffmpeg/util';
import type { FFmpeg } from '@ffmpeg/ffmpeg';
import { resetFfmpegFiles } from '../hooks/useFfmpeg';

function inputName(file: File): string {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'mov';
  return `input.${ext}`;
}

export async function resizeVideo(
  ffmpeg: FFmpeg,
  file: File,
  maxEdge: number,
): Promise<{ blob: Blob; filename: string }> {
  const inName = inputName(file);
  const outName = 'output.mp4';
  resetFfmpegFiles(ffmpeg, [inName, outName]);

  await ffmpeg.writeFile(inName, await fetchFile(file));

  // Scale to fit within maxEdge on the longest side, only shrink never enlarge.
  // force_original_aspect_ratio=decrease avoids expression quoting issues in ffmpeg.wasm.
  // Second scale pass ensures even dimensions required by libx264.
  const scale = `scale=${maxEdge}:${maxEdge}:force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2`;
  await ffmpeg.exec([
    '-i',
    inName,
    '-vf',
    scale,
    '-c:v',
    'libx264',
    '-crf',
    '28',
    '-preset',
    'fast',
    '-movflags',
    '+faststart',
    '-an',
    outName,
  ]);

  const data = await ffmpeg.readFile(outName);
  const bytes =
    data instanceof Uint8Array ? data : new TextEncoder().encode(data);
  const base = file.name.replace(/\.[^.]+$/, '');
  return {
    blob: new Blob([Uint8Array.from(bytes)], { type: 'video/mp4' }),
    filename: `${base}-resized.mp4`,
  };
}
