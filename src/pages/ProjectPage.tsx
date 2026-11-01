import { Link, useParams } from "react-router-dom";
import { projects } from "../content/projects";
import { usePageMeta } from "../hooks/usePageMeta";
import { absoluteUrl } from "../lib/site";
import { Container } from "../components/ui/Container";
import { StatusBadge } from "../components/ui/StatusBadge";
import { ProjectLogo } from "../components/ui/ProjectLogo";
import { DownloadPanel } from "../components/project/DownloadPanel";
import { ScreenshotGallery } from "../components/project/ScreenshotGallery";
import { InstallTabs } from "../components/project/InstallTabs";

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

function ExternalLinkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 5h5v5" />
      <path d="M10 14 19 5" />
      <path d="M19 14v5h-5" />
      <path d="M5 10V5h5" />
      <path d="M5 19h5" />
      <path d="M5 5l5 5" />
    </svg>
  );
}

export function ProjectPage() {
  const { slug } = useParams();
  const project = projects.find((item) => item.slug === slug);

  usePageMeta(
    project
      ? {
          title: project.title,
          description: project.summary,
          canonical: absoluteUrl(`/work/${project.slug}`),
        }
      : null,
  );

  if (!project) {
    return (
      <section className="py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="max-w-2xl">
            <p className="mb-4 text-xs uppercase tracking-[0.16em] text-neutral-400 sm:text-sm">
              Work
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-50 sm:text-4xl">
              Project not found
            </h1>
            <p className="mt-4 text-sm leading-7 text-neutral-400 sm:text-base sm:leading-8">
              The project you’re looking for doesn’t exist or hasn’t been added
              yet.
            </p>
            <Link
              to="/work"
              className="mt-8 inline-flex items-center justify-center rounded-xl border border-white/15 bg-white px-4 py-2.5 text-sm font-semibold text-black transition-all duration-200 hover:-translate-y-0.5 hover:bg-neutral-200"
            >
              Back to work
            </Link>
          </div>
        </Container>
      </section>
    );
  }

  const projectLinks = (project.links ?? []).filter(
    (link) => link.href !== project.githubUrl && link.href !== project.liveUrl,
  );
  const infoItems = [
    { label: "Type", value: project.type ?? "Software project" },
    {
      label: "Focus",
      value: project.focus ?? "Practical tooling and clear systems",
    },
    { label: "Stack", value: project.stack.join(" · ") },
    ...(project.requirements?.length
      ? [{ label: "Requirements", value: project.requirements.join(" · ") }]
      : []),
  ];

  const contentSections =
    project.overview && project.overview.length > 0
      ? project.overview
      : [
          {
            title: "What it is",
            body: `${project.title} is part of my broader interest in building tools that are useful in everyday practice and easier to reason about.`,
          },
        ];

  const currentIndex = projects.findIndex((p) => p.slug === project.slug);
  const next = projects[(currentIndex + 1) % projects.length];

  return (
    <section className="relative overflow-hidden py-12 sm:py-16 lg:py-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-130 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_42%)] sm:h-175 lg:h-212.5" />

      <Container>
        <div className="relative z-10">
          <Link
            to="/work"
            className="mb-6 inline-flex text-sm text-neutral-400 transition hover:text-white sm:mb-8"
          >
            ← Back to work
          </Link>

          {/* Hero + download */}
          <div className="grid items-start gap-8 sm:gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
            <div>
              <div className="flex items-start gap-3 sm:gap-4">
                <ProjectLogo
                  title={project.title}
                  logo={project.logo}
                  className="h-12 w-12 sm:h-16 sm:w-16 sm:rounded-2xl"
                />

                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-3 sm:mb-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-neutral-400 sm:text-sm">
                      {project.year ? `Project · ${project.year}` : "Project"}
                    </p>
                    {project.status ? (
                      <StatusBadge status={project.status} />
                    ) : null}
                  </div>

                  <h1 className="text-2xl font-semibold tracking-tight text-neutral-50 leading-[1.08] sm:text-4xl lg:text-6xl lg:leading-[1.05]">
                    {project.title}
                  </h1>

                  <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-300 sm:mt-5 sm:text-base sm:leading-8 lg:text-lg">
                    {project.summary}
                  </p>
                </div>
              </div>

              <p className="mt-6 max-w-3xl text-sm leading-7 text-neutral-400 sm:mt-8 sm:text-base sm:leading-8">
                {project.description}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-2 sm:mt-8 sm:gap-3">
                {project.stack.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-xs text-neutral-300 backdrop-blur-md sm:text-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-8 sm:gap-4">
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
                    className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white px-4 py-2.5 text-sm font-semibold text-black transition-all duration-200 hover:-translate-y-0.5 hover:bg-neutral-200"
                  >
                    View live
                  </a>
                ) : null}

                {projectLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-neutral-400 transition hover:text-white"
                  >
                    <ExternalLinkIcon />
                    <span>{link.label}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <DownloadPanel key={project.slug} project={project} />

              <div className="rounded-3xl border border-white/10 bg-white/3 p-4 sm:p-5 lg:p-6">
                <p className="mb-4 text-xs uppercase tracking-[0.16em] text-neutral-500">
                  Details
                </p>
                <dl className="space-y-4">
                  {infoItems.map((item) => (
                    <div key={item.label}>
                      <dt className="text-sm text-neutral-500">{item.label}</dt>
                      <dd className="mt-1 text-sm font-medium text-neutral-100 sm:text-base">
                        {item.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>

          {/* Screenshots */}
          {project.screenshots && project.screenshots.length > 0 ? (
            <div className="mt-12 sm:mt-14">
              <h2 className="mb-5 text-lg font-medium text-neutral-100 sm:text-xl">
                Screenshots
              </h2>
              <ScreenshotGallery
                shots={project.screenshots}
                title={project.title}
              />
            </div>
          ) : (
            <div className="mt-12 rounded-3xl border border-dashed border-white/10 p-6 text-center text-sm text-neutral-500 sm:mt-14">
              Screenshots coming soon.
            </div>
          )}

          {/* Features */}
          {project.features && project.features.length > 0 ? (
            <div className="mt-12 sm:mt-14">
              <h2 className="mb-5 text-lg font-medium text-neutral-100 sm:text-xl">
                Features
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {project.features.map((feature) => (
                  <div
                    key={feature.title}
                    className="rounded-2xl border border-white/10 bg-white/4 p-4 transition hover:border-white/20 hover:bg-white/6 sm:p-5"
                  >
                    <h3 className="text-base font-semibold text-neutral-100">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-neutral-400">
                      {feature.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Install */}
          {project.install && project.install.length > 0 ? (
            <div className="mt-12 rounded-3xl border border-white/10 bg-white/3 p-4 sm:mt-14 sm:p-5 lg:p-6">
              <h2 className="mb-5 text-lg font-medium text-neutral-100 sm:text-xl">
                Get started
              </h2>
              <InstallTabs items={project.install} />
            </div>
          ) : null}

          {/* Overview */}
          <div className="mt-12 grid gap-5 sm:mt-14 sm:gap-6 lg:grid-cols-2">
            {contentSections.map((section) => (
              <div
                key={section.title}
                className="rounded-3xl border border-white/10 bg-white/3 p-4 sm:p-5 lg:p-6"
              >
                <p className="mb-4 text-xs uppercase tracking-[0.16em] text-neutral-500">
                  {section.title}
                </p>
                <p className="text-sm leading-7 text-neutral-400 sm:text-base sm:leading-8">
                  {section.body}
                </p>
              </div>
            ))}
          </div>

          {/* FAQ */}
          {project.faq && project.faq.length > 0 ? (
            <div className="mt-12 sm:mt-14">
              <h2 className="mb-5 text-lg font-medium text-neutral-100 sm:text-xl">
                FAQ
              </h2>
              <div className="space-y-3">
                {project.faq.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-2xl border border-white/10 bg-white/4 px-4 py-3 open:bg-white/6 sm:px-5"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-neutral-100 sm:text-base [&::-webkit-details-marker]:hidden">
                      {item.question}
                      <span
                        aria-hidden="true"
                        className="text-neutral-500 transition group-open:rotate-45"
                      >
                        +
                      </span>
                    </summary>
                    <p className="mt-3 text-sm leading-7 text-neutral-400">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          ) : null}

          {next && next.slug !== project.slug ? (
            <div className="mt-14 border-t border-white/10 pt-8">
              <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">
                Next project
              </p>
              <Link
                to={`/work/${next.slug}`}
                className="mt-2 inline-flex text-xl font-semibold text-neutral-100 transition hover:text-white sm:text-2xl"
              >
                {next.title} →
              </Link>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
