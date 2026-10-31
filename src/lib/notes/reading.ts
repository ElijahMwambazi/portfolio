const WORDS_PER_MINUTE = 220;

/** Estimated reading time in whole minutes (minimum 1). */
export function readingMinutes(markdown: string): number {
  const words = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[`*_>#\-[\]()!]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
