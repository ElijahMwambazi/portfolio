import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { MarkdownContent } from "../components/notes/MarkdownContent";
import { TableOfContents } from "../components/notes/TableOfContents";
import { CopyLinkButton } from "../components/notes/CopyLinkButton";
import { NoteCard } from "../components/notes/NoteCard";
import { usePageMeta } from "../hooks/usePageMeta";
import { formatDate } from "../lib/format";
import { extractHeadings } from "../lib/notes/headings";
import { notesStore } from "../lib/notes/store";
import { absoluteUrl } from "../lib/site";

function NotFound() {
  usePageMeta({
    title: "Note not found",
    description: "This note does not exist or has not been published.",
  });
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <Container>
        <div className="max-w-2xl">
          <p className="mb-4 text-xs uppercase tracking-[0.16em] text-neutral-400 sm:text-sm">Notes</p>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-50 sm:text-4xl">Note not found</h1>
          <p className="mt-4 text-sm leading-7 text-neutral-400 sm:text-base sm:leading-8">
            The note you’re looking for doesn’t exist or hasn’t been published yet.
          </p>
          <Link
            to="/notes"
            className="mt-8 inline-flex items-center justify-center rounded-xl border border-white/15 bg-white px-4 py-2.5 text-sm font-semibold text-black transition-all duration-200 hover:-translate-y-0.5 hover:bg-neutral-200"
          >
            Back to notes
          </Link>
        </div>
      </Container>
    </section>
  );
}

export function NotePage() {
  const { slug } = useParams();
  const note = slug ? notesStore.find(slug) : undefined;
  const headings = useMemo(() => (note ? extractHeadings(note.body) : []), [note]);

  usePageMeta(
    note && !note.draft
      ? {
          title: note.title,
          description: note.description,
          canonical: absoluteUrl(`/notes/${note.slug}`),
          type: "article",
          publishedTime: note.date,
          modifiedTime: note.updated ?? note.date,
          tags: note.tags,
        }
      : null,
  );

  if (!note) return <NotFound />;

  const related = notesStore.related(note);
  const { newer, older } = notesStore.adjacent(note);
  const shareUrl =
    absoluteUrl(`/notes/${note.slug}`) ??
    `${window.location.origin}/notes/${note.slug}`;

  return (
    <section className="relative overflow-hidden py-12 sm:py-16 lg:py-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-130 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_42%)] sm:h-175 lg:h-212.5" />

      <Container>
        <div className="relative z-10">
          <Link to="/notes" className="mb-6 inline-flex text-sm text-neutral-400 transition hover:text-white sm:mb-8">
            ← Back to notes
          </Link>

          {note.draft ? (
            <p className="mb-6 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-100">
              Draft preview. This note is unpublished and is not included in production builds.
            </p>
          ) : null}

          <header className="max-w-3xl">
            <p className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] uppercase tracking-[0.16em] text-neutral-400 sm:text-sm">
              <Link to={`/notes?category=${encodeURIComponent(note.category)}`} className="hover:text-white">
                {note.category}
              </Link>
              <span aria-hidden="true">·</span>
              {note.date ? (
                <time dateTime={note.date}>{formatDate(note.date)}</time>
              ) : (
                <span>Unscheduled</span>
              )}
              <span aria-hidden="true">·</span>
              <span>{note.readingMinutes} min read</span>
            </p>

            <h1 className="text-2xl font-semibold tracking-tight text-neutral-50 leading-[1.1] sm:text-4xl lg:text-5xl lg:leading-[1.08]">
              {note.title}
            </h1>
            <p className="mt-4 text-sm leading-7 text-neutral-300 sm:mt-5 sm:text-base sm:leading-8 lg:text-lg">
              {note.description}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2 sm:gap-3">
              {note.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`/notes?tag=${encodeURIComponent(tag)}`}
                  className="rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-xs text-neutral-300 transition hover:border-white/25 hover:text-white sm:text-sm"
                >
                  {tag}
                </Link>
              ))}
              <CopyLinkButton url={shareUrl} />
            </div>

            {note.updated ? (
              <p className="mt-4 text-sm text-neutral-500">
                Last updated <time dateTime={note.updated}>{formatDate(note.updated)}</time>
              </p>
            ) : null}
          </header>

          <div className="mt-10 grid gap-10 sm:mt-12 lg:grid-cols-[minmax(0,44rem)_15rem] lg:gap-16">
            <div className="min-w-0">
              <TableOfContents headings={headings} variant="mobile" />
              <article>
                <MarkdownContent markdown={note.body} />
              </article>
            </div>
            <aside className="hidden lg:block">
              <TableOfContents headings={headings} variant="desktop" />
            </aside>
          </div>

          {related.length > 0 ? (
            <div className="mt-16 border-t border-white/10 pt-10">
              <h2 className="mb-5 text-lg font-medium text-neutral-100 sm:text-xl">Related notes</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {related.map((n) => (
                  <NoteCard key={n.slug} note={n} />
                ))}
              </div>
            </div>
          ) : null}

          {newer || older ? (
            <nav aria-label="More notes" className="mt-12 grid gap-4 border-t border-white/10 pt-8 sm:grid-cols-2">
              {older ? (
                <Link to={`/notes/${older.slug}`} className="rounded-2xl border border-white/10 bg-white/4 p-4 transition hover:border-white/20 hover:bg-white/6">
                  <span className="text-xs uppercase tracking-[0.16em] text-neutral-500">← Previous</span>
                  <span className="mt-1 block font-medium text-neutral-100">{older.title}</span>
                </Link>
              ) : (
                <span />
              )}
              {newer ? (
                <Link to={`/notes/${newer.slug}`} className="rounded-2xl border border-white/10 bg-white/4 p-4 text-right transition hover:border-white/20 hover:bg-white/6">
                  <span className="text-xs uppercase tracking-[0.16em] text-neutral-500">Next →</span>
                  <span className="mt-1 block font-medium text-neutral-100">{newer.title}</span>
                </Link>
              ) : null}
            </nav>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
