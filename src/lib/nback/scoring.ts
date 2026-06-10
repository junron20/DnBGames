import type {
  ChannelScore,
  GameMode,
  SessionResult,
  TrialData,
} from "./types";

/**
 * セッション結果を集計する。
 * 判定対象は trialIndex >= n の試行のみ（最初のN試行は比較相手がない）。
 *  - hit:               マッチ時に応答した
 *  - miss:              マッチ時に応答しなかった
 *  - falseAlarm:        非マッチ時に応答した
 *  - correctRejection:  非マッチ時に応答しなかった
 */
export function scoreSession(
  mode: GameMode,
  n: number,
  trials: TrialData[],
  responses: Record<string, boolean>[],
): SessionResult {
  const perChannel: Record<string, ChannelScore> = {};
  const judged = Math.max(0, trials.length - n);

  for (const ch of mode.channels) {
    let hits = 0;
    let misses = 0;
    let falseAlarms = 0;
    let correctRejections = 0;

    for (let i = n; i < trials.length; i++) {
      const match = trials[i].isMatch[ch.id];
      const pressed = !!responses[i]?.[ch.id];
      if (match && pressed) hits++;
      else if (match && !pressed) misses++;
      else if (!match && pressed) falseAlarms++;
      else correctRejections++;
    }

    perChannel[ch.id] = {
      hits,
      misses,
      falseAlarms,
      correctRejections,
      accuracy: judged > 0 ? (hits + correctRejections) / judged : 0,
    };
  }

  const accs = mode.channels.map((ch) => perChannel[ch.id].accuracy);
  const overall = accs.reduce((a, b) => a + b, 0) / accs.length;

  const result: SessionResult = {
    modeId: mode.id,
    n,
    date: new Date().toISOString(),
    trialCount: trials.length,
    perChannel,
    overall,
  };

  if (mode.adaptive) {
    result.nextN = nextAdaptiveN(n, overall);
  }

  return result;
}

/**
 * Variable N-Back のN調整則（Jaeggiプロトコル風）。
 *   正答率 80% 以上 → N+1
 *   正答率 50% 未満 → N-1（下限1）
 *   それ以外       → 据え置き
 */
export function nextAdaptiveN(n: number, overall: number): number {
  if (overall >= 0.8) return Math.min(9, n + 1);
  if (overall < 0.5) return Math.max(1, n - 1);
  return n;
}
