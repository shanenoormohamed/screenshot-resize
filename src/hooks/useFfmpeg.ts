import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpegInstance: FFmpeg | null = null;
let loadPromise: Promise<FFmpeg> | null = null;

const CORE_VERSION = '0.12.6';
const CORE_BASE = `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${CORE_VERSION}/dist/esm`;

export async function getFfmpeg(
  onLoadProgress?: (ratio: number) => void,
): Promise<FFmpeg> {
  if (ffmpegInstance?.loaded) return ffmpegInstance;

  if (!loadPromise) {
    loadPromise = (async () => {
      const ffmpeg = new FFmpeg();
      ffmpeg.on('log', () => {});
      if (onLoadProgress) {
        ffmpeg.on('progress', ({ progress }) => {
          onLoadProgress(Math.min(1, Math.max(0, progress)));
        });
      }
      await ffmpeg.load({
        coreURL: await toBlobURL(
          `${CORE_BASE}/ffmpeg-core.js`,
          'text/javascript',
        ),
        wasmURL: await toBlobURL(
          `${CORE_BASE}/ffmpeg-core.wasm`,
          'application/wasm',
        ),
      });
      ffmpegInstance = ffmpeg;
      return ffmpeg;
    })();
  }

  return loadPromise;
}

export function resetFfmpegFiles(ffmpeg: FFmpeg, names: string[]): void {
  for (const name of names) {
    try {
      ffmpeg.deleteFile(name);
    } catch {
      // file may not exist
    }
  }
}
