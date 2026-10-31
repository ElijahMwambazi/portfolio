import type { ParsedNote } from "./frontmatter";
import {
  adjacentNotes,
  publishedOnly,
  relatedNotes,
  sortNewestFirst,
  toNote,
  type Note,
} from "./queries";

export type NotesStore = ReturnType<typeof createNotesStore>;

/**
 * Public notes are always `published`. `drafts` is empty unless explicitly
 * enabled, and drafts never appear in related/adjacent results.
 */
export function createNotesStore(
  raw: ParsedNote[],
  options: { includeDrafts: boolean },
) {
  const all = raw.map(toNote);
  const published = publishedOnly(all);
  const drafts = options.includeDrafts
    ? sortNewestFirst(all.filter((n) => n.draft))
    : [];

  return {
    published,
    drafts,
    find(slug: string): Note | undefined {
      return (
        published.find((n) => n.slug === slug) ??
        drafts.find((n) => n.slug === slug)
      );
    },
    related(note: Note) {
      return relatedNotes(published, note);
    },
    adjacent(note: Note) {
      return note.draft
        ? { newer: undefined, older: undefined }
        : adjacentNotes(published, note.slug);
    },
  };
}
