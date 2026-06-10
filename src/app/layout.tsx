import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DnB Games — ワーキングメモリートレーニング",
  description:
    "Dual N-Backをはじめとする8つのモードでワーキングメモリーを鍛えるブラウザゲーム",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Space+Grotesk:wght@500;600&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-ink font-body text-fg antialiased">{children}</body>
    </html>
  );
}
