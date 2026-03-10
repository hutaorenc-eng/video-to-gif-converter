export const PLATFORM_SIZES = {
  android: { width: 364, height: 285 },
  ios9: { width: 364, height: 274 },
  ios26: { width: 364, height: 274 },
} as const;

export type PlatformKey = keyof typeof PLATFORM_SIZES;

/**
 * 从视频文件提取第一帧PNG
 */
export async function extractFirstFrame(videoFile: File): Promise<Blob | null> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.crossOrigin = "anonymous";
    video.style.cssText = "position:absolute;left:-9999px;opacity:0";
    document.body.appendChild(video);

    const tempUrl = URL.createObjectURL(videoFile);
    video.src = tempUrl;

    video.addEventListener("loadeddata", () => {
      video.currentTime = 0;
      video.addEventListener("seeked", () => {
        setTimeout(() => {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(video, 0, 0);
            canvas.toBlob((blob) => {
              document.body.removeChild(video);
              URL.revokeObjectURL(tempUrl);
              resolve(blob);
            }, "image/png");
          } else {
            document.body.removeChild(video);
            URL.revokeObjectURL(tempUrl);
            resolve(null);
          }
        }, 100);
      }, { once: true });
    }, { once: true });

    video.addEventListener("error", () => {
      document.body.removeChild(video);
      URL.revokeObjectURL(tempUrl);
      resolve(null);
    }, { once: true });

    video.load();
  });
}

/**
 * 将视频转换为GIF
 */
export async function convertVideoToGif(
  videoFile: File,
  platform: PlatformKey,
  params: GifParams,
  onProgress: (p: ConvertProgress) => void
): Promise<GifResult> {
  const { width, height } = PLATFORM_SIZES[platform];

  return new Promise(async (resolve, reject) => {
    let video: HTMLVideoElement | null = null;
    let tempVideoUrl: string | null = null;

    try {
      onProgress({ percent: 10, text: "加载视频..." });
      video = document.createElement("video");
      video.muted = true;
      video.playsInline = true;
      video.preload = "auto";
      video.crossOrigin = "anonymous";
      video.style.cssText = "position:absolute;left:-9999px;opacity:0";
      document.body.appendChild(video);

      tempVideoUrl = URL.createObjectURL(videoFile);
      video.src = tempVideoUrl;

      await new Promise<void>((res, rej) => {
        const timeout = setTimeout(() => rej(new Error("视频加载超时（30秒）")), 30000);
        video!.addEventListener("loadeddata", () => { clearTimeout(timeout); res(); }, { once: true });
        video!.addEventListener("error", () => { clearTimeout(timeout); rej(new Error("视频格式不支持或文件损坏")); }, { once: true });
        video!.load();
      });

      const duration = video.duration;
      if (!duration || duration <= 0 || !isFinite(duration)) {
        throw new Error("无法获取视频时长");
      }

      const maxDuration = 20;
      const actualDuration = Math.min(duration, maxDuration);
      const frameInterval = params.fps;
      const totalFrames = Math.floor(actualDuration / frameInterval);

      if (totalFrames < 2) {
        throw new Error(`视频时长太短（${duration.toFixed(2)}秒）`);
      }

      const actualFrames = Math.ceil(totalFrames / params.frameSkip);
      onProgress({ percent: 20, text: `准备提取 ${totalFrames} 帧（抽帧后 ${actualFrames} 帧）...` });

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error("无法创建Canvas上下文");

      onProgress({ percent: 30, text: "开始提取帧..." });
      const images: string[] = [];
      let extractedCount = 0;

      for (let i = 0; i < totalFrames; i++) {
        if (i % params.frameSkip !== 0) continue;

        const targetTime = Math.min(i * frameInterval, actualDuration - 0.01);
        video.currentTime = targetTime;

        await new Promise<void>((res, rej) => {
          const timeout = setTimeout(() => rej(new Error(`帧提取超时: 第${i}帧`)), 5000);
          video!.addEventListener("seeked", () => { clearTimeout(timeout); res(); }, { once: true });
        });

        await new Promise((r) => setTimeout(r, 50));
        ctx.drawImage(video, 0, 0, width, height);
        images.push(canvas.toDataURL("image/png"));
        extractedCount++;

        const progressPercent = 30 + Math.floor((extractedCount / actualFrames) * 50);
        onProgress({ percent: progressPercent, text: `提取帧: ${extractedCount}/${actualFrames}` });
      }

      if (images.length < 2) throw new Error("提取的帧数不足");

      onProgress({ percent: 85, text: "正在编码GIF..." });

      const gifInterval = (params.fps * params.frameSkip) / params.playbackSpeed;

      await new Promise<void>((res, rej) => {
        gifshot.createGIF(
          {
            images,
            gifWidth: width,
            gifHeight: height,
            interval: gifInterval,
            numFrames: images.length,
            frameDuration: 1,
            sampleInterval: 10,
          },
          (obj: { error: boolean; errorMsg?: string; image?: string }) => {
            if (obj.error) {
              rej(new Error(obj.errorMsg || "GIF编码失败"));
              return;
            }

            onProgress({ percent: 95, text: "生成GIF文件..." });

            const byteString = atob(obj.image!.split(",")[1]);
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], { type: "image/gif" });

            // 验证GIF大小
            const sizeWarning = blob.size > VIDEO_SIZE_LIMITS.gif.maxSizeBytes
              ? ` (警告: 超过${VIDEO_SIZE_LIMITS.gif.maxSizeMB}MB限制)`
              : "";

            const url = URL.createObjectURL(blob);

            onProgress({ percent: 100, text: "转换完成！" });

            resolve({
              blob,
              url,
              width,
              height,
              fileSize: blob.size < 1024 * 1024
                ? `${(blob.size / 1024).toFixed(1)} KB${sizeWarning}`
                : `${(blob.size / 1024 / 1024).toFixed(2)} MB${sizeWarning}`,
              params: { ...params },
              actualInterval: `${gifInterval.toFixed(3)}秒/帧`,
            });

            res();
          }
        );
      });
    } catch (err) {
      reject(err);
    } finally {
      if (video && video.parentNode) {
        document.body.removeChild(video);
      }
      if (tempVideoUrl) URL.revokeObjectURL(tempVideoUrl);
    }
  });
}

/**
 * 转换套装视频（656×494）
 * 输出视频大小限制：1.5MB
 */
export async function convertSuitVideo(
  videoFile: File,
  onProgress: (p: ConvertProgress) => void
): Promise<{ blob: Blob; url: string; fileSize: string; extension: string; bitrate?: number }> {
  const { maxSizeMB, maxSizeBytes, safetyFactor, minBitrate, maxBitrate } = VIDEO_SIZE_LIMITS.suitVideo;

  return new Promise(async (resolve, reject) => {
    try {
      onProgress({ percent: 10, text: "加载视频..." });

      const video = document.createElement("video");
      video.muted = true;
      video.playsInline = true;
      video.preload = "auto";
      const tempUrl = URL.createObjectURL(videoFile);
      video.src = tempUrl;

      await new Promise<void>((res, rej) => {
        const timeout = setTimeout(() => rej(new Error("视频加载超时")), 30000);
        video.onloadedmetadata = () => { clearTimeout(timeout); res(); };
        video.onerror = () => { clearTimeout(timeout); rej(new Error("视频加载失败")); };
      });

      // 获取视频时长
      const duration = video.duration;
      if (!duration || duration <= 0 || !isFinite(duration)) {
        throw new Error("无法获取视频时长");
      }

      // 动态计算比特率
      const targetBits = maxSizeBytes * 8 * safetyFactor;
      let calculatedBitrate = Math.floor(targetBits / duration);
      calculatedBitrate = Math.max(minBitrate, Math.min(maxBitrate, calculatedBitrate));

      // 检查视频是否过长
      const maxDurationForMinBitrate = Math.floor(targetBits / minBitrate);
      if (duration > maxDurationForMinBitrate) {
        reject(new Error(`视频时长(${duration.toFixed(1)}秒)过长，建议不超过${maxDurationForMinBitrate}秒以保证输出小于${maxSizeMB}MB`));
        return;
      }

      onProgress({ percent: 30, text: `计算最佳参数 (比特率: ${(calculatedBitrate / 1000000).toFixed(2)}Mbps)...` });

      const canvas = document.createElement("canvas");
      canvas.width = 656;
      canvas.height = 494;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("无法创建Canvas上下文");

      onProgress({ percent: 50, text: "开始录制视频..." });

      const canvasStream = canvas.captureStream(30);
      let combinedStream: MediaStream = canvasStream;

      try {
        const audioVideo = document.createElement("video");
        audioVideo.muted = false;
        audioVideo.src = tempUrl;
        audioVideo.load();
        await new Promise<void>((r) => { audioVideo.onloadedmetadata = () => r(); });
        const audioStream = audioVideo.captureStream();
        const audioTracks = audioStream.getAudioTracks();
        if (audioTracks.length > 0) {
          combinedStream = new MediaStream([...canvasStream.getVideoTracks(), ...audioTracks]);
        }
      } catch { /* continue without audio */ }

      let mimeType = "video/mp4";
      let fileExtension = "mp4";
      if (!MediaRecorder.isTypeSupported("video/mp4")) {
        mimeType = "video/webm;codecs=vp9";
        fileExtension = "webm";
      }

      // 使用动态计算的比特率
      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: calculatedBitrate,
      });

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.start();
      video.play();

      const drawFrame = () => {
        if (!video.paused && !video.ended) {
          ctx.drawImage(video, 0, 0, 656, 494);
          requestAnimationFrame(drawFrame);
        }
      };
      drawFrame();

      await new Promise<void>((r) => { video.onended = () => { mediaRecorder.stop(); r(); }; });
      await new Promise<void>((r) => { mediaRecorder.onstop = () => r(); });

      onProgress({ percent: 90, text: "处理视频数据..." });

      const videoBlob = new Blob(chunks, { type: mimeType });

      // 验证输出大小
      if (videoBlob.size > maxSizeBytes) {
        const actualSize = (videoBlob.size / 1024 / 1024).toFixed(2);
        console.warn(`输出视频(${actualSize}MB)超过目标大小(${maxSizeMB}MB)，视频时长: ${duration.toFixed(1)}秒`);
      }

      const previewUrl = URL.createObjectURL(videoBlob);

      onProgress({ percent: 100, text: "转换完成！" });

      URL.revokeObjectURL(tempUrl);

      resolve({
        blob: videoBlob,
        url: previewUrl,
        fileSize: `${(videoBlob.size / 1024 / 1024).toFixed(2)} MB`,
        extension: fileExtension,
        bitrate: calculatedBitrate,
      });
    } catch (err) {
      reject(err);
    }
  });
}
