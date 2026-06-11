"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import type { GameMode, SessionResult, TrialData } from "@/lib/nback/types";
import { generateTrials } from "@/lib/nback/sequence";
import { scoreSession } from "@/lib/nback/scoring";
import { saveSession } from "@/lib/nback/storage";
import { cancelSpeech, speak, unlockSpeech } from "@/lib/nback/speech";

export type Phase = "idle" | "countdown" | "running" | "finished";
export type Feedback = "hit" | "fa";

interface GameState {
  phase: Phase;
  countdown: number;
  n: number;
  trials: TrialData[];
  index: number;
  stimulusOn: boolean;
  /** [trialIndex] -> channelId -> 押したか */
  responses: Record<string, boolean>[];
  /** 現在試行のボタン即時フィードバック */
  feedback: Record<string, Feedback | undefined>;
  result: SessionResult | null;
  bestUpdated: boolean;
}

type Action =
  | { type: "START"; trials: TrialData[]; n: number }
  | { type: "COUNTDOWN" }
  | { type: "BEGIN" }
  | { type: "HIDE_STIMULUS" }
  | { type: "RESPOND"; channelId: string }
  | { type: "ADVANCE"; mode: GameMode }
  | { type: "MARK_SAVED"; bestUpdated: boolean }
  | { type: "RESET" };

const initialState: GameState = {
  phase: "idle",
  countdown: 3,
  n: 2,
  trials: [],
  index: 0,
  stimulusOn: false,
  responses: [],
  feedback: {},
  result: null,
  bestUpdated: false,
};

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "START":
      return {
        ...initialState,
        n: action.n,
        trials: action.trials,
        responses: action.trials.map(() => ({})),
        phase: "countdown",
        countdown: 3,
      };

    case "COUNTDOWN":
      return { ...state, countdown: state.countdown - 1 };

    case "BEGIN":
      return { ...state, phase: "running", index: 0, stimulusOn: true, feedback: {} };

    case "HIDE_STIMULUS":
      return { ...state, stimulusOn: false };

    case "RESPOND": {
      if (state.phase !== "running") return state;
      // 最初のN試行は比較相手がないため応答を受け付けない
      if (state.index < state.n) return state;
      if (state.responses[state.index]?.[action.channelId]) return state;

      const responses = state.responses.slice();
      responses[state.index] = {
        ...responses[state.index],
        [action.channelId]: true,
      };
      const correct = state.trials[state.index].isMatch[action.channelId];
      return {
        ...state,
        responses,
        feedback: { ...state.feedback, [action.channelId]: correct ? "hit" : "fa" },
      };
    }

    case "ADVANCE": {
      if (state.phase !== "running") return state;
      const next = state.index + 1;
      if (next >= state.trials.length) {
        const result = scoreSession(
          action.mode,
          state.n,
          state.trials,
          state.responses,
        );
        return { ...state, phase: "finished", stimulusOn: false, result };
      }
      return { ...state, index: next, stimulusOn: true, feedback: {} };
    }

    case "MARK_SAVED":
      return { ...state, bestUpdated: action.bestUpdated };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

export interface UseNBackGame {
  state: GameState;
  start: (n: number) => void;
  respond: (channelId: string) => void;
  reset: () => void;
}

export function useNBackGame(mode: GameMode, intervalMs: number): UseNBackGame {
  const [state, dispatch] = useReducer(reducer, initialState);
  const savedDateRef = useRef<string | null>(null);

  const start = useCallback(
    (n: number) => {
      unlockSpeech();
      cancelSpeech();
      const trialCount = mode.baseTrials + n;
      dispatch({ type: "START", trials: generateTrials(mode, n, trialCount), n });
    },
    [mode],
  );

  const respond = useCallback((channelId: string) => {
    dispatch({ type: "RESPOND", channelId });
  }, []);

  const reset = useCallback(() => {
    cancelSpeech();
    dispatch({ type: "RESET" });
  }, []);

  // カウントダウン進行
  useEffect(() => {
    if (state.phase !== "countdown") return;
    const t = window.setTimeout(() => {
      dispatch(state.countdown > 1 ? { type: "COUNTDOWN" } : { type: "BEGIN" });
    }, 800);
    return () => window.clearTimeout(t);
  }, [state.phase, state.countdown]);

  // 1試行の進行: 刺激提示 → 一定時間後に非表示 → インターバル満了で次へ
  useEffect(() => {
    if (state.phase !== "running") return;

    const trial = state.trials[state.index];
    if (mode.channels.some((c) => c.id === "audio")) {
      speak(trial.values["audio"]);
    }

    const stimMs = Math.min(700, Math.round(intervalMs * 0.3));
    const t1 = window.setTimeout(
      () => dispatch({ type: "HIDE_STIMULUS" }),
      stimMs,
    );
    const t2 = window.setTimeout(
      () => dispatch({ type: "ADVANCE", mode }),
      intervalMs,
    );
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
    // index変化のたびに1回だけ起動する（respondでは再起動しない）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, state.index]);

  // 終了時に1回だけ保存（StrictModeの二重実行をdateでガード）
  useEffect(() => {
    if (state.phase !== "finished" || !state.result) return;
    if (savedDateRef.current === state.result.date) return;
    savedDateRef.current = state.result.date;
    const { bestUpdated } = saveSession(state.result);
    dispatch({ type: "MARK_SAVED", bestUpdated });
  }, [state.phase, state.result]);

  // キーボード応答
  useEffect(() => {
    if (state.phase !== "running") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const ch = mode.channels.find((c) => c.key === e.key.toLowerCase());
      if (ch) {
        e.preventDefault();
        dispatch({ type: "RESPOND", channelId: ch.id });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.phase, mode]);

  // アンマウント時のクリーンアップ
  useEffect(() => () => cancelSpeech(), []);

  return { state, start, respond, reset };
}
