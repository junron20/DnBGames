"use client";

import Link from "next/link";
import type { GameMode, SessionResult } from "@/lib/nback/types";

interface Props {
  mode: GameMode;
  result: SessionResult;
  bestUpdated: boolean;
  onRetry: () => void;
}

const pct = (v: number) => `${Math.round(v * 100)}%`;

export default function ResultPanel({ mode, result, bestUpdated, onRetry }: Props) {
  return (
    <section className="w-full max-w-[420px] rounded-2xl border border-line bg-surface p-6">
      <p className="text-sm text-muted">セッション結果</p>
      <p className="mt-1 font-display text-4xl font-semibold">
        {pct(result.overall)}
        <span className="ml-2 align-middle font-mono text-base text-muted">
          N={result.n}
        </span>
      </p>

      {bestUpdated && (
        <p className="mt-2 inline-block rounded-full border border-hit/50 bg-hit/10 px-3 py-1 text-xs text-hit">
          自己ベスト更新
        </p>
      )}

      <table className="mt-4 w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-muted">
            <th className="py-1 font-normal">チャンネル</th>
            <th className="py-1 text-right font-normal">正答率</th>
            <th className="py-1 text-right font-normal">的中</th>
            <th className="py-1 text-right font-normal">見逃し</th>
            <th className="py-1 text-right font-normal">誤反応</th>
          </tr>
        </thead>
        <tbody>
          {mode.channels.map((ch) => {
            const s = result.perChannel[ch.id];
            return (
              <tr key={ch.id} className="border-t border-line/60">
                <td className="py-2">{ch.label}</td>
                <td className="py-2 text-right font-mono">{pct(s.accuracy)}</td>
                <td className="py-2 text-right font-mono text-hit">{s.hits}</td>
                <td className="py-2 text-right font-mono text-muted">{s.misses}</td>
                <td className="py-2 text-right font-mono text-miss">{s.falseAlarms}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {mode.adaptive && result.nextN !== undefined && (
        <p className="mt-4 rounded-lg border border-line bg-ink px-3 py-2 text-sm">
          {result.nextN > result.n && "好成績です。"}
          {result.nextN < result.n && "次は少し下げて続けましょう。"}
          次回は <span className="font-mono text-stim">N={result.nextN}</span>{" "}
          でプレイします
        </p>
      )}

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="flex-1 rounded-xl bg-stim px-4 py-3 font-medium text-ink transition-opacity hover:opacity-90"
        >
          もう一度プレイ
        </button>
        <Link
          href="/"
          className="flex-1 rounded-xl border border-line px-4 py-3 text-center font-medium text-fg transition-colors hover:border-stim/60"
        >
          モード選択へ
        </Link>
      </div>
    </section>
  );
}
