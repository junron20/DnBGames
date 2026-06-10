"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadBest, type BestRecord } from "@/lib/nback/storage";
import { findMode } from "@/lib/nback/modes";

export default function ModeCard({ modeId }: { modeId: string }) {
  const mode = findMode(modeId);
  const [best, setBest] = useState<BestRecord | null>(null);

  useEffect(() => {
    if (mode) setBest(loadBest(mode.id));
  }, [mode]);

  if (!mode) return null;

  return (
    <Link
      href={`/play/${mode.id}`}
      className="group flex flex-col rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-stim/60"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-base font-semibold leading-snug">
          {mode.name}
        </h3>
        {best && (
          <span className="shrink-0 rounded-full border border-line bg-ink px-2 py-0.5 font-mono text-xs text-stim">
            BEST N={best.n} / {Math.round(best.overall * 100)}%
          </span>
        )}
      </div>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
        {mode.tagline}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {mode.channels.map((ch) => (
          <span
            key={ch.id}
            className="rounded-md border border-line px-2 py-0.5 text-xs text-muted"
          >
            {ch.label}
            <kbd className="ml-1 font-mono uppercase">{ch.key}</kbd>
          </span>
        ))}
        {mode.adaptive && (
          <span className="rounded-md border border-stim/40 bg-stim/10 px-2 py-0.5 text-xs text-stim">
            自動調整
          </span>
        )}
      </div>
    </Link>
  );
}
