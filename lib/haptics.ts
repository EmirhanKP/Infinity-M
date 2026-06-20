// Tiny haptics helper. navigator.vibrate is supported on Android/Chrome; on
// unsupported platforms (iOS Safari, desktop) this is a silent no-op.

function canVibrate(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
}

/** A short, celebratory triple-tap for a completed circular action. */
export function celebrate(): void {
  if (canVibrate()) navigator.vibrate([18, 40, 28]);
}

/** A single light tick for selections / accept. */
export function tick(): void {
  if (canVibrate()) navigator.vibrate(12);
}
