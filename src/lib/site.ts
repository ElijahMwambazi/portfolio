import { siteConfig } from "../content/site";

/** Production origin from VITE_SITE_URL, without a trailing slash. */
export const siteOrigin: string | undefined =
  import.meta.env.VITE_SITE_URL?.replace(/\/+$/, "") || undefined;

export function absoluteUrl(path: string): string | undefined {
  return siteOrigin ? `${siteOrigin}${path}` : undefined;
}

export const siteName = siteConfig.name;
