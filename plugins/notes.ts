import fs from "node:fs";
import path from "node:path";
import type { Plugin, ResolvedConfig, ViteDevServer } from "vite";
import { parseNoteSource, type ParsedNote } from "../src/lib/notes/frontmatter";
import {
  noteMeta,
  renderPageHtml,
  renderRss,
  renderSitemap,
} from "../src/lib/seo";

const VIRTUAL_ID = "virtual:notes";
const RESOLVED_ID = "\0" + VIRTUAL_ID;

type Options = {
  /** Published notes. Files with `draft: true` here are still excluded from builds. */
  notesDir: string;
  /** Unpublished drafts. Never read during `vite build`. */
  draftsDir: string;
  /** Production site origin, e.g. https://example.com (no trailing slash). */
  siteOrigin?: string;
};

function readDir(dir: string): { file: string; source: string }[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f.toLowerCase() !== "readme.md")
    .sort()
    .map((f) => ({ file: path.join(dir, f), source: fs.readFileSync(path.join(dir, f), "utf8") }));
}

export function loadNotes(
  opts: Pick<Options, "notesDir" | "draftsDir">,
  includeDrafts: boolean,
): ParsedNote[] {
  const out: ParsedNote[] = [];
  const seen = new Set<string>();

  const add = (dir: string, inDraftsDir: boolean) => {
    for (const { file, source } of readDir(dir)) {
      const name = path.basename(file);
      const note = parseNoteSource(source, name);
      if (name !== `${note.slug}.md`) {
        throw new Error(`Note "${name}": filename must match slug "${note.slug}.md"`);
      }
      if (inDraftsDir && !note.draft) {
        throw new Error(`Note "${name}" is in the drafts folder but is not marked draft: true`);
      }
      if (seen.has(note.slug)) throw new Error(`Duplicate note slug "${note.slug}"`);
      seen.add(note.slug);
      // Drafts never enter a production build, wherever they live.
      if (note.draft && !includeDrafts) continue;
      out.push(note);
    }
  };

  add(opts.notesDir, false);
  if (includeDrafts) add(opts.draftsDir, true);
  return out;
}

export function notesPlugin(options: Options): Plugin {
  let config: ResolvedConfig;
  const origin = options.siteOrigin?.replace(/\/+$/, "");

  return {
    name: "portfolio-notes",
    configResolved(resolved) {
      config = resolved;
    },
    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : undefined;
    },
    load(id) {
      if (id !== RESOLVED_ID) return;
      const includeDrafts = config.command === "serve";
      const notes = loadNotes(options, includeDrafts);
      return `export default ${JSON.stringify(notes)};`;
    },
    configureServer(server: ViteDevServer) {
      server.watcher.add([options.notesDir, options.draftsDir]);
      const reload = (file: string) => {
        if (!file.endsWith(".md")) return;
        const inside = [options.notesDir, options.draftsDir].some((d) =>
          path.resolve(file).startsWith(path.resolve(d)),
        );
        if (!inside) return;
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: "full-reload" });
      };
      server.watcher.on("add", reload);
      server.watcher.on("change", reload);
      server.watcher.on("unlink", reload);
    },
    transformIndexHtml() {
      if (config.command !== "build" || !origin) return;
      return [
        {
          tag: "link",
          attrs: { rel: "alternate", type: "application/rss+xml", title: "Notes", href: "/rss.xml" },
          injectTo: "head",
        },
      ];
    },
    closeBundle: {
      order: "post",
      handler() {
        if (config.command !== "build") return;
        const outDir = path.resolve(config.root, config.build.outDir);
        const indexPath = path.join(outDir, "index.html");
        if (!fs.existsSync(indexPath)) return;

        const template = fs.readFileSync(indexPath, "utf8");
        const notes = loadNotes(options, false).sort((a, b) =>
          a.date! < b.date! ? 1 : -1,
        );

        // Per-note HTML so crawlers that don't run JS see the right metadata.
        for (const note of notes) {
          const dir = path.join(outDir, "notes", note.slug);
          fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(
            path.join(dir, "index.html"),
            renderPageHtml(template, noteMeta(note, origin)),
          );
        }

        if (origin) {
          fs.writeFileSync(path.join(outDir, "sitemap.xml"), renderSitemap(origin, notes));
          fs.writeFileSync(path.join(outDir, "rss.xml"), renderRss(origin, notes.slice(0, 20)));
        } else {
          config.logger.warn(
            "[notes] VITE_SITE_URL is not set: skipped sitemap.xml, rss.xml and canonical URLs.",
          );
        }
      },
    },
  };
}
