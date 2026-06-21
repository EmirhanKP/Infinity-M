function canVibrate(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
}

export function celebrate(): void {
  if (canVibrate()) navigator.vibrate([18, 40, 28]);
}
