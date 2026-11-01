import type { ParsedNote } from "./notes/frontmatter";

export type PageMeta = {
  title: string;
  description: string;
  /** Absolute canonical URL; omitted when no site origin is configured. */
  canonical?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  /** Adds `robots: noindex`; used for genuine not-found screens. */
  noindex?: boolean;
};

export const SITE_NAME = "Elijah Mwambazi";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function pageTitle(title: string): string {
  return title === SITE_NAME ? title : `${title} · ${SITE_NAME}`;
}

/** Tags shared by the build-time prerender and the client-side hook. */
export function metaTags(meta: PageMeta): { attrs: Record<string, string> }[] {
  const type = meta.type ?? "website";
  const tags: Record<string, string>[] = [
    { name: "description", content: meta.description },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:type", content: type },
    { property: "og:title", content: meta.title },
    { property: "og:description", content: meta.description },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: meta.title },
    { name: "twitter:description", content: meta.description },
  ];
  if (meta.noindex) tags.push({ name: "robots", content: "noindex" });
  if (meta.canonical) tags.push({ property: "og:url", content: meta.canonical });
  if (type === "article") {
    if (meta.publishedTime)
      tags.push({ property: "article:published_time", content: meta.publishedTime });
    if (meta.modifiedTime)
      tags.push({ property: "article:modified_time", content: meta.modifiedTime });
    for (const tag of meta.tags ?? [])
      tags.push({ property: "article:tag", content: tag });
  }
  return tags.map((attrs) => ({ attrs }));
}

export function renderHeadHtml(meta: PageMeta): string {
  const lines = metaTags(meta).map(({ attrs }) => {
    const attributes = Object.entries(attrs)
      .map(([k, v]) => `${k}="${escapeHtml(v)}"`)
      .join(" ");
    return `    <meta ${attributes} data-seo />`;
  });
  if (meta.canonical)
    lines.push(`    <link rel="canonical" href="${escapeHtml(meta.canonical)}" data-seo />`);
  return lines.join("\n");
}

/** Returns the SPA shell with this page's title and metadata baked in. */
export function renderPageHtml(template: string, meta: PageMeta): string {
  const withTitle = template.replace(
    /<title>[\s\S]*?<\/title>/,
    () => `<title>${escapeHtml(pageTitle(meta.title))}</title>`,
  );
  // Drop the shell's generic description so there is a single one.
  const cleaned = withTitle.replace(/\s*<meta name="description"[^>]*>/g, "");
  return cleaned.replace("</head>", () => `${renderHeadHtml(meta)}\n  </head>`);
}

export function noteMeta(note: ParsedNote, origin?: string): PageMeta {
  return {
    title: note.title,
    description: note.description,
    canonical: origin ? `${origin}/notes/${note.slug}` : undefined,
    type: "article",
    publishedTime: note.date,
    modifiedTime: note.updated ?? note.date,
    tags: note.tags,
  };
}

export function renderSitemap(
  origin: string,
  notes: ParsedNote[],
  extraPaths: string[] = [],
): string {
  const urls = [
    { loc: `${origin}/` },
    { loc: `${origin}/work` },
    { loc: `${origin}/notes` },
    ...extraPaths.map((p) => ({ loc: `${origin}${p}` })),
    ...notes.map((n) => ({
      loc: `${origin}/notes/${n.slug}`,
      lastmod: n.updated ?? n.date,
    })),
  ];
  const body = urls
    .map(
      (u) =>
        `  <url><loc>${escapeHtml(u.loc)}</loc>${
          "lastmod" in u && u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""
        }</url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

export function renderRss(origin: string, notes: ParsedNote[]): string {
  const items = notes
    .map((n) => {
      const link = `${origin}/notes/${n.slug}`;
      return `    <item>
      <title>${escapeHtml(n.title)}</title>
      <link>${escapeHtml(link)}</link>
      <guid isPermaLink="true">${escapeHtml(link)}</guid>
      <pubDate>${new Date(`${n.date}T00:00:00Z`).toUTCString()}</pubDate>
      <description>${escapeHtml(n.description)}</description>
${n.tags.map((t) => `      <category>${escapeHtml(t)}</category>`).join("\n")}
    </item>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeHtml(SITE_NAME)} — Notes</title>
    <link>${escapeHtml(origin)}/notes</link>
    <description>Engineering notes and field reports.</description>
${items}
  </channel>
</rss>
`;
}

/**
 * Reads `slug: "..."` from the top-level project entries in projects.ts.
 * The file imports image assets, so it can't be imported from the Node-side build plugin;
 * a test checks this stays in sync with the real `projects` export.
 */
export function extractProjectSlugs(source: string): string[] {
  return [...source.matchAll(/^ {4}slug: "([^"]+)"/gm)].map((m) => m[1]);
}
