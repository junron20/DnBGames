import type { SessionResult } from "./types";

const HISTORY_KEY = "dnb:history";
const BEST_PREFIX = "dnb:best:"; // + modeId
const LASTN_PREFIX = "dnb:lastN:"; // + modeId
const HISTORY_LIMIT = 50;

const canUseStorage = () => typeof window !== "undefined";

function readJson<T>(key: string): T | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 容量超過などは黙って無視（ゲーム進行を止めない）
  }
}

export interface BestRecord {
  n: number;
  overall: number;
  date: string;
}

export function loadHistory(): SessionResult[] {
  return readJson<SessionResult[]>(HISTORY_KEY) ?? [];
}

export function loadBest(modeId: string): BestRecord | null {
  return readJson<BestRecord>(BEST_PREFIX + modeId);
}

export function loadLastN(modeId: string): number | null {
  const v = readJson<number>(LASTN_PREFIX + modeId);
  return typeof v === "number" && v >= 1 && v <= 9 ? v : null;
}

/**
 * セッション結果を保存する。
 *  - 履歴の先頭に追加（上限あり）
 *  - 最高記録の更新（N優先、同Nなら正答率で比較）
 *  - 次回のN（adaptiveなら推奨N、それ以外は今回のN）を記憶
 */
export function saveSession(result: SessionResult): { bestUpdated: boolean } {
  const history = loadHistory();
  history.unshift(result);
  writeJson(HISTORY_KEY, history.slice(0, HISTORY_LIMIT));

  writeJson(LASTN_PREFIX + result.modeId, result.nextN ?? result.n);

  const best = loadBest(result.modeId);
  const better =
    !best ||
    result.n > best.n ||
    (result.n === best.n && result.overall > best.overall);

  if (better) {
    writeJson(BEST_PREFIX + result.modeId, {
      n: result.n,
      overall: result.overall,
      date: result.date,
    } satisfies BestRecord);
  }
  return { bestUpdated: better };
}
