import { fetchFile } from '@ffmpeg/util';
import type { FFmpeg } from '@ffmpeg/ffmpeg';
import { resetFfmpegFiles } from '../hooks/useFfmpeg';
import { readVideoDimensions } from './fileMeta';
import { sanitizeFilenameStem } from './filenames';

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

export async function extractFrames(
  ffmpeg: FFmpeg,
  file: File,
  maxEdge: number,
  intervalSec: number,
  outputStem?: string,
): Promise<{ blob: Blob; filename: string }[]> {
  const inName = inputName(file);
  const pattern = 'frame_%03d.png';
  resetFfmpegFiles(ffmpeg, [inName, pattern]);

  await ffmpeg.writeFile(inName, await fetchFile(file));

  const { width, height } = await readVideoDimensions(file);
  const scale =
    height > width
      ? `scale=-2:'min(${maxEdge},ih)'`
      : `scale='min(${maxEdge},iw)':-2`;
  const fps = intervalSec > 0 ? 1 / intervalSec : 1;

  const args = ['-threads', '1'];
  if (isMovFile(file)) {
    args.push('-f', 'mov');
  }
  args.push(
    '-i',
    inName,
    '-vf',
    `${scale},fps=${fps}`,
    '-frames:v',
    '30',
    pattern,
  );

  await ffmpeg.exec(args);

  const stem = outputStem?.trim()
    ? sanitizeFilenameStem(outputStem)
    : sanitizeFilenameStem(file.name);
  const outputs: { blob: Blob; filename: string }[] = [];

  for (let i = 1; i <= 30; i += 1) {
    const name = `frame_${String(i).padStart(3, '0')}.png`;
    try {
      const data = await ffmpeg.readFile(name);
      if (typeof data === 'string') continue;
      const frameName = `${stem}-frame-${String(i).padStart(3, '0')}.png`;
      outputs.push({
        blob: new Blob([new Uint8Array(data.slice())], { type: 'image/png' }),
        filename: frameName,
      });
      ffmpeg.deleteFile(name);
    } catch {
      break;
    }
  }

  if (outputs.length === 0) {
    throw new Error('No frames extracted');
  }

  return outputs;
}
