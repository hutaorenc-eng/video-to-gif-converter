/*
 * GIF预览和参数调节面板
 * 品牌视觉：废柴家族 — 暖灰/奶白中性色调
 * 标题右侧有统一调参按钮（调整全部），每个卡片也有独立调参按钮
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Settings2, ChevronDown, ChevronUp, Minus, Plus, SlidersHorizontal } from "lucide-react";
import type { GifResult, GifParams, PlatformKey } from "@/lib/gifEngine";

interface GifPreviewPanelProps {
  results: Record<string, GifResult>;
  suitResults?: Record<string, GifResult>;
  onRegenerate: (platform: PlatformKey, params: GifParams, isSuit: boolean) => void;
  isRegenerating: string | null;
  themeType: "regular" | "suit";
}

const PLATFORM_LABELS: Record<string, string> = {
  android: "安卓动图",
  ios9: "iOS 9键动图",
  ios26: "iOS 26键动图",
};

const SUIT_LABELS: Record<string, string> = {
  android: "安卓套装动图",
  ios9: "iOS 9键套装动图",
  ios26: "iOS 26键套装动图",
};

/* ========== 单个参数行组件 ========== */
function ParamRow({
  label,
  value,
  unit,
  hint,
  step,
  min,
  max,
  decimals,
  onChange,
}: {
  label: string;
  value: number;
  unit: string;
  hint: string;
  step: number;
  min: number;
  max: number;
  decimals: number;
  onChange: (v: number) => void;
}) {
  const decrease = () => {
    const next = Math.max(min, parseFloat((value - step).toFixed(decimals)));
    onChange(next);
  };
  const increase = () => {
    const next = Math.min(max, parseFloat((value + step).toFixed(decimals)));
    onChange(next);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium" style={{ color: "oklch(0.38 0.02 55)" }}>{label}</span>
        <span className="text-xs" style={{ color: "oklch(0.60 0.015 55)" }}>{hint}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={decrease}
          disabled={value <= min}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30"
          style={{ background: "oklch(0.92 0.005 60)", color: "oklch(0.45 0.02 55)" }}
        >
          <Minus className="w-4 h-4" />
        </button>
        <div
          className="flex-1 h-8 rounded-lg flex items-center justify-center text-sm font-semibold tabular-nums"
          style={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.90 0.006 60)", color: "oklch(0.30 0.02 55)" }}
        >
          {value.toFixed(decimals)} <span className="ml-1 font-normal text-xs" style={{ color: "oklch(0.60 0.015 55)" }}>{unit}</span>
        </div>
        <button
          onClick={increase}
          disabled={value >= max}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30"
          style={{ background: "oklch(0.92 0.005 60)", color: "oklch(0.45 0.02 55)" }}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="relative h-1.5 rounded-full" style={{ background: "oklch(0.92 0.005 60)" }}>
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all"
          style={{
            width: `${((value - min) / (max - min)) * 100}%`,
            background: "oklch(0.50 0.04 55)",
          }}
        />
      </div>
    </div>
  );
}

/* ========== 参数编辑器（复用于单个卡片和统一面板） ========== */
function ParamEditor({
  params,
  onChange,
  onApply,
  isLoading,
  buttonText,
}: {
  params: GifParams;
  onChange: (p: GifParams) => void;
  onApply: () => void;
  isLoading: boolean;
  buttonText?: string;
}) {
  return (
    <div className="rounded-xl p-4 space-y-4" style={{ background: "oklch(0.975 0.003 60)", border: "1px solid oklch(0.92 0.005 60)" }}>
      <ParamRow
        label="帧率"
        value={params.fps}
        unit="秒/帧"
        hint="提取帧的时间间隔"
        step={0.01}
        min={0.05}
        max={1}
        decimals={2}
        onChange={(v) => onChange({ ...params, fps: v })}
      />
      <ParamRow
        label="抽帧间隔"
        value={params.frameSkip}
        unit="帧"
        hint="1=不跳帧 2=隔1抽1"
        step={1}
        min={1}
        max={10}
        decimals={0}
        onChange={(v) => onChange({ ...params, frameSkip: v })}
      />
      <ParamRow
        label="播放速度"
        value={params.playbackSpeed}
        unit="x"
        hint="0.5慢放 1.0正常 2.0快放"
        step={0.1}
        min={0.1}
        max={5}
        decimals={1}
        onChange={(v) => onChange({ ...params, playbackSpeed: v })}
      />
      <Button
        size="sm"
        className="w-full mt-1 h-8 text-xs font-medium"
        onClick={onApply}
        disabled={isLoading}
        style={{ background: "oklch(0.42 0.04 55)", color: "oklch(0.98 0.003 60)" }}
      >
        {isLoading ? (
          <RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" />
        ) : (
          <RefreshCw className="w-3.5 h-3.5 mr-1" />
        )}
        {buttonText || "重新生成"}
      </Button>
    </div>
  );
}

/* ========== 单个GIF预览卡片 ========== */
function SingleGifPreview({
  label,
  result,
  platformKey,
  isSuit,
  onRegenerate,
  isRegenerating,
}: {
  label: string;
  result: GifResult;
  platformKey: PlatformKey;
  isSuit: boolean;
  onRegenerate: (platform: PlatformKey, params: GifParams, isSuit: boolean) => void;
  isRegenerating: boolean;
}) {
  const [showParams, setShowParams] = useState(false);
  const [editParams, setEditParams] = useState<GifParams>({ ...result.params });

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid oklch(0.92 0.005 60)", background: "oklch(0.995 0.002 60)" }}>
      {/* 标题栏 */}
      <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: "oklch(0.96 0.004 60)" }}>
        <h4 className="font-medium text-sm text-brand-brown">{label}</h4>
        <button
          className="text-xs flex items-center gap-1 px-2 py-1 rounded-md transition-colors hover:opacity-80"
          style={{ color: "oklch(0.50 0.03 55)", background: showParams ? "oklch(0.92 0.005 60)" : "transparent" }}
          onClick={() => setShowParams(!showParams)}
        >
          <Settings2 className="w-3.5 h-3.5" />
          调参
          {showParams ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* GIF预览 */}
      <div className="p-3 flex justify-center" style={{ background: "oklch(0.97 0.003 60)" }}>
        <img
          src={result.url}
          alt={label}
          className="max-w-full rounded shadow-sm"
          style={{ maxHeight: "200px", objectFit: "contain" }}
        />
      </div>

      {/* 信息栏 */}
      <div className="px-4 py-2.5 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs" style={{ background: "oklch(0.96 0.004 60)", color: "oklch(0.45 0.02 55)" }}>
          尺寸 <strong className="font-semibold" style={{ color: "oklch(0.30 0.02 55)" }}>{result.width}x{result.height}</strong>
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs" style={{ background: "oklch(0.96 0.004 60)", color: "oklch(0.45 0.02 55)" }}>
          大小 <strong className="font-semibold" style={{ color: "oklch(0.30 0.02 55)" }}>{result.fileSize}</strong>
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs" style={{ background: "oklch(0.96 0.004 60)", color: "oklch(0.45 0.02 55)" }}>
          帧率 <strong className="font-semibold" style={{ color: "oklch(0.30 0.02 55)" }}>{result.params.fps}s</strong>
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs" style={{ background: "oklch(0.96 0.004 60)", color: "oklch(0.45 0.02 55)" }}>
          速度 <strong className="font-semibold" style={{ color: "oklch(0.30 0.02 55)" }}>{result.params.playbackSpeed}x</strong>
        </span>
      </div>

      {/* 参数调节面板 */}
      {showParams && (
        <div className="px-4 pb-4">
          <ParamEditor
            params={editParams}
            onChange={setEditParams}
            onApply={() => onRegenerate(platformKey, editParams, isSuit)}
            isLoading={isRegenerating}
          />
        </div>
      )}
    </div>
  );
}

/* ========== 主面板 ========== */
export default function GifPreviewPanel({
  results,
  suitResults,
  onRegenerate,
  isRegenerating,
  themeType,
}: GifPreviewPanelProps) {
  const hasResults = Object.keys(results).length > 0;
  const hasSuitResults = suitResults && Object.keys(suitResults).length > 0;

  if (!hasResults && !hasSuitResults) return null;

  // 统一调参状态
  const firstResult = Object.values(results)[0];
  const [showGlobalParams, setShowGlobalParams] = useState(false);
  const [globalParams, setGlobalParams] = useState<GifParams>(
    firstResult ? { ...firstResult.params } : { fps: 0.17, frameSkip: 2, playbackSpeed: 1.4 }
  );

  const handleApplyAll = () => {
    for (const key of Object.keys(results)) {
      onRegenerate(key as PlatformKey, globalParams, false);
    }
    if (themeType === "suit" && suitResults) {
      for (const key of Object.keys(suitResults)) {
        onRegenerate(key as PlatformKey, globalParams, true);
      }
    }
  };

  return (
    <div className="space-y-4">
      {hasResults && (
        <div>
          {/* 标题行：左侧标题 + 右侧统一调参按钮 */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-brand-charcoal flex items-center gap-2">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "oklch(0.42 0.04 55)", color: "oklch(0.98 0.003 60)" }}>3</span>
              GIF 预览与参数调节
            </h3>
            <button
              className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
              style={{
                color: showGlobalParams ? "oklch(0.98 0.003 60)" : "oklch(0.45 0.02 55)",
                background: showGlobalParams ? "oklch(0.42 0.04 55)" : "oklch(0.96 0.004 60)",
                border: "1px solid oklch(0.90 0.006 60)",
              }}
              onClick={() => setShowGlobalParams(!showGlobalParams)}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              统一调参
              {showGlobalParams ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {/* 统一参数调节面板 */}
          {showGlobalParams && (
            <div className="mb-4">
              <ParamEditor
                params={globalParams}
                onChange={setGlobalParams}
                onApply={handleApplyAll}
                isLoading={isRegenerating !== null}
                buttonText="全部重新生成"
              />
            </div>
          )}

          {/* 预览卡片网格 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(Object.entries(results) as [PlatformKey, GifResult][]).map(([key, result]) => (
              <SingleGifPreview
                key={key}
                label={PLATFORM_LABELS[key] || key}
                result={result}
                platformKey={key as PlatformKey}
                isSuit={false}
                onRegenerate={onRegenerate}
                isRegenerating={isRegenerating === key}
              />
            ))}
          </div>
        </div>
      )}

      {themeType === "suit" && hasSuitResults && (
        <div>
          <h3 className="text-base font-semibold text-brand-charcoal mb-3">套装 GIF 预览</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(Object.entries(suitResults!) as [PlatformKey, GifResult][]).map(([key, result]) => (
              <SingleGifPreview
                key={`suit-${key}`}
                label={SUIT_LABELS[key] || key}
                result={result}
                platformKey={key as PlatformKey}
                isSuit={true}
                onRegenerate={onRegenerate}
                isRegenerating={isRegenerating === `suit-${key}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
