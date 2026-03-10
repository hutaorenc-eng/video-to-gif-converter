declare module "jszip" {
  interface JSZipObject {
    name: string;
    dir: boolean;
    date: Date;
    comment: string;
    unixPermissions: number;
    dosPermissions: number;
    async(type: string): Promise<any>;
  }

  interface JSZipGeneratorOptions {
    type: "blob" | "arraybuffer" | "uint8array" | "nodebuffer" | "base64" | "string";
    compression?: string;
    compressionOptions?: { level: number };
  }

  class JSZip {
    file(name: string, data: any, options?: any): JSZip;
    folder(name: string): JSZip | null;
    generateAsync(options: JSZipGeneratorOptions): Promise<any>;
    forEach(callback: (relativePath: string, file: JSZipObject) => void): void;
  }

  export default JSZip;
}
