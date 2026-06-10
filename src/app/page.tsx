import HistoryPanel from "@/components/HistoryPanel";
import ModeCard from "@/components/ModeCard";
import { MODES } from "@/lib/nback/modes";
import type { ModeGroup } from "@/lib/nback/types";

const GROUPS: ModeGroup[] = ["基本", "上級", "バリエーション"];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-10">
        <p className="font-mono text-sm text-stim">working memory training</p>
        <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight">
          DnB Games
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
          N回前の刺激と今の刺激が一致するかを判断し続ける、ワーキングメモリーの
          トレーニング。位置は <kbd className="rounded border border-line bg-surface px-1.5 font-mono">A</kbd>、
          音は <kbd className="rounded border border-line bg-surface px-1.5 font-mono">L</kbd> キーでも応答できます。
        </p>
      </header>

      {GROUPS.map((group) => (
        <section key={group} className="mb-8">
          <h2 className="mb-3 text-sm font-medium text-muted">{group}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {MODES.filter((m) => m.group === group).map((m) => (
              <ModeCard key={m.id} modeId={m.id} />
            ))}
          </div>
        </section>
      ))}

      <section className="mt-12">
        <h2 className="mb-3 text-sm font-medium text-muted">最近のセッション</h2>
        <HistoryPanel />
      </section>
    </main>
  );
}
