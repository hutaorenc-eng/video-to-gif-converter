/*
 * 视频上传组件 - 支持拖拽和点击上传，带文件校验
 * 品牌视觉：废柴家族 — 暖灰/奶白中性色调
 */

import { useRef, useState, useCallback } from "react";
import { Upload, X, FileVideo } from "lucide-react";

interface VideoUploaderProps {
  label: string;
  required?: boolean;
  file: File | null;
  onFileChange: (file: File | null) => void;
  accept?: string;
  maxSize?: number;
}

const ACCEPTED_FORMATS = [".mp4", ".mov", ".avi", ".mkv"];
const MAX_FILE_SIZE = 100;

export default function VideoUploader({
  label,
  required = false,
  file,
  onFileChange,
  accept = ".mp4,.mov,.avi,.mkv",
  maxSize = MAX_FILE_SIZE,
}: VideoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const validateFile = useCallback(
    (f: File): string | null => {
      const ext = "." + f.name.split(".").pop()?.toLowerCase();
      if (!ACCEPTED_FORMATS.includes(ext)) {
        return `不支持的格式: ${ext}，请上传 ${ACCEPTED_FORMATS.join(", ")} 格式`;
      }
      if (f.size > maxSize * 1024 * 1024) {
        return `文件大小超过 ${maxSize}MB 限制`;
      }
      return null;
    },
    [maxSize]
  );

  const handleFile = useCallback(
    (f: File) => {
      const error = validateFile(f);
      if (error) {
        alert(error);
        return;
      }
      onFileChange(f);
    },
    [validateFile, onFileChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) handleFile(f);
      e.target.value = "";
    },
    [handleFile]
  );

  if (file) {
    return (
      <div className="rounded-xl p-4 relative" style={{ border: "2px solid oklch(0.78 0.1 145 / 0.4)", background: "oklch(0.96 0.02 145 / 0.3)" }}>
        <button
          className="absolute top-2 right-2 transition-colors"
          style={{ color: "oklch(0.58 0.02 55)" }}
          onClick={() => onFileChange(null)}
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <FileVideo className="w-10 h-10 shrink-0" style={{ color: "oklch(0.55 0.12 145)" }} />
          <div className="min-w-0">
            <p className="font-medium text-brand-charcoal truncate">{file.name}</p>
            <p className="text-xs text-brand-brown-light">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl p-6 text-center transition-all cursor-pointer"
      style={{
        border: isDragOver ? "2px dashed oklch(0.50 0.08 55)" : "2px dashed oklch(0.88 0.008 60)",
        background: isDragOver ? "oklch(0.96 0.005 60)" : "oklch(0.995 0.002 60)",
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleInputChange}
      />
      <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: "oklch(0.55 0.03 55)" }} />
      <p className="text-sm font-medium text-brand-brown">
        上传 <strong>{label}</strong>
      </p>
      <p className="text-xs text-brand-brown-light mt-1">
        支持格式: {accept}
      </p>
      <p className="text-xs text-brand-brown-light">
        最大文件大小: {maxSize}MB
      </p>
      {required && (
        <span className="inline-block mt-2 text-xs font-medium" style={{ color: "oklch(0.55 0.08 30)" }}>必选</span>
      )}
    </div>
  );
}
