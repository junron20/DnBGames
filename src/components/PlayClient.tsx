"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import Grid from "@/components/Grid";
import CenterStimulus from "@/components/CenterStimulus";
import ResponseButtons from "@/components/ResponseButtons";
import TrialDots from "@/components/TrialDots";
import ResultPanel from "@/components/ResultPanel";
import { useNBackGame } from "@/hooks/useNBackGame";
import { loadLastN } from "@/lib/nback/storage";
import { findMode } from "@/lib/nback/modes";

const SPEEDS = [
  { label: "ゆっくり", ms: 3000 },
  { label: "標準", ms: 2500 },
  { label: "速い", ms: 2000 },
] as const;

export default function PlayClient({ modeId }: { modeId: string }) {
  const mode = findMode(modeId);
  if (!mode) notFound();

  const [n, setN] = useState(mode.defaultN);
  const [intervalMs, setIntervalMs] = useState<number>(2500);
  const { state, start, respond, reset } = useNBackGame(mode, intervalMs);

  // 前回のN（adaptiveモードは推奨N）を復元
  useEffect(() => {
    const last = loadLastN(mode.id);
    if (last !== null) setN(last);
  }, [mode.id]);

  // 結果確定後、adaptiveの推奨Nを次回設定に反映
  useEffect(() => {
    if (state.phase === "finished" && state.result?.nextN !== undefined) {
      setN(state.result.nextN);
    }
  }, [state.phase, state.result]);

  const trial = state.trials[state.index];
  const stimulusValues =
    state.phase === "running" && state.stimulusOn ? trial.values : null;

  const positionIndex =
    stimulusValues && mode.channels.some((c) => c.id === "position")
      ? Number(stimulusValues["position"])
      : null;

  const respondEnabled =
    state.phase === "running" && state.index >= state.n;

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center gap-5 px-4 py-8">
      <header className="flex w-full max-w-[420px] items-baseline justify-between">
        <div>
          <Link href="/" className="text-xs text-muted hover:text-fg">
            ← モード選択
          </Link>
          <h1 className="mt-1 font-display text-xl font-semibold">{mode.name}</h1>
        </div>
        <p className="font-mono text-3xl text-stim">
          N={state.phase === "idle" ? n : state.n}
        </p>
      </header>

      {/* ---- 設定（開始前） ---- */}
      {state.phase === "idle" && (
        <section className="w-full max-w-[420px] rounded-2xl border border-line bg-surface p-6">
          <p className="text-sm leading-relaxed text-muted">
            {n}回前の刺激と比べて、
            {mode.channels.map((c) => c.matchLabel).join("・")}
            と思ったらボタンまたはキーで応答します。全
            {mode.baseTrials + n}試行。
          </p>

          <div className="mt-5">
            <p className="text-xs text-muted">N（さかのぼる数）</p>
            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setN((v) => Math.max(1, v - 1))}
                className="h-10 w-10 rounded-lg border border-line text-lg hover:border-stim/60"
                aria-label="Nを下げる"
              >
                −
              </button>
              <span className="w-10 text-center font-mono text-2xl">{n}</span>
              <button
                type="button"
                onClick={() => setN((v) => Math.min(9, v + 1))}
                className="h-10 w-10 rounded-lg border border-line text-lg hover:border-stim/60"
                aria-label="Nを上げる"
              >
                ＋
              </button>
            </div>
          </div>

          <div className="mt-5">
            <p className="text-xs text-muted">提示間隔</p>
            <div className="mt-2 flex gap-2">
              {SPEEDS.map((s) => (
                <button
                  key={s.ms}
                  type="button"
                  onClick={() => setIntervalMs(s.ms)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
                    intervalMs === s.ms
                      ? "border-stim bg-stim/10 text-stim"
                      : "border-line text-muted hover:text-fg"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => start(n)}
            className="mt-6 w-full rounded-xl bg-stim px-4 py-3 font-medium text-ink transition-opacity hover:opacity-90"
          >
            開始
          </button>
        </section>
      )}

      {/* ---- カウントダウン ---- */}
      {state.phase === "countdown" && (
        <div className="flex aspect-square w-full max-w-[340px] items-center justify-center rounded-2xl border border-line bg-surface">
          <span className="font-mono text-7xl text-stim">{state.countdown}</span>
        </div>
      )}

      {/* ---- プレイ中 ---- */}
      {state.phase === "running" && (
        <>
          {mode.display === "grid" ? (
            <Grid
              activeIndex={positionIndex}
              colorId={stimulusValues?.["color"]}
            />
          ) : (
            <CenterStimulus mode={mode} values={stimulusValues} />
          )}

          <TrialDots
            mode={mode}
            trials={state.trials}
            responses={state.responses}
            currentIndex={state.index}
            n={state.n}
          />

          <ResponseButtons
            mode={mode}
            feedback={state.feedback}
            pressed={state.responses[state.index] ?? {}}
            enabled={respondEnabled}
            onRespond={respond}
          />

          <p className="text-xs text-muted">
            {state.index < state.n
              ? `あと${state.n - state.index}回は記憶するだけ（応答不要）`
              : `試行 ${state.index + 1} / ${state.trials.length}`}
          </p>
        </>
      )}

      {/* ---- 結果 ---- */}
      {state.phase === "finished" && state.result && (
        <>
          <TrialDots
            mode={mode}
            trials={state.trials}
            responses={state.responses}
            currentIndex={state.trials.length}
            n={state.n}
          />
          <ResultPanel
            mode={mode}
            result={state.result}
            bestUpdated={state.bestUpdated}
            onRetry={() => {
              reset();
            }}
          />
        </>
      )}
    </main>
  );
}
