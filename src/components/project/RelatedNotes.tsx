import { NoteCard } from "../notes/NoteCard";
import { notesBySlugs, type Note } from "../../lib/notes/queries";
import { notesStore } from "../../lib/notes/store";

/** Renders nothing unless at least one referenced note is published. */
export function RelatedNotes({
  slugs,
  published = notesStore.published,
}: {
  slugs?: string[];
  published?: Note[];
}) {
  const notes = notesBySlugs(slugs, published);
  if (notes.length === 0) return null;

  return (
    <div className="mt-12 sm:mt-14">
      <h2 className="mb-5 text-lg font-medium text-neutral-100 sm:text-xl">
        Related engineering notes
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        {notes.map((note) => (
          <NoteCard key={note.slug} note={note} />
        ))}
      </div>
    </div>
  );
}
