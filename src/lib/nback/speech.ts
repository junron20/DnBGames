let voicesPromise: Promise<SpeechSynthesisVoice[]> | null = null;

/** 音声リストの読み込みを待つ（iOS/Androidは初回呼び出し時に空配列を返すため） */
function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return Promise.resolve([]);
  }
  if (voicesPromise) return voicesPromise;

  voicesPromise = new Promise((resolve) => {
    const existing = window.speechSynthesis.getVoices();
    if (existing.length > 0) {
      resolve(existing);
      return;
    }
    window.speechSynthesis.addEventListener(
      "voiceschanged",
      () => resolve(window.speechSynthesis.getVoices()),
      { once: true },
    );
    // voiceschangedが発火しない環境向けのフォールバック
    window.setTimeout(() => resolve(window.speechSynthesis.getVoices()), 1000);
  });
  return voicesPromise;
}

/**
 * iOS Safari等は、ユーザー操作（タップ）と同じ呼び出し中に
 * speechSynthesis.speak() を一度実行しないと、以後の音声合成が無音になる。
 * 「開始」ボタン押下時など、ユーザー操作のハンドラ内から同期的に呼ぶこと。
 */
export function unlockSpeech(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.resume();
    const u = new SpeechSynthesisUtterance(" ");
    u.volume = 0;
    window.speechSynthesis.speak(u);
    void loadVoices();
  } catch {
    // noop
  }
}

/** Web Speech API で文字を読み上げる。未対応ブラウザでは何もしない。 */
export async function speak(text: string): Promise<void> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 1.1;
    u.pitch = 1;
    u.volume = 1;

    const voices = await loadVoices();
    const enVoice = voices.find((v) => v.lang.toLowerCase().startsWith("en"));
    if (enVoice) u.voice = enVoice;

    // resume()忘れでChrome/Androidが無音のまま固まる対策
    window.speechSynthesis.resume();
    window.speechSynthesis.speak(u);
  } catch {
    // 読み上げ失敗でゲームを止めない
  }
}

export function cancelSpeech(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* noop */
  }
}
