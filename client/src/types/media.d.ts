// Extend HTMLVideoElement and HTMLCanvasElement with captureStream
interface HTMLVideoElement {
  captureStream(frameRate?: number): MediaStream;
}

interface HTMLCanvasElement {
  captureStream(frameRate?: number): MediaStream;
}
