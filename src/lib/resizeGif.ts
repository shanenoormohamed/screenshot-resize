import { decompressFrames, parseGIF, type ParsedFrame } from 'gifuct-js';
import { GIFEncoder, applyPalette, quantize } from 'gifenc';
import { fitToMaxEdge } from './resizeImage';

type GifFrame = ParsedFrame;

function compositeFrame(
  fullCtx: CanvasRenderingContext2D,
  frame: GifFrame,
  fullWidth: number,
  fullHeight: number,
): void {
  if (frame.disposalType === 2) {
    fullCtx.clearRect(0, 0, fullWidth, fullHeight);
  }

  const patchCanvas = document.createElement('canvas');
  patchCanvas.width = frame.dims.width;
  patchCanvas.height = frame.dims.height;
  const patchCtx = patchCanvas.getContext('2d');
  if (!patchCtx) return;

  const imageData = patchCtx.createImageData(frame.dims.width, frame.dims.height);
  imageData.data.set(frame.patch);
  patchCtx.putImageData(imageData, 0, 0);
  fullCtx.drawImage(patchCanvas, frame.dims.left, frame.dims.top);
}

export async function resizeGif(file: File, maxEdge: number): Promise<Blob> {
  const buffer = await file.arrayBuffer();
  const gif = parseGIF(buffer);
  const frames = decompressFrames(gif, true);
  if (frames.length === 0) {
    throw new Error('GIF has no frames');
  }

  const srcWidth = gif.lsd.width;
  const srcHeight = gif.lsd.height;
  const { width, height } = fitToMaxEdge(srcWidth, srcHeight, maxEdge);

  const fullCanvas = document.createElement('canvas');
  fullCanvas.width = srcWidth;
  fullCanvas.height = srcHeight;
  const fullCtx = fullCanvas.getContext('2d');
  if (!fullCtx) throw new Error('Canvas unavailable');

  const outCanvas = document.createElement('canvas');
  outCanvas.width = width;
  outCanvas.height = height;
  const outCtx = outCanvas.getContext('2d');
  if (!outCtx) throw new Error('Canvas unavailable');

  const encoder = GIFEncoder();

  for (let i = 0; i < frames.length; i += 1) {
    const frame = frames[i];
    compositeFrame(fullCtx, frame, srcWidth, srcHeight);
    outCtx.clearRect(0, 0, width, height);
    outCtx.drawImage(fullCanvas, 0, 0, width, height);
    const imageData = outCtx.getImageData(0, 0, width, height);
    const palette = quantize(imageData.data, 256);
    const index = applyPalette(imageData.data, palette);
    const delay = Math.max(20, (frame.delay ?? 10) * 10);

    encoder.writeFrame(index, width, height, {
      palette,
      delay,
      ...(i === 0 ? { repeat: 0 } : {}),
    });
  }

  encoder.finish();
  const bytes = encoder.bytes();
  return new Blob([Uint8Array.from(bytes)], { type: 'image/gif' });
}

export function gifOutputFilename(originalName: string): string {
  const base = originalName.replace(/\.[^.]+$/, '');
  return `${base}-resized.gif`;
}
