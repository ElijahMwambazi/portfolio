import type { ParsedNote } from "./frontmatter";
import { readingMinutes } from "./reading";

export type Note = ParsedNote & {
  /** Present for every published note; drafts may omit it. */
  date?: string;
  readingMinutes: number;
};

export function toNote(parsed: ParsedNote): Note {
  return { ...parsed, readingMinutes: readingMinutes(parsed.body) };
}

/** Newest first; undated drafts last, ties broken by title. */
export function sortNewestFirst<T extends Pick<Note, "date" | "title">>(
  list: T[],
): T[] {
  return [...list].sort((a, b) => {
    const da = a.date ?? "";
    const db = b.date ?? "";
    if (da !== db) return da < db ? 1 : -1;
    return a.title.localeCompare(b.title);
  });
}

export function publishedOnly(list: Note[]): Note[] {
  return sortNewestFirst(list.filter((n) => !n.draft && n.date));
}

export type NoteFilters = {
  query?: string;
  category?: string;
  tag?: string;
};

export function filterNotes(list: Note[], filters: NoteFilters): Note[] {
  const q = (filters.query ?? "").trim().toLowerCase();
  return list.filter((n) => {
    if (filters.category && n.category !== filters.category) return false;
    if (filters.tag && !n.tags.includes(filters.tag.toLowerCase())) return false;
    if (!q) return true;
    return [n.title, n.description, ...n.tags].join(" ").toLowerCase().includes(q);
  });
}

export function allTags(list: Note[]): string[] {
  return Array.from(new Set(list.flatMap((n) => n.tags))).sort();
}

/** Published notes ranked by shared tags (+1 for same category). */
export function relatedNotes(published: Note[], note: Note, limit = 3): Note[] {
  return published
    .filter((n) => n.slug !== note.slug)
    .map((n) => ({
      n,
      score:
        n.tags.filter((t) => note.tags.includes(t)).length * 2 +
        (n.category === note.category ? 1 : 0),
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || (a.n.date! < b.n.date! ? 1 : -1))
    .slice(0, limit)
    .map((r) => r.n);
}

/** `published` must be newest-first. "previous" is the older note. */
export function adjacentNotes(published: Note[], slug: string) {
  const i = published.findIndex((n) => n.slug === slug);
  if (i === -1) return { newer: undefined, older: undefined };
  return { newer: published[i - 1], older: published[i + 1] };
}

/**
 * Published notes for the given slugs, in the order listed. Unknown slugs and
 * drafts are skipped, so a project can reference a note before it ships.
 */
export function notesBySlugs(slugs: string[] | undefined, published: Note[]): Note[] {
  if (!slugs) return [];
  return slugs.flatMap((slug) => published.find((n) => n.slug === slug) ?? []);
}
