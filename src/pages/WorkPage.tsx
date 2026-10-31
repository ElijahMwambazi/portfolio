import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { projects } from "../content/projects";
import { Container } from "../components/ui/Container";
import { StatusBadge } from "../components/ui/StatusBadge";
import { ProjectLogo } from "../components/ui/ProjectLogo";
import { usePageMeta } from "../hooks/usePageMeta";
import { absoluteUrl } from "../lib/site";
import { ScriptsSection } from "../components/work/ScriptsSection";

function GitHubIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill="currentColor"
    >
      <path d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.87 8.35 6.84 9.71.5.1.68-.22.68-.49 0-.24-.01-1.03-.01-1.86-2.78.62-3.37-1.21-3.37-1.21-.46-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .08 1.53 1.05 1.53 1.05.9 1.57 2.36 1.12 2.94.86.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.09 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 6.84c.85 0 1.71.12 2.51.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.96-2.34 4.82-4.57 5.08.36.32.68.95.68 1.92 0 1.39-.01 2.5-.01 2.84 0 .27.18.59.69.49A10.25 10.25 0 0 0 22 12.23C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

const ALL = "All";

export function WorkPage() {
  usePageMeta({
    title: "Work",
    description:
      "Selected projects and tools: local-first apps, observability, Bitcoin and Lightning payments, and market data.",
    canonical: absoluteUrl("/work"),
  });
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(ALL);
  const [tag, setTag] = useState(ALL);

  const statuses = useMemo(
    () => [
      ALL,
      ...Array.from(new Set(projects.map((p) => p.status).filter(Boolean))),
    ] as string[],
    [],
  );
  const tags = useMemo(
    () => [ALL, ...Array.from(new Set(projects.flatMap((p) => p.stack))).sort()],
    [],
  );

  const visible = projects.filter((p) => {
    if (status !== ALL && p.status !== status) return false;
    if (tag !== ALL && !p.stack.includes(tag)) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [p.title, p.summary, p.description, p.focus ?? "", ...p.stack]
      .join(" ")
      .toLowerCase()
      .includes(q);
  });

  const filtering = query !== "" || status !== ALL || tag !== ALL;

  function reset() {
    setQuery("");
    setStatus(ALL);
    setTag(ALL);
  }

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1.5 text-xs transition sm:text-sm ${
      active
        ? "border-white/30 bg-white text-black font-semibold"
        : "border-white/10 bg-white/4 text-neutral-300 hover:border-white/20 hover:bg-white/8 hover:text-white"
    }`;

  return (
    <section className="relative overflow-hidden py-12 sm:py-16 lg:py-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-130 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_42%)] sm:h-175 lg:h-212.5" />

      <Container>
        <div className="relative z-10">
          <div className="max-w-3xl">
            <p className="mb-3 text-[11px] uppercase tracking-[0.16em] text-neutral-400 sm:mb-4 sm:text-sm">
              Work
            </p>

            <h1 className="text-2xl font-semibold tracking-tight text-neutral-50 leading-[1.08] sm:text-4xl lg:text-6xl lg:leading-[1.05]">
              Selected projects and ongoing work.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-300 sm:mt-5 sm:text-base sm:leading-8 lg:text-lg">
              A selection of projects shaped by my interest in practical
              software, useful tools, Bitcoin and Lightning, privacy, and
              systems that are easier to understand and work with.
            </p>

            <a
              href="#tools"
              className="mt-5 inline-flex text-sm text-neutral-400 transition hover:text-white"
            >
              Jump to tools &amp; scripts ↓
            </a>
          </div>

          {/* Filters */}
          <div className="mt-10 space-y-4 sm:mt-12">
            <label className="block max-w-md">
              <span className="sr-only">Search projects</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects…"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-white/30 focus:outline-none"
              />
            </label>

            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="Filter by status"
            >
              {statuses.map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={status === s}
                  onClick={() => setStatus(s)}
                  className={chip(status === s)}
                >
                  {s}
                </button>
              ))}
            </div>

            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="Filter by technology"
            >
              {tags.map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={tag === t}
                  onClick={() => setTag(t)}
                  className={chip(tag === t)}
                >
                  {t}
                </button>
              ))}
            </div>

            <p className="text-sm text-neutral-500" role="status">
              {visible.length} of {projects.length} project
              {projects.length === 1 ? "" : "s"}
              {filtering ? (
                <button
                  type="button"
                  onClick={reset}
                  className="ml-3 text-neutral-300 underline underline-offset-4 hover:text-white"
                >
                  Clear filters
                </button>
              ) : null}
            </p>
          </div>

          {visible.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-white/10 p-8 text-center text-sm text-neutral-500">
              No projects match those filters.
            </div>
          ) : (
            <div className="mt-6 grid gap-5 sm:gap-6 md:grid-cols-2">
              {visible.map((project) => (
                <article
                  key={project.slug}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07] hover:shadow-[0_20px_60px_rgba(0,0,0,0.32)] sm:p-5 lg:p-6"
                >
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-16 left-8 h-40 w-40 rounded-full bg-sky-400/10 blur-3xl transition-all duration-300 group-hover:bg-sky-400/15" />
                    <div className="absolute bottom-0 right-0 h-32 w-32 rounded-full bg-violet-400/10 blur-3xl transition-all duration-300 group-hover:bg-violet-400/15" />
                  </div>

                  <div className="relative flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                      <ProjectLogo
                        title={project.title}
                        logo={project.logo}
                        className="h-12 w-12 sm:h-14 sm:w-14 sm:rounded-2xl"
                      />
                      <div className="min-w-0">
                        <h2 className="text-lg font-semibold tracking-tight text-neutral-100 sm:text-xl lg:text-2xl">
                          {project.title}
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-neutral-400 sm:text-base sm:leading-7">
                          {project.summary}
                        </p>
                      </div>
                    </div>
                    {project.status ? (
                      <div className="shrink-0">
                        <StatusBadge status={project.status} />
                      </div>
                    ) : null}
                  </div>

                  <div className="relative mt-5 flex flex-wrap gap-2">
                    {project.stack.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setTag(item)}
                        title={`Filter by ${item}`}
                        className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-neutral-300 transition hover:border-white/25 hover:text-white"
                      >
                        {item}
                      </button>
                    ))}
                  </div>

                  <div className="relative mt-auto flex flex-wrap items-center gap-3 pt-6 sm:gap-4">
                    <Link
                      to={`/work/${project.slug}`}
                      className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white px-4 py-2.5 text-sm text-black! font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:bg-neutral-200"
                    >
                      {project.release ? "Download & details" : "View project"}
                    </Link>

                    {project.githubUrl ? (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${project.title} GitHub repository`}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/4 text-neutral-300 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/8 hover:text-white"
                      >
                        <GitHubIcon />
                      </a>
                    ) : null}

                    {project.liveUrl ? (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium text-neutral-400 transition hover:text-white"
                      >
                        Live
                      </a>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}

          <ScriptsSection />
        </div>
      </Container>
    </section>
  );
}
