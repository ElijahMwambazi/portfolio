export const NOTE_CATEGORIES = [
  "Engineering",
  "Infrastructure",
  "Bitcoin & Finance",
  "Experiments & Learning",
] as const;

export type NoteCategory = (typeof NOTE_CATEGORIES)[number];
