/*
 * ZIP打包工具 - 按规范目录结构自动打包
 */

import JSZip from "jszip";
import { saveAs } from "file-saver";

export interface PackageFiles {
  // 视频文件
  androidVideo?: File;
  ios9Video?: File;
  ios26Video?: File;
  // GIF动图
  androidGif?: Blob;
  ios9Gif?: Blob;
  ios26Gif?: Blob;
  // 套装相关
  androidSuitVideo?: Blob;
  ios9SuitVideo?: Blob;
  androidSuitGif?: Blob;
  ios9SuitGif?: Blob;
  ios26SuitGif?: Blob;
  // 首帧
  androidFirstFrame?: Blob;
}

export interface PackageInfo {
  price: string;
  themeName: string;
  type: "regular" | "suit";
}

/**
 * 生成ZIP文件夹名称
 */
export function generateFolderName(info: PackageInfo): string {
  if (info.type === "suit") {
    return `${info.price}元 套装皮肤【${info.themeName}】`;
  }
  return `${info.price}元【${info.themeName}】`;
}

/**
 * 生成ZIP文件名
 */
export function generateZipName(info: PackageInfo): string {
  return `${generateFolderName(info)}.zip`;
}

/**
 * 打包常规模式ZIP
 * 目录结构：
 * {价格}元【{主题名}】/
 *   ├── iOS26.gif          ← iOS 26键动图
 *   ├── iOS9.gif           ← iOS 9键动图
 *   ├── iOS视频9.mp4       ← 原始视频
 *   ├── 安卓9.gif          ← 安卓动图
 *   ├── 安卓视频.mp4       ← 原始视频
 *   └── 安卓首帧.png       ← 安卓视频首帧截图
 */
async function packRegular(zip: JSZip, folder: JSZip, files: PackageFiles, androidVideo?: File, ios9Video?: File): Promise<void> {
  // 安卓视频
  if (androidVideo) {
    folder.file("安卓视频.mp4", androidVideo);
  }
  // iOS9视频
  if (ios9Video) {
    folder.file("iOS视频9.mp4", ios9Video);
  }
  // 安卓首帧
  if (files.androidFirstFrame) {
    folder.file("安卓首帧.png", files.androidFirstFrame);
  }
  // 安卓GIF
  if (files.androidGif) {
    folder.file("安卓9.gif", files.androidGif);
  }
  // iOS9 GIF
  if (files.ios9Gif) {
    folder.file("iOS9.gif", files.ios9Gif);
  }
  // iOS26 GIF
  if (files.ios26Gif) {
    folder.file("iOS26.gif", files.ios26Gif);
  }
}

/**
 * 打包套装模式ZIP
 * 目录结构：
 * {价格}元 套装皮肤【{主题名}】/
 *   ├── iOS动图26.gif       ← 常规动图
 *   ├── iOS动图26tz.gif     ← 套装动图
 *   ├── iOS动图9.gif        ← 常规动图
 *   ├── iOS动图9tz.gif      ← 套装动图
 *   ├── iOS套装.mp4         ← 套装视频
 *   ├── iOS视频9.mp4        ← 原始视频
 *   ├── 安卓动图.gif        ← 常规动图
 *   ├── 安卓动图tz.gif      ← 套装动图
 *   ├── 安卓套装.mp4        ← 套装视频
 *   ├── 安卓视频.mp4        ← 原始视频
 *   └── 安卓视频首帧.png     ← 安卓视频首帧截图
 */
async function packSuit(zip: JSZip, folder: JSZip, files: PackageFiles, androidVideo?: File, ios9Video?: File): Promise<void> {
  // 视频
  if (androidVideo) {
    folder.file("安卓视频.mp4", androidVideo);
  }
  if (ios9Video) {
    folder.file("iOS视频9.mp4", ios9Video);
  }
  // 套装视频
  if (files.androidSuitVideo) {
    folder.file("安卓套装.mp4", files.androidSuitVideo);
  }
  if (files.ios9SuitVideo) {
    folder.file("iOS套装.mp4", files.ios9SuitVideo);
  }
  // 首帧
  if (files.androidFirstFrame) {
    folder.file("安卓视频首帧.png", files.androidFirstFrame);
  }
  // 常规GIF
  if (files.androidGif) {
    folder.file("安卓动图.gif", files.androidGif);
  }
  if (files.ios9Gif) {
    folder.file("iOS动图9.gif", files.ios9Gif);
  }
  if (files.ios26Gif) {
    folder.file("iOS动图26.gif", files.ios26Gif);
  }
  // 套装GIF
  if (files.androidSuitGif) {
    folder.file("安卓动图tz.gif", files.androidSuitGif);
  }
  if (files.ios9SuitGif) {
    folder.file("iOS动图9tz.gif", files.ios9SuitGif);
  }
  if (files.ios26SuitGif) {
    folder.file("iOS动图26tz.gif", files.ios26SuitGif);
  }
}

/**
 * 创建并下载ZIP包
 */
export async function createAndDownloadZip(
  info: PackageInfo,
  files: PackageFiles,
  androidVideo?: File,
  ios9Video?: File
): Promise<{ zipBlob: Blob; fileName: string; fileSize: string }> {
  const zip = new JSZip();
  const folderName = generateFolderName(info);
  const folder = zip.folder(folderName)!;

  if (info.type === "regular") {
    await packRegular(zip, folder, files, androidVideo, ios9Video);
  } else {
    await packSuit(zip, folder, files, androidVideo, ios9Video);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  const fileName = generateZipName(info);
  const fileSize = zipBlob.size < 1024 * 1024
    ? `${(zipBlob.size / 1024).toFixed(1)} KB`
    : `${(zipBlob.size / 1024 / 1024).toFixed(2)} MB`;

  saveAs(zipBlob, fileName);

  return { zipBlob, fileName, fileSize };
}
