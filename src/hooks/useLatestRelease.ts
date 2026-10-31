import { useEffect, useState } from "react";

export type ReleaseAsset = {
  name: string;
  size: number;
  url: string;
  downloads: number;
};

export type LatestRelease = {
  tag: string;
  name: string;
  prerelease: boolean;
  publishedAt: string;
  htmlUrl: string;
  body: string;
  assets: ReleaseAsset[];
};

type State =
  | { status: "loading" }
  | { status: "ready"; release: LatestRelease | null }
  | { status: "error" };

type GitHubRelease = {
  tag_name: string;
  name: string | null;
  prerelease: boolean;
  draft: boolean;
  published_at: string;
  html_url: string;
  body: string | null;
  assets: {
    name: string;
    size: number;
    browser_download_url: string;
    download_count: number;
  }[];
};

const CACHE_TTL_MS = 10 * 60 * 1000;

function readCache(key: string): LatestRelease | null | undefined {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as { at: number; data: LatestRelease | null };
    if (Date.now() - parsed.at > CACHE_TTL_MS) return undefined;
    return parsed.data;
  } catch {
    return undefined;
  }
}

function writeCache(key: string, data: LatestRelease | null) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), data }));
  } catch {
    // storage unavailable; ignore
  }
}

/**
 * Loads the newest published release (pre-releases included) for a GitHub
 * repo. Results are cached in sessionStorage to stay within the
 * unauthenticated API rate limit.
 */
export function useLatestRelease(repo: string | undefined): State {
  // Callers should remount (via `key`) when `repo` changes.
  const [state, setState] = useState<State>(() => {
    if (!repo) return { status: "ready", release: null };
    const cached = readCache(`release:${repo}`);
    return cached !== undefined
      ? { status: "ready", release: cached }
      : { status: "loading" };
  });

  useEffect(() => {
    if (!repo || readCache(`release:${repo}`) !== undefined) return;

    const key = `release:${repo}`;
    const controller = new AbortController();

    fetch(`https://api.github.com/repos/${repo}/releases?per_page=5`, {
      signal: controller.signal,
      headers: { Accept: "application/vnd.github+json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`GitHub responded ${res.status}`);
        return res.json() as Promise<GitHubRelease[]>;
      })
      .then((list) => {
        const latest = list.find((r) => !r.draft);
        const release: LatestRelease | null = latest
          ? {
              tag: latest.tag_name,
              name: latest.name || latest.tag_name,
              prerelease: latest.prerelease,
              publishedAt: latest.published_at,
              htmlUrl: latest.html_url,
              body: latest.body ?? "",
              assets: latest.assets.map((a) => ({
                name: a.name,
                size: a.size,
                url: a.browser_download_url,
                downloads: a.download_count,
              })),
            }
          : null;
        writeCache(key, release);
        setState({ status: "ready", release });
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setState({ status: "error" });
      });

    return () => controller.abort();
  }, [repo]);

  return state;
}
