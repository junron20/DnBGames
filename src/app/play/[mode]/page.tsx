import { notFound } from "next/navigation";
import PlayClient from "@/components/PlayClient";
import { findMode, MODES } from "@/lib/nback/modes";

export function generateStaticParams() {
  return MODES.map((m) => ({ mode: m.id }));
}

export default function PlayPage({ params }: { params: { mode: string } }) {
  const mode = findMode(params.mode);
  if (!mode) notFound();
  return <PlayClient modeId={mode.id} />;
}
