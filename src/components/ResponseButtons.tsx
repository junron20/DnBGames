"use client";

import type { Feedback } from "@/hooks/useNBackGame";
import type { GameMode } from "@/lib/nback/types";

interface Props {
  mode: GameMode;
  feedback: Record<string, Feedback | undefined>;
  pressed: Record<string, boolean>;
  /** 応答受付中か（最初のN試行や非running中はfalse） */
  enabled: boolean;
  onRespond: (channelId: string) => void;
}

export default function ResponseButtons({
  mode,
  feedback,
  pressed,
  enabled,
  onRespond,
}: Props) {
  return (
    <div className="flex w-full max-w-[340px] gap-2">
      {mode.channels.map((ch) => {
        const fb = feedback[ch.id];
        const done = !!pressed[ch.id];
        const tone =
          fb === "hit"
            ? "border-hit bg-hit/15 text-hit"
            : fb === "fa"
              ? "border-miss bg-miss/15 text-miss"
              : done
                ? "border-line bg-raised text-muted"
                : "border-line bg-surface text-fg hover:border-stim/60";
        return (
          <button
            key={ch.id}
            type="button"
            disabled={!enabled || done}
            onClick={() => onRespond(ch.id)}
            className={`flex-1 rounded-xl border px-3 py-4 text-sm font-medium transition-colors disabled:cursor-default ${tone}`}
          >
            <span className="block">{ch.matchLabel}</span>
            <kbd className="mt-1 inline-block rounded border border-line bg-ink px-2 py-0.5 font-mono text-xs uppercase text-muted">
              {ch.key}
            </kbd>
          </button>
        );
      })}
    </div>
  );
}
