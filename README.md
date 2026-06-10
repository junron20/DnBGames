# DnB Games

Dual N-Back をはじめとする8つのモードでワーキングメモリーを鍛えるブラウザゲーム。

Next.js 14 (App Router) / TypeScript / Tailwind CSS

## セットアップ

```powershell
cd C:\dev\project\DnBGames
npm install
npm run dev
```

http://localhost:3000 を開く。

> 注: `next` と `eslint-config-next` は同一バージョン（14.2.35）に固定済みです。
> どちらかだけアップグレードすると依存競合（ERESOLVE）が起きるため、必ずセットで上げてください。

## モード一覧

| グループ | モード | 刺激 | 判定 |
|---|---|---|---|
| 基本 | クラシック Dual N-Back | 位置＋音 | N回前と一致 |
| 基本 | シングル（位置） | 位置 | N回前と一致 |
| 基本 | シングル（音） | 音 | N回前と一致 |
| 上級 | Triple N-Back | 位置＋音＋色 | N回前と一致 |
| 上級 | Variable N-Back | 位置＋音 | 一致（Nが成績で自動増減） |
| バリエーション | Arithmetic N-Back | 数字 | N回前との合計が偶数 |
| バリエーション | Pattern N-Back | 図形 | N回前と一致 |
| バリエーション | Color-Word N-Back | 色文字（ストループ） | 文字の「意味」が一致 |

## 操作

- 画面ボタン、またはキーボードで応答
  - 位置: `A` / 音: `L` / 色: `F`（モードカードに表記）
- 最初のN試行は記憶するだけ（応答は受け付けない）
- 音声刺激は Web Speech API による合成音声（Chrome/Edge推奨）

## 仕様メモ

- マッチ注入率は約25〜30%（Brain Workshop準拠）。算術モードは合計の偶奇が自然に約50%になるため注入なし
- 試行数 = 20 + N
- Variable N-Back: 正答率80%以上で N+1、50%未満で N−1（セッション間で適用）
- スコア・履歴・前回のNは `localStorage` に保存（`dnb:` プレフィックス）

## 設計

すべてのモードは「チャンネル（刺激の種類＋判定関数）の組み合わせ」を持つ
設定オブジェクトとして表現され、同一のエンジンで動く。

```
src/
├── app/
│   ├── page.tsx              # モード選択
│   └── play/[mode]/page.tsx  # ゲーム画面（動的ルート）
├── lib/nback/
│   ├── types.ts              # ChannelDef / GameMode / TrialData ...
│   ├── channels.ts           # 6種類の刺激チャンネル定義
│   ├── modes.ts              # モードレジストリ（設定オブジェクトの集合）
│   ├── sequence.ts           # マッチ注入つきシーケンス生成
│   ├── scoring.ts            # 集計＋適応N計算
│   ├── storage.ts            # localStorage（履歴・ベスト・前回N）
│   └── speech.ts             # Web Speech APIラッパー
├── hooks/
│   └── useNBackGame.ts       # 状態機械 idle→countdown→running→finished
└── components/
    ├── PlayClient.tsx        # ゲーム画面の統括
    ├── Grid.tsx              # 3x3グリッド
    ├── CenterStimulus.tsx    # 数字/図形/色文字/音の中央表示
    ├── ResponseButtons.tsx   # 応答ボタン（キー表記つき）
    ├── TrialDots.tsx         # 進行＋成績ドット
    ├── ResultPanel.tsx       # 結果画面
    ├── ModeCard.tsx          # モード選択カード
    └── HistoryPanel.tsx      # 履歴一覧
```

## 新モードの追加方法

1. 必要なら `channels.ts` に新しい `ChannelDef` を追加
   （`random` / `makeMatch` / `isMatch` の3関数を定義するだけ）
2. `modes.ts` の `MODES` 配列にモード定義を1件追加

エンジン・UI側の変更は不要。
