import { useMemo, useState } from "react";
import type { Platform, Project } from "../../types/project";
import { formatBytes, formatDate } from "../../lib/format";
import {
  detectPlatform,
  isChecksumAsset,
  platformFromAsset,
  platformLabels,
} from "../../lib/platform";
import { useLatestRelease } from "../../hooks/useLatestRelease";

export function DownloadPanel({ project }: { project: Project }) {
  const releaseState = useLatestRelease(project.release?.repo);
  const [userPlatform] = useState<Platform>(() => detectPlatform());
  const [showAll, setShowAll] = useState(false);

  const release =
    releaseState.status === "ready" ? releaseState.release : null;

  const { downloads, checksums } = useMemo(() => {
    const assets = release?.assets ?? [];
    return {
      downloads: assets
        .filter((a) => !isChecksumAsset(a.name))
        .map((a) => ({ ...a, platform: platformFromAsset(a.name) })),
      checksums: assets.find((a) => isChecksumAsset(a.name)),
    };
  }, [release]);

  const recommended = downloads.find((d) => d.platform === userPlatform);
  const others = downloads.filter((d) => d !== recommended);

  const repoUrl = project.githubUrl;
  const releasesUrl = project.release
    ? `https://github.com/${project.release.repo}/releases`
    : undefined;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl sm:p-5 lg:p-6">
      <p className="mb-4 text-xs uppercase tracking-[0.16em] text-neutral-500">
        Download
      </p>

      {releaseState.status === "loading" && project.release ? (
        <div className="space-y-3" aria-busy="true">
          <div className="h-12 animate-pulse rounded-xl bg-white/8" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-white/6" />
        </div>
      ) : null}

      {releaseState.status === "error" ? (
        <div>
          <p className="text-sm leading-7 text-neutral-400">
            Couldn’t load the latest release from GitHub right now.
          </p>
          {releasesUrl ? (
            <a
              href={releasesUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex rounded-xl border border-white/15 bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:bg-neutral-200"
            >
              Open releases on GitHub
            </a>
          ) : null}
        </div>
      ) : null}

      {releaseState.status === "ready" && !release ? (
        <div>
          <p className="text-sm leading-7 text-neutral-300">
            {project.release
              ? "No release has been published yet."
              : "No prebuilt download yet — run it from source."}
          </p>
          {repoUrl ? (
            <a
              href={repoUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex rounded-xl border border-white/15 bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:bg-neutral-200"
            >
              View source on GitHub
            </a>
          ) : null}
        </div>
      ) : null}

      {release ? (
        <div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold text-neutral-100">
              {release.tag}
            </span>
            {release.prerelease ? (
              <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[11px] uppercase tracking-[0.12em] text-amber-200">
                Pre-release
              </span>
            ) : null}
            <span className="text-neutral-500">
              {formatDate(release.publishedAt)}
            </span>
          </div>

          {recommended ? (
            <a
              href={recommended.url}
              className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-white/15 bg-white px-4 py-3 text-black transition hover:-translate-y-0.5 hover:bg-neutral-200"
            >
              <span className="text-sm font-semibold">
                Download for {platformLabels[recommended.platform]}
              </span>
              <span className="text-xs text-neutral-600">
                {formatBytes(recommended.size)}
              </span>
            </a>
          ) : (
            <p className="mt-4 text-sm leading-7 text-neutral-400">
              No build for {platformLabels[userPlatform]} in this release. See
              the options below.
            </p>
          )}

          {others.length > 0 ? (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                aria-expanded={showAll}
                className="text-sm text-neutral-400 transition hover:text-white"
              >
                {showAll ? "Hide" : "Show"}{" "}
                {recommended ? "other platforms" : "all downloads"}
              </button>

              {showAll || !recommended ? (
                <ul className="mt-3 space-y-2">
                  {others.map((d) => (
                    <li key={d.name}>
                      <a
                        href={d.url}
                        className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-neutral-200 transition hover:border-white/20 hover:bg-white/8"
                      >
                        <span className="min-w-0">
                          <span className="font-medium">
                            {platformLabels[d.platform]}
                          </span>
                          <span className="ml-2 block truncate text-xs text-neutral-500 sm:inline">
                            {d.name}
                          </span>
                        </span>
                        <span className="shrink-0 text-xs text-neutral-500">
                          {formatBytes(d.size)}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {checksums ? (
              <a
                href={checksums.url}
                className="text-neutral-400 transition hover:text-white"
              >
                SHA-256 checksums
              </a>
            ) : null}
            <a
              href={release.htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="text-neutral-400 transition hover:text-white"
            >
              Release notes
            </a>
          </div>
        </div>
      ) : null}

      {project.notice ? (
        <p className="mt-5 rounded-xl border border-amber-400/20 bg-amber-400/5 p-3 text-xs leading-6 text-amber-100/80">
          {project.notice}
        </p>
      ) : null}
    </div>
  );
}
