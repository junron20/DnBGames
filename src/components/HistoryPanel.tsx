"use client";

import { useEffect, useState } from "react";
import { findMode } from "@/lib/nback/modes";
import { loadHistory } from "@/lib/nback/storage";
import type { SessionResult } from "@/lib/nback/types";

const pct = (v: number) => `${Math.round(v * 100)}%`;

const fmt = (iso: string) => {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export default function HistoryPanel() {
  const [history, setHistory] = useState<SessionResult[]>([]);

  useEffect(() => {
    setHistory(loadHistory().slice(0, 10));
  }, []);

  if (history.length === 0) {
    return (
      <p className="text-sm text-muted">
        まだ記録がありません。最初のセッションをプレイすると、ここに履歴が残ります。
      </p>
    );
  }

  return (
    <ul className="divide-y divide-line/60 rounded-2xl border border-line bg-surface">
      {history.map((h, i) => (
        <li key={i} className="flex items-center justify-between px-4 py-3 text-sm">
          <div>
            <p>{findMode(h.modeId)?.name ?? h.modeId}</p>
            <p className="text-xs text-muted">{fmt(h.date)}</p>
          </div>
          <p className="font-mono">
            <span className="text-muted">N={h.n}</span>{" "}
            <span className={h.overall >= 0.8 ? "text-hit" : "text-fg"}>
              {pct(h.overall)}
            </span>
          </p>
        </li>
      ))}
    </ul>
  );
}
