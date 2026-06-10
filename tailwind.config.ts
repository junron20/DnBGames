import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0E1420",      // 最深背景
        surface: "#161E2C",  // カード面
        raised: "#1E2838",   // 持ち上がった面
        line: "#2A3650",     // 罫線
        stim: "#FFB454",     // 刺激（琥珀）
        hit: "#51D88A",      // 正答
        miss: "#FF6B6B",     // 誤答
        fg: "#E8EDF5",
        muted: "#8B96A8",
      },
      fontFamily: {
        display: ['"Space Grotesk"', '"Zen Kaku Gothic New"', "sans-serif"],
        body: ['"Zen Kaku Gothic New"', "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        stim: "0 0 24px 4px rgba(255, 180, 84, 0.45)",
      },
      keyframes: {
        stimpulse: {
          "0%": { transform: "scale(0.92)", opacity: "0.6" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        stimpulse: "stimpulse 160ms ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
