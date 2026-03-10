/*
 * 历史记录弹窗 - 展示处理历史，支持搜索、分页、状态管理
 * 品牌视觉：废柴家族 — 暖灰/奶白中性色调
 */

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import {
  getHistory,
  searchHistory,
  getHistoryStats,
  formatDate,
  type HistoryRecord,
} from "@/lib/historyStore";

interface HistoryDialogProps {
  open: boolean;
  onClose: () => void;
}

const PAGE_SIZE = 15;

export default function HistoryDialog({ open, onClose }: HistoryDialogProps) {
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const records = useMemo(() => {
    void refreshKey;
    return keyword ? searchHistory(keyword) : getHistory();
  }, [keyword, refreshKey]);

  const stats = useMemo(() => {
    void refreshKey;
    return getHistoryStats();
  }, [refreshKey]);

  const totalPages = Math.max(1, Math.ceil(records.length / PAGE_SIZE));
  const paginatedRecords = records.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleSearch = () => {
    setCurrentPage(1);
    setRefreshKey((k) => k + 1);
  };

  const handleRefresh = () => {
    setKeyword("");
    setCurrentPage(1);
    setRefreshKey((k) => k + 1);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto" style={{ background: "oklch(0.985 0.003 60)" }}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-brand-charcoal">处理历史</DialogTitle>
        </DialogHeader>

        {/* Search Bar */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Input
              placeholder="搜索主题名称"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pr-10"
            />
          </div>
          <Button variant="outline" size="sm" onClick={handleSearch} className="border-brand-warm text-brand-brown gap-1">
            <Search className="w-4 h-4" />
            搜索
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} className="border-brand-warm text-brand-brown gap-1">
            <RefreshCw className="w-4 h-4" />
            刷新
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg" style={{ border: "1px solid oklch(0.92 0.005 60)" }}>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ background: "oklch(0.96 0.004 60)" }}>
                <th className="px-3 py-2.5 text-left font-semibold text-brand-brown" style={{ borderBottom: "1px solid oklch(0.90 0.006 60)" }}>主题包名</th>
                <th className="px-3 py-2.5 text-left font-semibold text-brand-brown w-40" style={{ borderBottom: "1px solid oklch(0.90 0.006 60)" }}>完成时间</th>
                <th className="px-3 py-2.5 text-left font-semibold text-brand-brown w-24" style={{ borderBottom: "1px solid oklch(0.90 0.006 60)" }}>文件大小</th>
                <th className="px-3 py-2.5 text-left font-semibold text-brand-brown w-20" style={{ borderBottom: "1px solid oklch(0.90 0.006 60)" }}>状态</th>
                <th className="px-3 py-2.5 text-left font-semibold text-brand-brown w-24" style={{ borderBottom: "1px solid oklch(0.90 0.006 60)" }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-brand-brown-light">
                    暂无处理记录
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((record: HistoryRecord, idx: number) => (
                  <tr key={record.id} style={{ background: idx % 2 === 0 ? "oklch(0.995 0.002 60)" : "oklch(0.985 0.003 60)" }}>
                    <td className="px-3 py-2 text-brand-charcoal" style={{ borderBottom: "1px solid oklch(0.93 0.005 60)" }}>{record.themeName}</td>
                    <td className="px-3 py-2 text-brand-brown-light" style={{ borderBottom: "1px solid oklch(0.93 0.005 60)" }}>{formatDate(record.completedAt)}</td>
                    <td className="px-3 py-2 text-brand-brown-light" style={{ borderBottom: "1px solid oklch(0.93 0.005 60)" }}>{record.fileSize}</td>
                    <td className="px-3 py-2" style={{ borderBottom: "1px solid oklch(0.93 0.005 60)" }}>
                      <span
                        className="inline-block px-2 py-0.5 rounded text-xs font-medium"
                        style={
                          record.status === "completed"
                            ? { background: "oklch(0.92 0.04 145)", color: "oklch(0.4 0.12 145)" }
                            : { background: "oklch(0.95 0.004 60)", color: "oklch(0.55 0.02 55)" }
                        }
                      >
                        {record.status === "completed" ? "已完成" : "已过期"}
                      </span>
                    </td>
                    <td className="px-3 py-2" style={{ borderBottom: "1px solid oklch(0.93 0.005 60)" }}>
                      {record.status === "completed" ? (
                        <span className="text-brand-brown-light text-xs">浏览器端无法重新下载</span>
                      ) : (
                        <span className="text-brand-brown-light text-xs">不可下载</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 text-sm text-brand-brown-light">
          <span>共 {records.length} 条</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 border-brand-warm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setCurrentPage(page)}
                style={
                  page === currentPage
                    ? { background: "oklch(0.42 0.04 55)", color: "oklch(0.98 0.003 60)" }
                    : { borderColor: "oklch(0.90 0.006 60)" }
                }
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 border-brand-warm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mt-3 text-sm pt-3" style={{ borderTop: "1px solid oklch(0.92 0.005 60)" }}>
          <span className="text-brand-brown-light">总计: <strong className="text-brand-charcoal">{stats.total}</strong></span>
          <span className="text-brand-brown-light">成功: <strong style={{ color: "oklch(0.45 0.12 145)" }}>{stats.completed}</strong></span>
          <span className="text-brand-brown-light">失败: <strong style={{ color: "oklch(0.55 0.2 25)" }}>{stats.failed}</strong></span>
          <span className="text-brand-brown-light">过期: <strong style={{ color: "oklch(0.55 0.02 55)" }}>{stats.expired}</strong></span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
