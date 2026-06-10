// 刺激チャンネルとゲームモードの型定義。
// すべてのモードは「チャンネルの組み合わせ＋判定関数」の設定オブジェクトとして表現される。

export type ChannelId =
  | "position"
  | "audio"
  | "color"
  | "shape"
  | "number"
  | "word";

export type Rng = () => number;

export interface ChannelDef {
  id: ChannelId;
  /** UI表示名（例: 位置） */
  label: string;
  /** 応答キー（小文字） */
  key: string;
  /** マッチ注入率。0なら自然発生に任せる（算術モードなど） */
  matchRate: number;
  /** ランダムな刺激値を生成 */
  random: (rng: Rng) => string;
  /** N回前の値にマッチする刺激値を生成 */
  makeMatch: (prev: string, rng: Rng) => string;
  /** 現在値とN回前の値が「マッチ」か判定 */
  isMatch: (cur: string, prev: string) => boolean;
  /** 応答ボタンの文言（例: 位置が一致） */
  matchLabel: string;
}

export type ModeGroup = "基本" | "上級" | "バリエーション";

export interface GameMode {
  id: string;
  name: string;
  tagline: string;
  group: ModeGroup;
  channels: ChannelDef[];
  defaultN: number;
  /** セッション間でNを自動調整するか（Variable N-Back） */
  adaptive?: boolean;
  /** メイン表示: 3x3グリッド or 中央表示 */
  display: "grid" | "center";
  /** 試行数 = baseTrials + N */
  baseTrials: number;
}

export interface TrialData {
  /** channelId -> 刺激値 */
  values: Record<string, string>;
  /** channelId -> N-backマッチか（事前計算済みの正解） */
  isMatch: Record<string, boolean>;
}

export interface ChannelScore {
  hits: number;
  misses: number;
  falseAlarms: number;
  correctRejections: number;
  /** (hits + correctRejections) / 判定対象試行数 */
  accuracy: number;
}

export interface SessionResult {
  modeId: string;
  n: number;
  date: string; // ISO
  trialCount: number;
  perChannel: Record<string, ChannelScore>;
  /** 全チャンネル平均の正答率 0..1 */
  overall: number;
  /** adaptiveモードの場合の次回推奨N */
  nextN?: number;
}
