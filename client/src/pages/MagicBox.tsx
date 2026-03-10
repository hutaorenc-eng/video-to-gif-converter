/*
 * 魔盒模式页面 - 一次制作多套皮肤，打包下载更便捷
 * 品牌视觉：废柴家族 — 暖灰/奶白中性色调
 */

import { useState, useCallback, useMemo } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import {
  Sparkles,
  History,
  FileText,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Package,
  Download,
  RotateCcw,
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
  DEFAULT_PARAMS,
  type GifResult,
  type GifParams,
  type PlatformKey,
  type ConvertProgress,
} from "@/lib/gifEngine";
import { addHistory } from "@/lib/historyStore";
import { mergeGifs, type MergeProgress } from "@/lib/gifMerger";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663304533121/AHZh7dX9Bs3JsGaWxL2v4X/feicai-logo-head_0105bd84.png";

interface SkinEntry {
  id: string;
  name: string;
  androidVideo: File | null;
  ios9Video: File | null;
  ios26Video: File | null;
  collapsed: boolean;
}

interface SkinGifResults {
  android?: GifResult;
  ios9?: GifResult;
  ios26?: GifResult;
  firstFrame?: Blob | null;
}

interface ProcessingStatus {
  step: string;
  detail: string;
  percent: number;
  isError?: boolean;
}

let skinIdCounter = 0;
function nextSkinId() {
  skinIdCounter++;
  return `skin-${skinIdCounter}`;
}

function createEmptySkin(): SkinEntry {
  return {
    id: nextSkinId(),
    name: "",
    androidVideo: null,
    ios9Video: null,
    ios26Video: null,
    collapsed: false,
  };
}

export default function MagicBox() {
  const [price, setPrice] = useState("3");
  const [boxName, setBoxName] = useState("");
  const [skins, setSkins] = useState<SkinEntry[]>([createEmptySkin(), createEmptySkin()]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [allGifResults, setAllGifResults] = useState<Record<string, SkinGifResults>>({});
  const [isRegenerating, setIsRegenerating] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showSpecs, setShowSpecs] = useState(false);

  const zipNamePreview = useMemo(() => {
    if (!boxName.trim()) return "请输入魔盒名称";
    return `${price}元【${boxName}】`;
  }, [price, boxName]);

  const canProcess = useMemo(() => {
    if (!boxName.trim()) return false;
    if (skins.length === 0) return false;
    return skins.every(
      (s) => s.name.trim() && s.androidVideo && s.ios9Video && s.ios26Video
    );
  }, [boxName, skins]);

  const addSkin = useCallback(() => {
    setSkins((prev) => [...prev, createEmptySkin()]);
  }, []);

  const removeSkin = useCallback((id: string) => {
    setSkins((prev) => {
      if (prev.length <= 1) {
        toast.error("至少需要保留一套皮肤");
        return prev;
      }
      return prev.filter((s) => s.id !== id);
    });
  }, []);

  const toggleCollapse = useCallback((id: string) => {
    setSkins((prev) =>
      prev.map((s) => (s.id === id ? { ...s, collapsed: !s.collapsed } : s))
    );
  }, []);

  const updateSkin = useCallback(
    (id: string, updates: Partial<SkinEntry>) => {
      setSkins((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
      );
    },
    []
  );

  const startProcessing = useCallback(async () => {
    if (!canProcess) {
      toast.error("请完成所有必填项");
      return;
    }

    setIsProcessing(true);
    setIsComplete(false);
    setAllGifResults({});

    const newAllResults: Record<string, SkinGifResults> = {};
    const totalSkins = skins.length;
    const totalSteps = totalSkins * 4;
    let currentStep = 0;

    try {
      for (let si = 0; si < skins.length; si++) {
        const skin = skins[si];
        const skinLabel = `皮肤${si + 1}「${skin.name}」`;
        newAllResults[skin.id] = {};

        currentStep++;
        setProcessingStatus({
          step: `${skinLabel} - 安卓首帧`,
          detail: "提取安卓视频第一帧PNG...",
          percent: Math.floor((currentStep / totalSteps) * 100),
        });
        const firstFrame = await extractFirstFrame(skin.androidVideo!);
        newAllResults[skin.id].firstFrame = firstFrame;

        currentStep++;
        setProcessingStatus({
          step: `${skinLabel} - 安卓动图`,
          detail: "正在转换安卓GIF...",
          percent: Math.floor((currentStep / totalSteps) * 100),
        });
        const androidGif = await convertVideoToGif(
          skin.androidVideo!, "android", DEFAULT_PARAMS,
          (p: ConvertProgress) => {
            const stepBase = ((currentStep - 1) / totalSteps) * 100;
            const stepRange = (1 / totalSteps) * 100;
            setProcessingStatus({
              step: `${skinLabel} - 安卓动图`,
              detail: p.text,
              percent: Math.floor(stepBase + (p.percent / 100) * stepRange),
            });
          }
        );
        newAllResults[skin.id].android = androidGif;

        currentStep++;
        setProcessingStatus({
          step: `${skinLabel} - iOS 9键动图`,
          detail: "正在转换iOS 9键GIF...",
          percent: Math.floor((currentStep / totalSteps) * 100),
        });
        const ios9Gif = await convertVideoToGif(
          skin.ios9Video!, "ios9", DEFAULT_PARAMS,
          (p: ConvertProgress) => {
            const stepBase = ((currentStep - 1) / totalSteps) * 100;
            const stepRange = (1 / totalSteps) * 100;
            setProcessingStatus({
              step: `${skinLabel} - iOS 9键动图`,
              detail: p.text,
              percent: Math.floor(stepBase + (p.percent / 100) * stepRange),
            });
          }
        );
        newAllResults[skin.id].ios9 = ios9Gif;

        currentStep++;
        setProcessingStatus({
          step: `${skinLabel} - iOS 26键动图`,
          detail: "正在转换iOS 26键GIF...",
          percent: Math.floor((currentStep / totalSteps) * 100),
        });
        const ios26Gif = await convertVideoToGif(
          skin.ios26Video!, "ios26", DEFAULT_PARAMS,
          (p: ConvertProgress) => {
            const stepBase = ((currentStep - 1) / totalSteps) * 100;
            const stepRange = (1 / totalSteps) * 100;
            setProcessingStatus({
              step: `${skinLabel} - iOS 26键动图`,
              detail: p.text,
              percent: Math.floor(stepBase + (p.percent / 100) * stepRange),
            });
          }
        );
        newAllResults[skin.id].ios26 = ios26Gif;
        setAllGifResults({ ...newAllResults });
      }

      setProcessingStatus({ step: "完成", detail: "所有皮肤处理完成！", percent: 100 });
      setIsComplete(true);
      toast.success(`所有 ${totalSkins} 套皮肤处理完成！`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "未知错误";
      setProcessingStatus({ step: "错误", detail: msg, percent: 0, isError: true });
      toast.error("处理失败: " + msg);
    } finally {
      setIsProcessing(false);
    }
  }, [canProcess, skins]);

  const handleRegenerate = useCallback(
    async (platform: PlatformKey, params: GifParams, _isSuit: boolean, skinId?: string) => {
      if (!skinId) return;
      const skin = skins.find((s) => s.id === skinId);
      if (!skin) return;

      const key = `${skinId}-${platform}`;
      setIsRegenerating(key);

      const videoMap: Record<string, File | null> = {
        android: skin.androidVideo,
        ios9: skin.ios9Video,
        ios26: skin.ios26Video,
      };
      const videoFile = videoMap[platform];
      if (!videoFile) {
        toast.error("找不到对应的视频文件");
        setIsRegenerating(null);
        return;
      }

      try {
        const result = await convertVideoToGif(videoFile, platform, params, () => {});
        setAllGifResults((prev) => ({
          ...prev,
          [skinId]: { ...prev[skinId], [platform]: result },
        }));
        toast.success(`${platform} GIF 重新生成成功`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "未知错误";
        toast.error("重新生成失败: " + msg);
      } finally {
        setIsRegenerating(null);
      }
    },
    [skins]
  );

  const handleDownloadZip = useCallback(async () => {
    if (!isComplete) {
      toast.error("请先完成处理");
      return;
    }

    try {
      const zip = new JSZip();
      const rootName = `${price}元【${boxName}】`;

      const androidGifsForMerge: Blob[] = [];
      const ios9GifsForMerge: Blob[] = [];

      for (const skin of skins) {
        const skinResults = allGifResults[skin.id];
        if (!skinResults) continue;

        const skinFolder = zip.folder(`${rootName}/${skin.name}`)!;

        if (skin.androidVideo) skinFolder.file("安卓视频.mp4", skin.androidVideo);
        if (skin.ios9Video) skinFolder.file("iOS视频9.mp4", skin.ios9Video);
        if (skinResults.firstFrame) skinFolder.file("安卓首帧.png", skinResults.firstFrame);
        if (skinResults.android?.blob) {
          skinFolder.file("安卓9.gif", skinResults.android.blob);
          androidGifsForMerge.push(skinResults.android.blob);
        }
        if (skinResults.ios9?.blob) {
          skinFolder.file("iOS9.gif", skinResults.ios9.blob);
          ios9GifsForMerge.push(skinResults.ios9.blob);
        }
        if (skinResults.ios26?.blob) skinFolder.file("iOS26.gif", skinResults.ios26.blob);
      }

      if (androidGifsForMerge.length > 1) {
        try {
          toast.info("正在合并安卓四合一动图...");
          const mergedAndroidGif = await mergeGifs(androidGifsForMerge);
          zip.file("安卓四合一.gif", mergedAndroidGif);
        } catch (e) {
          console.warn("安卓四合一合并失败:", e);
          toast.error("安卓四合一合并失败，已跳过");
        }
      }

      if (ios9GifsForMerge.length > 1) {
        try {
          toast.info("正在合并iOS四合一动图...");
          const mergedIos9Gif = await mergeGifs(ios9GifsForMerge);
          zip.file("iOS四合一.gif", mergedIos9Gif);
        } catch (e) {
          console.warn("iOS四合一合并失败:", e);
          toast.error("iOS四合一合并失败，已跳过");
        }
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const fileName = `${rootName}.zip`;
      saveAs(zipBlob, fileName);

      const fileSize =
        zipBlob.size < 1024 * 1024
          ? `${(zipBlob.size / 1024).toFixed(1)} KB`
          : `${(zipBlob.size / 1024 / 1024).toFixed(2)} MB`;

      addHistory({
        themeName: rootName,
        price,
        name: boxName,
        type: "regular",
        fileSize,
        hasData: false,
      });

      toast.success(`已下载: ${fileName}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "未知错误";
      toast.error("打包下载失败: " + msg);
    }
  }, [isComplete, allGifResults, skins, price, boxName]);

  const handleReset = useCallback(() => {
    setSkins([createEmptySkin(), createEmptySkin()]);
    setAllGifResults({});
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
                <Button variant="ghost" size="sm" className="text-brand-brown-light">
                  常规制作
                </Button>
              </Link>
              <Button variant="ghost" size="sm" className="font-semibold gap-1" style={{ color: "oklch(0.30 0.03 55)", background: "oklch(0.93 0.006 60)" }}>
                <Sparkles className="w-4 h-4" />
                魔盒
              </Button>
            </nav>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="text-brand-brown-light gap-1" onClick={() => setShowHistory(true)}>
              <History className="w-4 h-4" />
              历史
            </Button>
            <Button variant="ghost" size="sm" className="text-brand-brown-light gap-1" onClick={() => setShowSpecs(true)}>
              <FileText className="w-4 h-4" />
              成品规格
            </Button>
          </div>
        </div>
      </header>

      {/* Title Section */}
      <div className="text-center py-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Package className="w-7 h-7 text-brand-brown" />
          <h2 className="text-2xl font-bold text-brand-charcoal">魔盒制作</h2>
        </div>
        <p className="text-brand-brown-light text-sm">一次制作多套皮肤，打包下载更便捷</p>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 pb-12 space-y-5">
        {/* 魔盒信息 */}
        <section className="rounded-2xl p-6" style={{ background: "oklch(0.995 0.002 60)", border: "1px solid oklch(0.92 0.005 60)", boxShadow: "0 1px 3px oklch(0.5 0.01 55 / 0.06)" }}>
          <h3 className="text-base font-semibold text-brand-charcoal mb-4">魔盒信息</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-brand-brown mb-1 block">价格</label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-9 h-9 p-0 border-brand-warm text-brand-brown"
                  onClick={() => setPrice((p) => String(Math.max(0, parseFloat(p || "0") - 1)))}
                >
                  -
                </Button>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min={0}
                  className="h-9 text-center w-24"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-9 h-9 p-0 border-brand-warm text-brand-brown"
                  onClick={() => setPrice((p) => String(parseFloat(p || "0") + 1))}
                >
                  +
                </Button>
                <span className="text-sm text-brand-brown-light">元</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-brand-brown mb-1 block">魔盒名称</label>
              <div className="relative">
                <Input
                  value={boxName}
                  onChange={(e) => setBoxName(e.target.value.slice(0, 50))}
                  placeholder="请输入魔盒名称（如：甜蜜糖果屋）"
                  maxLength={50}
                  className="h-9 pr-16"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-brand-brown-light">
                  {boxName.length} / 50
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3 rounded-lg px-4 py-2.5" style={{ background: "oklch(0.96 0.004 60)" }}>
            <p className="text-xs text-brand-brown-light">
              ZIP 文件名将显示为：
              <span className="font-mono font-semibold text-brand-brown">{zipNamePreview}.zip</span>
            </p>
          </div>
        </section>

        {/* 皮肤列表 */}
        <section className="rounded-2xl p-6" style={{ background: "oklch(0.995 0.002 60)", border: "1px solid oklch(0.92 0.005 60)", boxShadow: "0 1px 3px oklch(0.5 0.01 55 / 0.06)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-brand-charcoal">皮肤列表</h3>
            <span className="text-sm font-medium" style={{ color: "oklch(0.55 0.03 55)" }}>{skins.length} 套皮肤</span>
          </div>

          <div className="space-y-4">
            {skins.map((skin, index) => (
              <SkinCard
                key={skin.id}
                skin={skin}
                index={index}
                onUpdate={(updates) => updateSkin(skin.id, updates)}
                onRemove={() => removeSkin(skin.id)}
                onToggleCollapse={() => toggleCollapse(skin.id)}
                gifResults={allGifResults[skin.id]}
                onRegenerate={(platform, params) =>
                  handleRegenerate(platform, params, false, skin.id)
                }
                isRegenerating={isRegenerating}
                isComplete={isComplete}
              />
            ))}
          </div>

          <div className="mt-4 rounded-xl p-4 flex items-center justify-between" style={{ background: "oklch(0.96 0.004 60)" }}>
            <Button
              variant="outline"
              className="gap-1"
              onClick={addSkin}
              style={{ borderColor: "oklch(0.50 0.08 55)", color: "oklch(0.42 0.04 55)" }}
            >
              <Plus className="w-4 h-4" />
              添加皮肤
            </Button>
            <span className="text-sm" style={{ color: "oklch(0.55 0.03 55)" }}>当前 {skins.length} 套皮肤</span>
          </div>
        </section>

        {/* 操作按钮 */}
        <section className="rounded-2xl p-6" style={{ background: "oklch(0.995 0.002 60)", border: "1px solid oklch(0.92 0.005 60)", boxShadow: "0 1px 3px oklch(0.5 0.01 55 / 0.06)" }}>
          <div className="flex gap-3">
            <Button
              className="flex-1 h-11 text-base font-semibold"
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
            <Button variant="outline" onClick={handleReset} disabled={isProcessing} className="border-brand-warm text-brand-brown gap-1">
              <RotateCcw className="w-4 h-4" />
              重置
            </Button>
          </div>

          {processingStatus && (
            <div className="mt-4 space-y-3">
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
                  <span className="text-xs">所有皮肤处理完成，可以预览和下载</span>
                </div>
              )}
            </div>
          )}

          {!processingStatus && !isComplete && (
            <div className="mt-4 text-center py-4">
              <p className="text-sm" style={{ color: "oklch(0.58 0.02 55)" }}>
                {!boxName.trim()
                  ? "请输入魔盒名称"
                  : !canProcess
                  ? "请完成所有皮肤的名称和视频上传"
                  : "准备就绪，点击开始处理"}
              </p>
            </div>
          )}
        </section>

        {/* 下载按钮 */}
        {isComplete && (
          <section className="rounded-2xl p-6" style={{ background: "oklch(0.995 0.002 60)", border: "1px solid oklch(0.92 0.005 60)", boxShadow: "0 1px 3px oklch(0.5 0.01 55 / 0.06)" }}>
            <Button
              className="w-full h-12 text-base font-semibold"
              onClick={handleDownloadZip}
              style={{ background: "oklch(0.55 0.12 145)", color: "white" }}
            >
              <Download className="w-5 h-5 mr-2" />
              下载 {zipNamePreview}.zip
            </Button>
          </section>
        )}
      </main>

      {/* Dialogs */}
      <HistoryDialog open={showHistory} onClose={() => setShowHistory(false)} />
      <SpecsDialog open={showSpecs} onClose={() => setShowSpecs(false)} />
    </div>
  );
}

// ===== 皮肤卡片子组件 =====
function SkinCard({
  skin,
  index,
  onUpdate,
  onRemove,
  onToggleCollapse,
  gifResults,
  onRegenerate,
  isRegenerating,
  isComplete,
}: {
  skin: SkinEntry;
  index: number;
  onUpdate: (updates: Partial<SkinEntry>) => void;
  onRemove: () => void;
  onToggleCollapse: () => void;
  gifResults?: SkinGifResults;
  onRegenerate: (platform: PlatformKey, params: GifParams) => void;
  isRegenerating: string | null;
  isComplete: boolean;
}) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid oklch(0.92 0.005 60)" }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer transition-colors"
        style={{ background: "oklch(0.96 0.004 60)" }}
        onClick={onToggleCollapse}
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: "oklch(0.42 0.04 55)", color: "oklch(0.98 0.003 60)" }}>
            皮肤 {index + 1}
          </span>
          <span className="text-sm text-brand-brown-light">
            {skin.name || `皮肤 ${index + 1}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="text-xs px-2 py-1 rounded transition-colors"
            style={{ color: "oklch(0.55 0.18 25)" }}
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <Trash2 className="w-3.5 h-3.5 inline mr-1" />
            删除
          </button>
          {skin.collapsed ? (
            <ChevronDown className="w-4 h-4 text-brand-brown-light" />
          ) : (
            <ChevronUp className="w-4 h-4 text-brand-brown-light" />
          )}
        </div>
      </div>

      {/* Content */}
      {!skin.collapsed && (
        <div className="p-4 space-y-4" style={{ background: "oklch(0.995 0.002 60)" }}>
          <div>
            <label className="text-sm font-medium text-brand-brown mb-1 block">
              皮肤名称 <span style={{ color: "oklch(0.6 0.2 25)" }}>*</span>
            </label>
            <div className="relative">
              <Input
                value={skin.name}
                onChange={(e) => onUpdate({ name: e.target.value.slice(0, 50) })}
                placeholder="请输入皮肤名称（如：草莓甜心）"
                maxLength={50}
                className="h-9 pr-16"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-brand-brown-light">
                {skin.name.length} / 50
              </span>
            </div>
            <p className="text-xs text-brand-brown-light mt-1">将显示为 ZIP 内的文件夹名称</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-brand-brown">安卓视频</span>
                <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "oklch(0.95 0.004 60)", color: "oklch(0.55 0.02 55)" }}>474×370px</span>
              </div>
              <VideoUploader label="Android 视频" required file={skin.androidVideo} onFileChange={(f) => onUpdate({ androidVideo: f })} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-brand-brown">iOS 9键视频</span>
                <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "oklch(0.95 0.004 60)", color: "oklch(0.55 0.02 55)" }}>750×564px</span>
              </div>
              <VideoUploader label="iOS 9键视频" required file={skin.ios9Video} onFileChange={(f) => onUpdate({ ios9Video: f })} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-brand-brown">iOS 26键视频</span>
                <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "oklch(0.95 0.004 60)", color: "oklch(0.55 0.02 55)" }}>750×564px</span>
              </div>
              <VideoUploader label="iOS 26键视频" required file={skin.ios26Video} onFileChange={(f) => onUpdate({ ios26Video: f })} />
            </div>
          </div>

          {isComplete && gifResults && (gifResults.android || gifResults.ios9 || gifResults.ios26) && (
            <div className="pt-4" style={{ borderTop: "1px solid oklch(0.92 0.005 60)" }}>
              <h4 className="text-sm font-medium text-brand-brown mb-3">GIF 预览与调参</h4>
              <GifPreviewPanel
                results={{
                  android: gifResults.android,
                  ios9: gifResults.ios9,
                  ios26: gifResults.ios26,
                } as Record<string, GifResult>}
                suitResults={{}}
                onRegenerate={(platform, params) => onRegenerate(platform, params)}
                isRegenerating={isRegenerating}
                themeType="regular"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
