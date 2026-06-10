"use client";

import { colorHex, stroopInkOf, stroopWordOf, STROOP_WORDS } from "@/lib/nback/channels";
import type { GameMode } from "@/lib/nback/types";

interface Props {
  mode: GameMode;
  /** channelId -> 刺激値（非表示中はnull） */
  values: Record<string, string> | null;
}

/** グリッドを使わないモード（数字・図形・色文字・音のみ）の中央表示 */
export default function CenterStimulus({ mode, values }: Props) {
  const has = (id: string) => mode.channels.some((c) => c.id === id);

  let content: React.ReactNode = null;
  if (values) {
    if (has("number")) {
      content = (
        <span className="font-mono text-8xl font-semibold text-stim">
          {values["number"]}
        </span>
      );
    } else if (has("shape")) {
      content = <span className="text-8xl text-stim">{values["shape"]}</span>;
    } else if (has("word")) {
      const v = values["word"];
      const text =
        STROOP_WORDS.find((w) => w.id === stroopWordOf(v))?.text ?? "";
      content = (
        <span
          className="text-7xl font-bold tracking-wider"
          style={{ color: colorHex(stroopInkOf(v)) }}
        >
          {text}
        </span>
      );
    } else if (has("audio")) {
      // 音のみのモード: 文字は見せず、提示タイミングだけ可視化する
      content = (
        <span className="animate-stimpulse text-7xl text-stim" aria-hidden>
          ♪
        </span>
      );
    }
  }

  return (
    <div
      className="flex aspect-square w-full max-w-[340px] items-center justify-center rounded-2xl border border-line bg-surface"
      role="img"
      aria-label="刺激表示"
    >
      {content}
    </div>
  );
}
