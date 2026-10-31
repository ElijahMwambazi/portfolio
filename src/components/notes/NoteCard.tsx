import { Link } from "react-router-dom";
import { formatDate } from "../../lib/format";
import type { Note } from "../../lib/notes/queries";

type Props = {
  note: Note;
  variant?: "featured" | "default";
  activeTag?: string;
  onTagClick?: (tag: string) => void;
  onCategoryClick?: (category: string) => void;
};

export function NoteCard({
  note,
  variant = "default",
  activeTag,
  onTagClick,
  onCategoryClick,
}: Props) {
  const featured = variant === "featured";

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden border border-white/10 backdrop-blur-xl transition-all duration-300 hover:border-white/20 ${
        featured
          ? "rounded-3xl bg-white/5 p-4 hover:-translate-y-1 hover:bg-white/[0.07] hover:shadow-[0_20px_60px_rgba(0,0,0,0.32)] sm:p-5 lg:p-6"
          : "rounded-2xl bg-white/4 p-4 hover:bg-white/6 sm:p-5"
      }`}
    >
      {featured ? (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-16 left-8 h-40 w-40 rounded-full bg-sky-400/10 blur-3xl transition-all duration-300 group-hover:bg-sky-400/15" />
          <div className="absolute bottom-0 right-0 h-32 w-32 rounded-full bg-violet-400/10 blur-3xl transition-all duration-300 group-hover:bg-violet-400/15" />
        </div>
      ) : null}

      <div className="relative flex h-full flex-col">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
          {note.draft ? (
            <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 uppercase tracking-[0.12em] text-amber-200">
              Draft
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => onCategoryClick?.(note.category)}
            className="uppercase tracking-[0.12em] transition hover:text-white"
          >
            {note.category}
          </button>
          <span aria-hidden="true">·</span>
          <span>{note.date ? formatDate(note.date) : "Unscheduled"}</span>
          <span aria-hidden="true">·</span>
          <span>{note.readingMinutes} min read</span>
        </div>

        <h3
          className={`mt-3 font-semibold tracking-tight text-neutral-100 ${
            featured ? "text-lg sm:text-xl lg:text-2xl" : "text-lg"
          }`}
        >
          <Link
            to={`/notes/${note.slug}`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:after:rounded-2xl"
          >
            {note.title}
          </Link>
        </h3>

        <p className="mt-2 text-sm leading-7 text-neutral-400 sm:text-base">
          {note.description}
        </p>

        <div className="relative z-10 mt-auto flex flex-wrap gap-2 pt-5">
          {note.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onTagClick?.(tag)}
              aria-pressed={activeTag === tag}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                activeTag === tag
                  ? "border-white/30 bg-white text-black"
                  : "border-white/10 bg-white/6 text-neutral-300 hover:border-white/25 hover:text-white"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </article>
  );
}
