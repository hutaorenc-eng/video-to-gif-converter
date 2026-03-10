declare module 'gifshot' {
  interface GifShotOptions {
    images?: string[];
    gifWidth?: number;
    gifHeight?: number;
    interval?: number;
    numFrames?: number;
    frameDuration?: number;
    sampleInterval?: number;
    numWorkers?: number;
    video?: string[];
    filter?: string;
    offset?: number;
    text?: string;
    fontWeight?: string;
    fontSize?: string;
    fontFamily?: string;
    fontColor?: string;
    textAlign?: string;
    textBaseline?: string;
    waterMark?: HTMLImageElement;
    waterMarkHeight?: number;
    waterMarkWidth?: number;
    waterMarkXCoordinate?: number;
    waterMarkYCoordinate?: number;
    progressCallback?: (captureProgress: number) => void;
  }

  interface GifShotResult {
    error: boolean;
    errorCode?: string;
    errorMsg?: string;
    image: string;
  }

  function createGIF(
    options: GifShotOptions,
    callback: (result: GifShotResult) => void
  ): void;

  function takeSnapShot(
    options: GifShotOptions,
    callback: (result: GifShotResult) => void
  ): void;

  function isSupported(): boolean;
}
