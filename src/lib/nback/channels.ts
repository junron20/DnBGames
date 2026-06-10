import type { ChannelDef, Rng } from "./types";

const pick = <T,>(arr: readonly T[], rng: Rng): T =>
  arr[Math.floor(rng() * arr.length)];

const eq = (a: string, b: string) => a === b;

/** 色チャンネル・ストループ共通のカラーパレット */
export const COLOR_SET = [
  { id: "red", hex: "#FF6B6B", name: "赤" },
  { id: "blue", hex: "#5B9CFF", name: "青" },
  { id: "green", hex: "#51D88A", name: "緑" },
  { id: "yellow", hex: "#FFD166", name: "黄" },
  { id: "purple", hex: "#B78CFF", name: "紫" },
  { id: "orange", hex: "#FF9D5C", name: "橙" },
] as const;

export const colorHex = (id: string): string =>
  COLOR_SET.find((c) => c.id === id)?.hex ?? "#FFB454";

/** 音声チャンネルで読み上げる文字（Brain Workshop準拠の8文字） */
export const AUDIO_LETTERS = ["C", "H", "K", "L", "Q", "R", "S", "T"] as const;

export const SHAPES = ["●", "▲", "■", "★", "◆", "✚"] as const;

/** ストループ用: 単語4種 × インク4色 */
export const STROOP_WORDS = [
  { id: "red", text: "あか" },
  { id: "blue", text: "あお" },
  { id: "green", text: "みどり" },
  { id: "yellow", text: "きいろ" },
] as const;

const stroopValue = (wordId: string, inkId: string) => `${wordId}:${inkId}`;
export const stroopWordOf = (v: string) => v.split(":")[0];
export const stroopInkOf = (v: string) => v.split(":")[1];

// ---------------------------------------------------------------- channels

export const positionChannel: ChannelDef = {
  id: "position",
  label: "位置",
  key: "a",
  matchRate: 0.25,
  random: (rng) => String(Math.floor(rng() * 9)),
  makeMatch: (prev) => prev,
  isMatch: eq,
  matchLabel: "位置が一致",
};

export const audioChannel: ChannelDef = {
  id: "audio",
  label: "音",
  key: "l",
  matchRate: 0.25,
  random: (rng) => pick(AUDIO_LETTERS, rng),
  makeMatch: (prev) => prev,
  isMatch: eq,
  matchLabel: "音が一致",
};

export const colorChannel: ChannelDef = {
  id: "color",
  label: "色",
  key: "f",
  matchRate: 0.25,
  random: (rng) => pick(COLOR_SET, rng).id,
  makeMatch: (prev) => prev,
  isMatch: eq,
  matchLabel: "色が一致",
};

export const shapeChannel: ChannelDef = {
  id: "shape",
  label: "図形",
  key: "a",
  matchRate: 0.25,
  random: (rng) => pick(SHAPES, rng),
  makeMatch: (prev) => prev,
  isMatch: eq,
  matchLabel: "図形が一致",
};

/** 算術: N回前の数字との合計が偶数ならマッチ。自然発生率が約50%なので注入しない */
export const numberChannel: ChannelDef = {
  id: "number",
  label: "数字",
  key: "a",
  matchRate: 0,
  random: (rng) => String(1 + Math.floor(rng() * 9)),
  makeMatch: (prev) => prev,
  isMatch: (cur, prev) => (Number(cur) + Number(prev)) % 2 === 0,
  matchLabel: "合計が偶数",
};

/** ストループ: 単語の「意味」で判定。インク色は干渉用 */
export const wordChannel: ChannelDef = {
  id: "word",
  label: "ことば",
  key: "a",
  matchRate: 0.15,
  random: (rng) =>
    stroopValue(pick(STROOP_WORDS, rng).id, pick(STROOP_WORDS, rng).id),
  makeMatch: (prev, rng) =>
    stroopValue(stroopWordOf(prev), pick(STROOP_WORDS, rng).id),
  isMatch: (cur, prev) => stroopWordOf(cur) === stroopWordOf(prev),
  matchLabel: "ことばが一致",
};
