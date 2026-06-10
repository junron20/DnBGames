import type { GameMode, Rng, TrialData } from "./types";

/**
 * 試行列を生成する。
 * 完全ランダムだとマッチ率が低すぎる（位置で約1/9）ため、
 * 各チャンネルの matchRate に従って「N回前と一致する刺激」を意図的に注入する。
 * 注入とは別に偶然のマッチも起こり得るので、正解フラグは最後に全試行を走査して計算する。
 */
export function generateTrials(
  mode: GameMode,
  n: number,
  trialCount: number,
  rng: Rng = Math.random,
): TrialData[] {
  const trials: TrialData[] = [];

  for (let i = 0; i < trialCount; i++) {
    const values: Record<string, string> = {};
    for (const ch of mode.channels) {
      if (i >= n && ch.matchRate > 0 && rng() < ch.matchRate) {
        values[ch.id] = ch.makeMatch(trials[i - n].values[ch.id], rng);
      } else {
        values[ch.id] = ch.random(rng);
      }
    }
    trials.push({ values, isMatch: {} });
  }

  for (let i = 0; i < trialCount; i++) {
    for (const ch of mode.channels) {
      trials[i].isMatch[ch.id] =
        i >= n
          ? ch.isMatch(trials[i].values[ch.id], trials[i - n].values[ch.id])
          : false;
    }
  }

  return trials;
}
