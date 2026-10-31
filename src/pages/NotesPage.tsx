import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { NoteCard } from "../components/notes/NoteCard";
import { usePageMeta } from "../hooks/usePageMeta";
import { NOTE_CATEGORIES } from "../lib/notes/categories";
import { allTags, filterNotes } from "../lib/notes/queries";
import { notesStore } from "../lib/notes/store";
import { absoluteUrl } from "../lib/site";

const chip = (active: boolean) =>
  `rounded-full border px-3 py-1.5 text-xs transition sm:text-sm ${
    active
      ? "border-white/30 bg-white text-black font-semibold"
      : "border-white/10 bg-white/4 text-neutral-300 hover:border-white/20 hover:bg-white/8 hover:text-white"
  }`;

export function NotesPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const category = params.get("category") ?? "";
  const tag = params.get("tag") ?? "";

  const { published, drafts } = notesStore;
  const tags = useMemo(() => allTags(published), [published]);

  usePageMeta({
    title: "Notes",
    description:
      "Engineering notes and field reports on software, infrastructure, Bitcoin and finance, and things I am learning.",
    canonical: absoluteUrl("/notes"),
  });

  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  }
  const toggle = (key: string, current: string, value: string) =>
    update(key, current === value ? "" : value);

  const filtering = Boolean(query || category || tag);
  const results = useMemo(
    () => filterNotes(published, { query, category, tag }),
    [published, query, category, tag],
  );
  const featured = filtering ? [] : published.filter((n) => n.featured);
  const rest = filtering ? results : published.filter((n) => !n.featured);

  return (
    <section className="relative overflow-hidden py-12 sm:py-16 lg:py-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-130 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_42%)] sm:h-175 lg:h-212.5" />

      <Container>
        <div className="relative z-10">
          <div className="max-w-3xl">
            <p className="mb-3 text-[11px] uppercase tracking-[0.16em] text-neutral-400 sm:mb-4 sm:text-sm">
              Notes
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-50 leading-[1.08] sm:text-4xl lg:text-6xl lg:leading-[1.05]">
              Notes, ideas, and things I’m learning.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-300 sm:mt-5 sm:text-base sm:leading-8 lg:text-lg">
              A place for technical notes, reflections, and ideas around
              software, Bitcoin and Lightning, privacy, Linux, and other things
              I keep returning to.
            </p>
          </div>

          {published.length > 0 ? (
            <div className="mt-10 space-y-4 sm:mt-12">
              <label className="block max-w-md">
                <span className="sr-only">Search notes</span>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => update("q", e.target.value)}
                  placeholder="Search title, description, tags…"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-white/30 focus:outline-none"
                />
              </label>

              <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
                <button type="button" aria-pressed={!category} onClick={() => update("category", "")} className={chip(!category)}>
                  All
                </button>
                {NOTE_CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={category === c}
                    onClick={() => toggle("category", category, c)}
                    className={chip(category === c)}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by tag">
                {tags.map((t) => (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={tag === t}
                    onClick={() => toggle("tag", tag, t)}
                    className={chip(tag === t)}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <p className="text-sm text-neutral-500" role="status">
                {filtering
                  ? `${results.length} of ${published.length} note${published.length === 1 ? "" : "s"}`
                  : `${published.length} note${published.length === 1 ? "" : "s"}`}
                {filtering ? (
                  <button
                    type="button"
                    onClick={() => setParams(new URLSearchParams(), { replace: true })}
                    className="ml-3 text-neutral-300 underline underline-offset-4 hover:text-white"
                  >
                    Clear filters
                  </button>
                ) : null}
              </p>
            </div>
          ) : (
            <div className="mt-10 rounded-3xl border border-white/10 bg-white/3 p-5 sm:mt-12 sm:p-6 lg:p-8">
              <h2 className="text-xl font-semibold text-neutral-100">No notes yet</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-400 sm:text-base sm:leading-8">
                Technical notes and field reports will appear here once they are published.
              </p>
            </div>
          )}

          {featured.length > 0 ? (
            <div className="mt-10 sm:mt-12">
              <h2 className="mb-5 text-lg font-medium text-neutral-100 sm:text-xl">Featured</h2>
              <div className="grid gap-5 sm:gap-6 lg:grid-cols-2">
                {featured.map((note) => (
                  <NoteCard
                    key={note.slug}
                    note={note}
                    variant="featured"
                    activeTag={tag}
                    onTagClick={(t) => update("tag", t)}
                    onCategoryClick={(c) => update("category", c)}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {rest.length > 0 ? (
            <div className="mt-10 sm:mt-12">
              <h2 className="mb-5 text-lg font-medium text-neutral-100 sm:text-xl">
                {filtering ? "Results" : featured.length > 0 ? "More notes" : "All notes"}
              </h2>
              <div className="grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
                {rest.map((note) => (
                  <NoteCard
                    key={note.slug}
                    note={note}
                    activeTag={tag}
                    onTagClick={(t) => update("tag", t)}
                    onCategoryClick={(c) => update("category", c)}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {filtering && results.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-white/10 p-8 text-center text-sm text-neutral-500">
              No notes match those filters.
            </div>
          ) : null}

          {drafts.length > 0 ? (
            <div className="mt-16 rounded-3xl border border-dashed border-amber-400/30 p-4 sm:p-6">
              <h2 className="text-lg font-medium text-amber-100">Local drafts</h2>
              <p className="mt-1 text-sm text-neutral-400">
                Visible only in the local dev server. Drafts are stripped from production builds.
              </p>
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {drafts.map((note) => (
                  <NoteCard key={note.slug} note={note} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
