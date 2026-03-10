/*
 * GIF合并工具 - 将多个GIF按顺序拼接成一个大GIF
 * 用于魔盒模式的"四合一"动图功能
 * 
 * 原理：使用omggif解码每个GIF的帧，然后用gifenc重新编码为一个合并的GIF
 */

import { GifReader } from "omggif";
import { GIFEncoder, quantize, applyPalette } from "gifenc";

export interface MergeProgress {
  percent: number;
  text: string;
}

/**
 * 将多个GIF Blob按顺序合并为一个GIF
 * @param gifBlobs - GIF Blob数组，按顺序排列
 * @param onProgress - 进度回调
 * @returns 合并后的GIF Blob
 */
export async function mergeGifs(
  gifBlobs: Blob[],
  onProgress?: (p: MergeProgress) => void
): Promise<Blob> {
  if (gifBlobs.length === 0) {
    throw new Error("没有可合并的GIF");
  }

  if (gifBlobs.length === 1) {
    return gifBlobs[0];
  }

  onProgress?.({ percent: 5, text: "开始解码GIF帧..." });

  // 1. 解码所有GIF，提取帧数据
  interface FrameData {
    imageData: Uint8ClampedArray; // RGBA像素数据
    width: number;
    height: number;
    delay: number; // 帧延迟（毫秒）
  }

  const allFrames: FrameData[] = [];
  let targetWidth = 0;
  let targetHeight = 0;

  for (let gi = 0; gi < gifBlobs.length; gi++) {
    const blob = gifBlobs[gi];
    const arrayBuffer = await blob.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);

    let reader: GifReader;
    try {
      reader = new GifReader(uint8 as Buffer);
    } catch (e) {
      console.warn(`GIF ${gi + 1} 解码失败，跳过:`, e);
      continue;
    }

    // 使用第一个GIF的尺寸作为目标尺寸
    if (targetWidth === 0) {
      targetWidth = reader.width;
      targetHeight = reader.height;
    }

    const frameCount = reader.numFrames();
    for (let fi = 0; fi < frameCount; fi++) {
      const frameInfo = reader.frameInfo(fi);
      const pixels = new Uint8ClampedArray(reader.width * reader.height * 4);
      reader.decodeAndBlitFrameRGBA(fi, pixels);

      // 如果尺寸不同，需要缩放到目标尺寸
      let finalPixels = pixels;
      if (reader.width !== targetWidth || reader.height !== targetHeight) {
        finalPixels = resizePixels(pixels, reader.width, reader.height, targetWidth, targetHeight);
      }

      allFrames.push({
        imageData: finalPixels,
        width: targetWidth,
        height: targetHeight,
        delay: (frameInfo.delay || 10) * 10, // GIF delay单位是1/100秒，转为毫秒
      });
    }

    const progressPercent = 5 + Math.floor(((gi + 1) / gifBlobs.length) * 40);
    onProgress?.({ percent: progressPercent, text: `解码GIF: ${gi + 1}/${gifBlobs.length}` });
  }

  if (allFrames.length === 0) {
    throw new Error("没有可用的帧数据");
  }

  onProgress?.({ percent: 50, text: `共 ${allFrames.length} 帧，开始编码合并GIF...` });

  // 2. 使用gifenc编码合并的GIF
  const gif = GIFEncoder();

  for (let i = 0; i < allFrames.length; i++) {
    const frame = allFrames[i];

    // 量化颜色（将RGBA转为调色板索引）
    const palette = quantize(frame.imageData, 256);
    const index = applyPalette(frame.imageData, palette);

    // 添加帧，delay单位是1/100秒
    gif.writeFrame(index, frame.width, frame.height, {
      palette,
      delay: Math.round(frame.delay / 10), // 毫秒转回1/100秒
    });

    if (i % 5 === 0 || i === allFrames.length - 1) {
      const progressPercent = 50 + Math.floor(((i + 1) / allFrames.length) * 45);
      onProgress?.({ percent: progressPercent, text: `编码帧: ${i + 1}/${allFrames.length}` });
    }
  }

  gif.finish();

  const output = gif.bytes();
  const mergedBlob = new Blob([output], { type: "image/gif" });

  onProgress?.({ percent: 100, text: `合并完成！大小: ${(mergedBlob.size / 1024 / 1024).toFixed(2)} MB` });

  return mergedBlob;
}

/**
 * 简单的最近邻缩放
 */
function resizePixels(
  src: Uint8ClampedArray,
  srcW: number,
  srcH: number,
  dstW: number,
  dstH: number
): Uint8ClampedArray {
  const dst = new Uint8ClampedArray(dstW * dstH * 4);
  const xRatio = srcW / dstW;
  const yRatio = srcH / dstH;

  for (let y = 0; y < dstH; y++) {
    for (let x = 0; x < dstW; x++) {
      const srcX = Math.floor(x * xRatio);
      const srcY = Math.floor(y * yRatio);
      const srcIdx = (srcY * srcW + srcX) * 4;
      const dstIdx = (y * dstW + x) * 4;
      dst[dstIdx] = src[srcIdx];
      dst[dstIdx + 1] = src[srcIdx + 1];
      dst[dstIdx + 2] = src[srcIdx + 2];
      dst[dstIdx + 3] = src[srcIdx + 3];
    }
  }

  return dst;
}
