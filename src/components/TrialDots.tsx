"use client";

import type { GameMode, TrialData } from "@/lib/nback/types";

interface Props {
  mode: GameMode;
  trials: TrialData[];
  responses: Record<string, boolean>[];
  /** 現在の試行index（finishedならtrials.length） */
  currentIndex: number;
  n: number;
}

/**
 * セッションの進行バー兼・成績の記録。
 * 過去の試行: 全チャンネル正解=緑 / 1つでも誤り=赤 / 判定外(最初のN試行)=灰
 * 現在の試行: 琥珀 / 未来: 輪郭のみ
 */
export default function TrialDots({
  mode,
  trials,
  responses,
  currentIndex,
  n,
}: Props) {
  const judge = (i: number): "ok" | "ng" | "skip" => {
    if (i < n) return "skip";
    const allCorrect = mode.channels.every((ch) => {
      const match = trials[i].isMatch[ch.id];
      const pressedFlag = !!responses[i]?.[ch.id];
      return match === pressedFlag;
    });
    return allCorrect ? "ok" : "ng";
  };

  return (
    <div
      className="flex w-full max-w-[340px] flex-wrap gap-1.5"
      aria-label="試行の進行状況"
    >
      {trials.map((_, i) => {
        let cls = "border border-line bg-transparent"; // future
        if (i === currentIndex) cls = "bg-stim";
        else if (i < currentIndex) {
          const r = judge(i);
          cls =
            r === "ok"
              ? "bg-hit"
              : r === "ng"
                ? "bg-miss"
                : "bg-line";
        }
        return <span key={i} className={`h-2 w-2 rounded-full ${cls}`} />;
      })}
    </div>
  );
}
