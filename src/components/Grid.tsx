"use client";

import { colorHex } from "@/lib/nback/channels";

interface Props {
  /** 点灯セル 0..8（nullなら全消灯） */
  activeIndex: number | null;
  /** 色チャンネルの値（Tripleモード用）。なければ既定の琥珀 */
  colorId?: string;
}

export default function Grid({ activeIndex, colorId }: Props) {
  const hex = colorId ? colorHex(colorId) : "#FFB454";
  return (
    <div
      className="grid aspect-square w-full max-w-[340px] grid-cols-3 gap-2 rounded-2xl border border-line bg-surface p-3"
      role="img"
      aria-label="刺激グリッド"
    >
      {Array.from({ length: 9 }, (_, i) => {
        const on = i === activeIndex;
        return (
          <div
            key={i}
            className={`rounded-lg border transition-colors duration-100 ${
              on ? "animate-stimpulse border-transparent" : "border-line/60 bg-ink"
            }`}
            style={
              on
                ? { backgroundColor: hex, boxShadow: `0 0 24px 4px ${hex}55` }
                : undefined
            }
          />
        );
      })}
    </div>
  );
}
