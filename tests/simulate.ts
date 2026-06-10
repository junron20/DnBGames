import { MODES } from "../src/lib/nback/modes";
import { generateTrials } from "../src/lib/nback/sequence";
import { scoreSession, nextAdaptiveN } from "../src/lib/nback/scoring";
import { stroopWordOf } from "../src/lib/nback/channels";

let failures = 0;
const assert = (cond: boolean, msg: string) => {
  if (!cond) {
    failures++;
    console.error("FAIL:", msg);
  }
};

for (const mode of MODES) {
  const n = mode.defaultN;
  const trialCount = mode.baseTrials + n;

  // --- 1000セッション分のマッチ率を計測 ---
  const matchCount: Record<string, number> = {};
  const judged = trialCount - n;
  const SESSIONS = 1000;

  for (let s = 0; s < SESSIONS; s++) {
    const trials = generateTrials(mode, n, trialCount);
    assert(trials.length === trialCount, `${mode.id}: trial count`);

    for (const ch of mode.channels) {
      for (let i = 0; i < trialCount; i++) {
        const v = trials[i].values[ch.id];
        assert(typeof v === "string" && v.length > 0, `${mode.id}/${ch.id}: 値が空`);
        if (i < n) {
          assert(!trials[i].isMatch[ch.id], `${mode.id}/${ch.id}: 最初のN試行はマッチ不可`);
        } else {
          // isMatchが定義通りか再検証
          const expected = ch.isMatch(v, trials[i - n].values[ch.id]);
          assert(trials[i].isMatch[ch.id] === expected, `${mode.id}/${ch.id}: isMatch整合性`);
          if (trials[i].isMatch[ch.id]) {
            matchCount[ch.id] = (matchCount[ch.id] ?? 0) + 1;
          }
        }
      }
    }
  }

  for (const ch of mode.channels) {
    const rate = (matchCount[ch.id] ?? 0) / (SESSIONS * judged);
    if (ch.matchRate > 0) {
      // 注入率以上（偶然のマッチ込み）かつ過剰でないこと
      // 期待値 = 注入率 + (1-注入率) × 偶然一致率。値の種類が少ないチャンネルほど後者が大きい
      assert(
        rate >= ch.matchRate * 0.85 && rate <= ch.matchRate + 0.27,
        `${mode.id}/${ch.id}: マッチ率異常 ${rate.toFixed(3)}`,
      );
    } else {
      // 算術: 合計の偶奇は約50%
      assert(
        rate > 0.4 && rate < 0.6,
        `${mode.id}/${ch.id}: 自然マッチ率異常 ${rate.toFixed(3)}`,
      );
    }
    console.log(`${mode.id.padEnd(16)} ${ch.id.padEnd(9)} match=${(rate * 100).toFixed(1)}%`);
  }

  // --- 完璧なプレイヤーをシミュレート → 全チャンネル100% ---
  const trials = generateTrials(mode, n, trialCount);
  const perfect = trials.map((t, i) => {
    const r: Record<string, boolean> = {};
    if (i >= n) for (const ch of mode.channels) if (t.isMatch[ch.id]) r[ch.id] = true;
    return r;
  });
  const res = scoreSession(mode, n, trials, perfect);
  assert(res.overall === 1, `${mode.id}: 完璧プレイで100%にならない (${res.overall})`);
  for (const ch of mode.channels) {
    const s = res.perChannel[ch.id];
    assert(s.misses === 0 && s.falseAlarms === 0, `${mode.id}/${ch.id}: 完璧プレイで誤判定`);
  }

  // --- 無応答プレイヤー → falseAlarm 0、hits 0 ---
  const silent = trials.map(() => ({}));
  const res2 = scoreSession(mode, n, trials, silent);
  for (const ch of mode.channels) {
    const s = res2.perChannel[ch.id];
    assert(s.hits === 0 && s.falseAlarms === 0, `${mode.id}/${ch.id}: 無応答の集計`);
    assert(s.misses + s.correctRejections === judged, `${mode.id}/${ch.id}: 判定数の合計`);
  }

  // --- adaptive ---
  if (mode.adaptive) {
    assert(res.nextN === n + 1, `${mode.id}: 100%でN+1にならない`);
    assert(res2.nextN !== undefined && res2.nextN <= n, `${mode.id}: 低成績でN維持以下にならない`);
  }
}

// --- 適応則の境界値 ---
assert(nextAdaptiveN(2, 0.8) === 3, "80%ちょうどでN+1");
assert(nextAdaptiveN(2, 0.79) === 2, "79%で据え置き");
assert(nextAdaptiveN(2, 0.49) === 1, "49%でN-1");
assert(nextAdaptiveN(1, 0.1) === 1, "下限1");
assert(nextAdaptiveN(9, 1) === 9, "上限9");

// --- ストループ: makeMatchが単語を保持すること ---
const stroop = MODES.find((m) => m.id === "stroop")!;
const wch = stroop.channels[0];
for (let i = 0; i < 100; i++) {
  const prev = wch.random(Math.random);
  const matched = wch.makeMatch(prev, Math.random);
  assert(stroopWordOf(matched) === stroopWordOf(prev), "stroop makeMatch 単語保持");
  assert(wch.isMatch(matched, prev), "stroop isMatch");
}

console.log(failures === 0 ? "\nALL TESTS PASSED" : `\n${failures} FAILURES`);
if (failures > 0) throw new Error(`${failures} failures`);
