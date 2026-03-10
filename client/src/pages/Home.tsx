/*
 * 皮肤视频转GIF工具 - 主页
 * 品牌视觉：废柴家族 — 暖灰/奶白中性色调
 */

import { useState, useCallback, useMemo } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import {
  Sparkles,
  History,
  FileText,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import VideoUploader from "@/components/VideoUploader";
import GifPreviewPanel from "@/components/GifPreviewPanel";
import HistoryDialog from "@/components/HistoryDialog";
import SpecsDialog from "@/components/SpecsDialog";
import {
  convertVideoToGif,
  extractFirstFrame,
  convertSuitVideo,
  DEFAULT_PARAMS,
  type GifResult,
  type GifParams,
  type PlatformKey,
  type ConvertProgress,
} from "@/lib/gifEngine";
import { createAndDownloadZip, type PackageFiles } from "@/lib/zipPacker";
import { addHistory } from "@/lib/historyStore";

type ThemeType = "regular" | "suit";

interface ProcessingStatus {
  step: string;
  detail: string;
  percent: number;
  isError?: boolean;
}

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663304533121/AHZh7dX9Bs3JsGaWxL2v4X/feicai-logo-head_0105bd84.png";

export default function Home() {
  // ===== 步骤①：主题信息 =====
  const [price, setPrice] = useState("3");
  const [themeName, setThemeName] = useState("");
  const [themeType, setThemeType] = useState<ThemeType>("regular");

  // ===== 步骤②：视频上传 =====
  const [androidVideo, setAndroidVideo] = useState<File | null>(null);
  const [ios9Video, setIos9Video] = useState<File | null>(null);
  const [ios26Video, setIos26Video] = useState<File | null>(null);

  // ===== 处理状态 =====
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  // ===== GIF结果 =====
  const [gifResults, setGifResults] = useState<Record<string, GifResult>>({});
  const [suitGifResults, setSuitGifResults] = useState<Record<string, GifResult>>({});
  const [firstFrameBlob, setFirstFrameBlob] = useState<Blob | null>(null);
  const [suitVideoResults, setSuitVideoResults] = useState<Record<string, { blob: Blob; extension: string }>>({});
  const [isRegenerating, setIsRegenerating] = useState<string | null>(null);

  // ===== 弹窗 =====
  const [showHistory, setShowHistory] = useState(false);
  const [showSpecs, setShowSpecs] = useState(false);

  // 文件名预览
  const folderNamePreview = useMemo(() => {
    if (!themeName.trim()) return "请填写主题名";
    if (themeType === "suit") {
      return `${price}元 套装皮肤【${themeName}】`;
    }
    return `${price}元【${themeName}】`;
  }, [price, themeName, themeType]);

  // 校验是否可以开始处理
  const canProcess = useMemo(() => {
    if (!themeName.trim()) return false;
    if (!androidVideo) return false;
    if (!ios9Video) return false;
    if (!ios26Video) return false;
    return true;
  }, [themeName, androidVideo, ios9Video, ios26Video]);

  // ===== 核心处理流程 =====
  const startProcessing = useCallback(async () => {
    if (!canProcess) {
      toast.error("请完成所有必填项");
      return;
    }

    setIsProcessing(true);
    setIsComplete(false);
    setGifResults({});
    setSuitGifResults({});
    setFirstFrameBlob(null);
    setSuitVideoResults({});

    const newGifResults: Record<string, GifResult> = {};
    const newSuitGifResults: Record<string, GifResult> = {};
    const newSuitVideoResults: Record<string, { blob: Blob; extension: string }> = {};
    let newFirstFrameBlob: Blob | null = null;

    try {
      setProcessingStatus({ step: "安卓首帧", detail: "提取安卓视频第一帧PNG...", percent: 5 });
      newFirstFrameBlob = await extractFirstFrame(androidVideo!);
      setFirstFrameBlob(newFirstFrameBlob);

      setProcessingStatus({ step: "安卓动图", detail: "正在转换安卓GIF...", percent: 10 });
      const androidGif = await convertVideoToGif(androidVideo!, "android", DEFAULT_PARAMS, (p: ConvertProgress) => {
        setProcessingStatus({ step: "安卓动图", detail: p.text, percent: 10 + p.percent * 0.15 });
      });
      newGifResults.android = androidGif;
      setGifResults({ ...newGifResults });

      setProcessingStatus({ step: "iOS 9键动图", detail: "正在转换iOS 9键GIF...", percent: 30 });
      const ios9Gif = await convertVideoToGif(ios9Video!, "ios9", DEFAULT_PARAMS, (p: ConvertProgress) => {
        setProcessingStatus({ step: "iOS 9键动图", detail: p.text, percent: 30 + p.percent * 0.15 });
      });
      newGifResults.ios9 = ios9Gif;
      setGifResults({ ...newGifResults });

      setProcessingStatus({ step: "iOS 26键动图", detail: "正在转换iOS 26键GIF...", percent: 50 });
      const ios26Gif = await convertVideoToGif(ios26Video!, "ios26", DEFAULT_PARAMS, (p: ConvertProgress) => {
        setProcessingStatus({ step: "iOS 26键动图", detail: p.text, percent: 50 + p.percent * 0.15 });
      });
      newGifResults.ios26 = ios26Gif;
      setGifResults({ ...newGifResults });

      if (themeType === "suit") {
        setProcessingStatus({ step: "安卓套装视频", detail: "正在转换安卓套装视频(656×494)...", percent: 70 });
        const androidSuitVid = await convertSuitVideo(androidVideo!, (p: ConvertProgress) => {
          setProcessingStatus({ step: "安卓套装视频", detail: p.text, percent: 70 + p.percent * 0.05 });
        });
        newSuitVideoResults.android = { blob: androidSuitVid.blob, extension: androidSuitVid.extension };

        setProcessingStatus({ step: "iOS套装视频", detail: "正在转换iOS套装视频(656×494)...", percent: 76 });
        const ios9SuitVid = await convertSuitVideo(ios9Video!, (p: ConvertProgress) => {
          setProcessingStatus({ step: "iOS套装视频", detail: p.text, percent: 76 + p.percent * 0.05 });
        });
        newSuitVideoResults.ios9 = { blob: ios9SuitVid.blob, extension: ios9SuitVid.extension };
        setSuitVideoResults({ ...newSuitVideoResults });

        setProcessingStatus({ step: "安卓套装动图", detail: "正在转换安卓套装GIF...", percent: 82 });
        const androidSuitGif = await convertVideoToGif(androidVideo!, "android", DEFAULT_PARAMS, (p: ConvertProgress) => {
          setProcessingStatus({ step: "安卓套装动图", detail: p.text, percent: 82 + p.percent * 0.05 });
        });
        newSuitGifResults.android = androidSuitGif;

        setProcessingStatus({ step: "iOS 9键套装动图", detail: "正在转换iOS 9键套装GIF...", percent: 88 });
        const ios9SuitGif = await convertVideoToGif(ios9Video!, "ios9", DEFAULT_PARAMS, (p: ConvertProgress) => {
          setProcessingStatus({ step: "iOS 9键套装动图", detail: p.text, percent: 88 + p.percent * 0.05 });
        });
        newSuitGifResults.ios9 = ios9SuitGif;

        setProcessingStatus({ step: "iOS 26键套装动图", detail: "正在转换iOS 26键套装GIF...", percent: 94 });
        const ios26SuitGif = await convertVideoToGif(ios26Video!, "ios26", DEFAULT_PARAMS, (p: ConvertProgress) => {
          setProcessingStatus({ step: "iOS 26键套装动图", detail: p.text, percent: 94 + p.percent * 0.05 });
        });
        newSuitGifResults.ios26 = ios26SuitGif;
        setSuitGifResults({ ...newSuitGifResults });
      }

      setProcessingStatus({ step: "完成", detail: "所有文件处理完成！", percent: 100 });
      setIsComplete(true);
      toast.success("所有文件处理完成！");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "未知错误";
      setProcessingStatus({ step: "错误", detail: msg, percent: 0, isError: true });
      toast.error("处理失败: " + msg);
    } finally {
      setIsProcessing(false);
    }
  }, [canProcess, androidVideo, ios9Video, ios26Video, themeType]);

  // ===== 重新生成单个GIF =====
  const handleRegenerate = useCallback(
    async (platform: PlatformKey, params: GifParams, isSuit: boolean) => {
      const key = isSuit ? `suit-${platform}` : platform;
      setIsRegenerating(key);

      const videoMap: Record<string, File | null> = {
        android: androidVideo,
        ios9: ios9Video,
        ios26: ios26Video,
      };
      const videoFile = videoMap[platform];
      if (!videoFile) {
        toast.error("找不到对应的视频文件");
        setIsRegenerating(null);
        return;
      }

      try {
        const result = await convertVideoToGif(videoFile, platform, params, () => {});
        if (isSuit) {
          setSuitGifResults((prev) => ({ ...prev, [platform]: result }));
        } else {
          setGifResults((prev) => ({ ...prev, [platform]: result }));
        }
        toast.success(`${isSuit ? "套装" : ""}${platform} GIF 重新生成成功`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "未知错误";
        toast.error("重新生成失败: " + msg);
      } finally {
        setIsRegenerating(null);
      }
    },
    [androidVideo, ios9Video, ios26Video]
  );

  // ===== 打包下载 =====
  const handleDownloadZip = useCallback(async () => {
    if (!isComplete) {
      toast.error("请先完成处理");
      return;
    }

    try {
      const files: PackageFiles = {
        androidGif: gifResults.android?.blob,
        ios9Gif: gifResults.ios9?.blob,
        ios26Gif: gifResults.ios26?.blob,
        androidFirstFrame: firstFrameBlob || undefined,
      };

      if (themeType === "suit") {
        files.androidSuitVideo = suitVideoResults.android?.blob;
        files.ios9SuitVideo = suitVideoResults.ios9?.blob;
        files.androidSuitGif = suitGifResults.android?.blob;
        files.ios9SuitGif = suitGifResults.ios9?.blob;
        files.ios26SuitGif = suitGifResults.ios26?.blob;
      }

      const info = { price, themeName, type: themeType };
      const result = await createAndDownloadZip(info, files, androidVideo || undefined, ios9Video || undefined);

      addHistory({
        themeName: folderNamePreview,
        price,
        name: themeName,
        type: themeType,
        fileSize: result.fileSize,
        hasData: false,
      });

      toast.success(`已下载: ${result.fileName}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "未知错误";
      toast.error("打包下载失败: " + msg);
    }
  }, [
    isComplete, gifResults, suitGifResults, firstFrameBlob, suitVideoResults,
    themeType, price, themeName, folderNamePreview, androidVideo, ios9Video,
  ]);

  // ===== 重置 =====
  const handleReset = useCallback(() => {
    setAndroidVideo(null);
    setIos9Video(null);
    setIos26Video(null);
    setGifResults({});
    setSuitGifResults({});
    setFirstFrameBlob(null);
    setSuitVideoResults({});
    setProcessingStatus(null);
    setIsComplete(false);
    setIsProcessing(false);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, oklch(0.975 0.003 60) 0%, oklch(0.96 0.005 55) 50%, oklch(0.97 0.004 65) 100%)" }}>
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 border-b" style={{ background: "oklch(0.995 0.002 60 / 0.88)", backdropFilter: "blur(12px)", borderColor: "oklch(0.90 0.006 60)" }}>
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="废柴家族" className="w-12 h-12 rounded-lg" />
            <h1 className="font-bold text-lg text-brand-charcoal tracking-tight">废柴家族</h1>
            <div className="h-5 w-px" style={{ background: "oklch(0.88 0.006 60)" }} />
            <nav className="flex items-center gap-1">
              <Link href="/">
                <Button variant="ghost" size="sm" className="font-semibold" style={{ color: "oklch(0.30 0.03 55)", background: "oklch(0.93 0.006 60)" }}>
                  常规制作
                </Button>
              </Link>
              <Link href="/magic-box">
                <Button variant="ghost" size="sm" className="text-brand-brown-light gap-1">
                  <Sparkles className="w-4 h-4" />
                  魔盒
                </Button>
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-brand-brown-light gap-1"
              onClick={() => setShowHistory(true)}
            >
              <History className="w-4 h-4" />
              历史
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-brand-brown-light gap-1"
              onClick={() => setShowSpecs(true)}
            >
              <FileText className="w-4 h-4" />
              成品规格
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Main Form */}
          <div className="lg:col-span-2 space-y-5">
            {/* Step 1: Theme Info */}
            <section className="rounded-2xl p-6" style={{ background: "oklch(0.995 0.002 60)", border: "1px solid oklch(0.92 0.005 60)", boxShadow: "0 1px 3px oklch(0.5 0.01 55 / 0.06)" }}>
              <h2 className="text-base font-semibold text-brand-charcoal mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "oklch(0.42 0.04 55)", color: "oklch(0.98 0.003 60)" }}>1</span>
                填写主题信息
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-brand-brown mb-1 block">价格（元）</label>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min={0}
                    placeholder="如: 3"
                    className="h-10"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-brand-brown mb-1 block">
                    主题名 <span style={{ color: "oklch(0.6 0.2 25)" }}>*</span>
                    <span className="text-xs text-brand-brown-light ml-1">（最多50字）</span>
                  </label>
                  <Input
                    value={themeName}
                    onChange={(e) => setThemeName(e.target.value.slice(0, 50))}
                    placeholder="如: 甜宝小猪软糯日常"
                    maxLength={50}
                    className="h-10"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="text-sm font-medium text-brand-brown mb-2 block">类型</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="themeType"
                      checked={themeType === "regular"}
                      onChange={() => setThemeType("regular")}
                      className="w-4 h-4"
                      style={{ accentColor: "oklch(0.50 0.08 55)" }}
                    />
                    <span className="text-sm text-brand-charcoal">常规</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="themeType"
                      checked={themeType === "suit"}
                      onChange={() => setThemeType("suit")}
                      className="w-4 h-4"
                      style={{ accentColor: "oklch(0.50 0.08 55)" }}
                    />
                    <span className="text-sm text-brand-charcoal">套装（含套装视频和套装动图）</span>
                  </label>
                </div>
              </div>

              {/* Folder name preview */}
              <div className="mt-4 rounded-lg px-4 py-3" style={{ background: "oklch(0.96 0.004 60)" }}>
                <p className="text-xs text-brand-brown-light mb-1">输出文件夹名预览：</p>
                <p className="text-sm font-mono font-semibold text-brand-brown">{folderNamePreview}.zip</p>
              </div>
            </section>

            {/* Step 2: Upload Videos */}
            <section className="rounded-2xl p-6" style={{ background: "oklch(0.995 0.002 60)", border: "1px solid oklch(0.92 0.005 60)", boxShadow: "0 1px 3px oklch(0.5 0.01 55 / 0.06)" }}>
              <h2 className="text-base font-semibold text-brand-charcoal mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "oklch(0.42 0.04 55)", color: "oklch(0.98 0.003 60)" }}>2</span>
                上传视频文件
              </h2>
              <p className="text-xs text-brand-brown-light mb-4">
                请同时上传三个平台的视频文件。安卓视频用于生成安卓动图和首帧PNG，iOS9键视频用于生成iOS 9键动图，iOS26键视频用于生成iOS 26键动图。
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <VideoUploader
                  label="安卓视频"
                  required
                  file={androidVideo}
                  onFileChange={setAndroidVideo}
                />
                <VideoUploader
                  label="iOS 9键视频"
                  required
                  file={ios9Video}
                  onFileChange={setIos9Video}
                />
                <VideoUploader
                  label="iOS 26键视频"
                  required
                  file={ios26Video}
                  onFileChange={setIos26Video}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <Button
                  className="flex-1 h-11 text-base font-semibold text-brand-charcoal"
                  onClick={startProcessing}
                  disabled={!canProcess || isProcessing}
                  style={{ background: "oklch(0.42 0.04 55)", color: "oklch(0.98 0.003 60)" }}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      处理中...
                    </>
                  ) : (
                    <>
                      <Package className="w-4 h-4 mr-2" />
                      开始处理
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={handleReset} disabled={isProcessing} className="border-brand-warm text-brand-brown">
                  重置
                </Button>
              </div>
            </section>

            {/* GIF Preview Panel */}
            {(Object.keys(gifResults).length > 0 || Object.keys(suitGifResults).length > 0) && (
              <section className="rounded-2xl p-6" style={{ background: "oklch(0.995 0.002 60)", border: "1px solid oklch(0.92 0.005 60)", boxShadow: "0 1px 3px oklch(0.5 0.01 55 / 0.06)" }}>
                <GifPreviewPanel
                  results={gifResults}
                  suitResults={suitGifResults}
                  onRegenerate={handleRegenerate}
                  isRegenerating={isRegenerating}
                  themeType={themeType}
                />
              </section>
            )}

            {/* Download Button */}
            {isComplete && (
              <section className="rounded-2xl p-6" style={{ background: "oklch(0.995 0.002 60)", border: "1px solid oklch(0.92 0.005 60)", boxShadow: "0 1px 3px oklch(0.5 0.01 55 / 0.06)" }}>
                <h3 className="text-base font-semibold text-brand-charcoal mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "oklch(0.75 0.15 145)", color: "white" }}>4</span>
                  打包下载
                </h3>
                <Button
                  className="w-full h-12 text-base font-semibold"
                  onClick={handleDownloadZip}
                  style={{ background: "oklch(0.55 0.12 145)", color: "white" }}
                >
                  <Download className="w-5 h-5 mr-2" />
                  下载 {folderNamePreview}.zip
                </Button>
              </section>
            )}
          </div>

          {/* Right Panel - Processing Status */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl p-6 sticky top-20" style={{ background: "oklch(0.995 0.002 60)", border: "1px solid oklch(0.92 0.005 60)", boxShadow: "0 1px 3px oklch(0.5 0.01 55 / 0.06)" }}>
              <h3 className="font-semibold text-brand-charcoal mb-4">处理进度</h3>

              {!processingStatus && !isComplete && (
                <div className="text-center py-8" style={{ color: "oklch(0.68 0.01 55)" }}>
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">等待开始处理</p>
                  <p className="text-xs mt-1">请填写信息并上传视频后点击"开始处理"</p>
                </div>
              )}

              {processingStatus && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1" style={{ color: "oklch(0.55 0.02 55)" }}>
                      <span>{processingStatus.step}</span>
                      <span>{processingStatus.percent}%</span>
                    </div>
                    <div className="rounded-full h-2.5 overflow-hidden" style={{ background: "oklch(0.93 0.005 60)" }}>
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${processingStatus.percent}%`,
                          background: processingStatus.isError
                            ? "oklch(0.58 0.24 27)"
                            : processingStatus.percent >= 100
                            ? "oklch(0.6 0.15 145)"
                            : "oklch(0.50 0.08 55)",
                        }}
                      />
                    </div>
                    <p className="text-xs mt-1" style={{ color: "oklch(0.58 0.02 55)" }}>{processingStatus.detail}</p>
                  </div>

                  {processingStatus.isError && (
                    <div className="flex items-center gap-2 rounded-lg p-3" style={{ background: "oklch(0.95 0.03 25)", color: "oklch(0.5 0.2 25)" }}>
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span className="text-xs">{processingStatus.detail}</span>
                    </div>
                  )}

                  {isComplete && (
                    <div className="flex items-center gap-2 rounded-lg p-3" style={{ background: "oklch(0.95 0.03 145)", color: "oklch(0.4 0.12 145)" }}>
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span className="text-xs">所有文件处理完成，可以预览和下载</span>
                    </div>
                  )}
                </div>
              )}

              {/* Processing Checklist */}
              {(isProcessing || isComplete) && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-xs font-medium uppercase" style={{ color: "oklch(0.58 0.02 55)" }}>处理清单</h4>
                  <ProcessingCheckItem label="安卓首帧 PNG" done={!!firstFrameBlob} active={processingStatus?.step === "安卓首帧"} />
                  <ProcessingCheckItem label="安卓动图 GIF" done={!!gifResults.android} active={processingStatus?.step === "安卓动图"} />
                  <ProcessingCheckItem label="iOS 9键动图 GIF" done={!!gifResults.ios9} active={processingStatus?.step === "iOS 9键动图"} />
                  <ProcessingCheckItem label="iOS 26键动图 GIF" done={!!gifResults.ios26} active={processingStatus?.step === "iOS 26键动图"} />
                  {themeType === "suit" && (
                    <>
                      <div className="my-2" style={{ borderTop: "1px solid oklch(0.92 0.005 60)" }} />
                      <ProcessingCheckItem label="安卓套装视频" done={!!suitVideoResults.android} active={processingStatus?.step === "安卓套装视频"} />
                      <ProcessingCheckItem label="iOS套装视频" done={!!suitVideoResults.ios9} active={processingStatus?.step === "iOS套装视频"} />
                      <ProcessingCheckItem label="安卓套装动图" done={!!suitGifResults.android} active={processingStatus?.step === "安卓套装动图"} />
                      <ProcessingCheckItem label="iOS 9键套装动图" done={!!suitGifResults.ios9} active={processingStatus?.step === "iOS 9键套装动图"} />
                      <ProcessingCheckItem label="iOS 26键套装动图" done={!!suitGifResults.ios26} active={processingStatus?.step === "iOS 26键套装动图"} />
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <HistoryDialog open={showHistory} onClose={() => setShowHistory(false)} />
      <SpecsDialog open={showSpecs} onClose={() => setShowSpecs(false)} />
    </div>
  );
}

function ProcessingCheckItem({
  label,
  done,
  active,
}: {
  label: string;
  done: boolean;
  active: boolean;
}) {
  return (
    <div
      className="flex items-center gap-2 text-xs py-1 px-2 rounded"
      style={active ? { background: "oklch(0.94 0.025 85)" } : {}}
    >
      {done ? (
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: "oklch(0.6 0.15 145)" }} />
      ) : active ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" style={{ color: "oklch(0.50 0.08 55)" }} />
      ) : (
        <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ border: "1.5px solid oklch(0.82 0.008 60)" }} />
      )}
      <span
        style={{
          color: done
            ? "oklch(0.45 0.1 145)"
            : active
            ? "oklch(0.42 0.04 55)"
            : "oklch(0.68 0.01 55)",
          fontWeight: active ? 500 : 400,
        }}
      >
        {label}
      </span>
    </div>
  );
}
