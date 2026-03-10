/*
 * 历史记录管理 - 基于localStorage的处理历史存储
 */

export interface HistoryRecord {
  id: string;
  themeName: string;      // 主题包名，如 "3元【冬日】"
  price: string;
  name: string;
  type: "regular" | "suit";
  completedAt: string;    // ISO日期字符串
  fileSize: string;       // 如 "11.38 MB"
  status: "completed" | "expired";
  // 存储GIF和视频的base64数据（用于重新下载）
  hasData: boolean;
}

const STORAGE_KEY = "gif-tool-history";
const MAX_RECORDS = 200;
const EXPIRE_DAYS = 7; // 7天后过期

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function getHistory(): HistoryRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const records: HistoryRecord[] = JSON.parse(data);
    // 检查过期
    const now = Date.now();
    return records.map((r) => {
      const completedTime = new Date(r.completedAt).getTime();
      const daysPassed = (now - completedTime) / (1000 * 60 * 60 * 24);
      if (daysPassed > EXPIRE_DAYS && r.status === "completed") {
        return { ...r, status: "expired" as const };
      }
      return r;
    });
  } catch {
    return [];
  }
}

export function addHistory(record: Omit<HistoryRecord, "id" | "completedAt" | "status">): HistoryRecord {
  const newRecord: HistoryRecord = {
    ...record,
    id: generateId(),
    completedAt: new Date().toISOString(),
    status: "completed",
  };

  const records = getHistory();
  records.unshift(newRecord);

  // 限制最大记录数
  if (records.length > MAX_RECORDS) {
    records.splice(MAX_RECORDS);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  return newRecord;
}

export function searchHistory(keyword: string): HistoryRecord[] {
  const records = getHistory();
  if (!keyword.trim()) return records;
  const kw = keyword.trim().toLowerCase();
  return records.filter((r) => r.themeName.toLowerCase().includes(kw));
}

export function getHistoryStats() {
  const records = getHistory();
  const total = records.length;
  const completed = records.filter((r) => r.status === "completed").length;
  const expired = records.filter((r) => r.status === "expired").length;
  return { total, completed, failed: 0, expired };
}

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
}

export function formatDate(isoString: string): string {
  const d = new Date(isoString);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}/${m}/${day} ${h}:${min}`;
}
