import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadNotes } from "./notes";
import { noteMeta, renderPageHtml, renderRss, renderSitemap } from "../src/lib/seo";

let root: string;
let notesDir: string;
let draftsDir: string;

const note = (slug: string, extra = "", date: string | null = "2026-05-01") => `---
title: "Title ${slug}"
slug: ${slug}
description: "Description ${slug}"
${date ? `date: ${date}\n` : ""}category: Engineering
tags: [x]
${extra}---

Body ${slug}
`;

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "notes-"));
  notesDir = path.join(root, "notes");
  draftsDir = path.join(root, "drafts");
  fs.mkdirSync(notesDir);
  fs.mkdirSync(draftsDir);
});
afterEach(() => fs.rmSync(root, { recursive: true, force: true }));

const write = (dir: string, slug: string, text: string) =>
  fs.writeFileSync(path.join(dir, `${slug}.md`), text);

describe("loadNotes", () => {
  it("excludes drafts from production in both folders", () => {
    write(notesDir, "pub", note("pub", "draft: false\n"));
    write(notesDir, "hidden", note("hidden", "draft: true\n"));
    write(draftsDir, "wip", note("wip", "draft: true\n", null));
    const prod = loadNotes({ notesDir, draftsDir }, false);
    expect(prod.map((n) => n.slug)).toEqual(["pub"]);
    expect(JSON.stringify(prod)).not.toMatch(/wip|hidden/);
  });

  it("includes drafts for local development", () => {
    write(notesDir, "pub", note("pub"));
    write(draftsDir, "wip", note("wip", "draft: true\n", null));
    expect(loadNotes({ notesDir, draftsDir }, true).map((n) => n.slug).sort()).toEqual(["pub", "wip"]);
  });

  it("never reads the drafts folder for production builds", () => {
    write(draftsDir, "broken", "this is not a valid note");
    expect(() => loadNotes({ notesDir, draftsDir }, false)).not.toThrow();
  });

  it("fails loudly on a bad filename, misplaced draft or duplicate slug", () => {
    write(notesDir, "wrong-name", note("other"));
    expect(() => loadNotes({ notesDir, draftsDir }, false)).toThrow(/filename must match slug/);
    fs.rmSync(path.join(notesDir, "wrong-name.md"));

    write(draftsDir, "live", note("live", "draft: false\n"));
    expect(() => loadNotes({ notesDir, draftsDir }, true)).toThrow(/not marked draft/);
    fs.rmSync(path.join(draftsDir, "live.md"));

    write(notesDir, "dup", note("dup"));
    write(draftsDir, "dup", note("dup", "draft: true\n"));
    expect(() => loadNotes({ notesDir, draftsDir }, true)).toThrow(/Duplicate/);
  });

  it("ignores README.md", () => {
    fs.writeFileSync(path.join(notesDir, "README.md"), "# docs");
    expect(loadNotes({ notesDir, draftsDir }, false)).toEqual([]);
  });
});

describe("seo output", () => {
  const origin = "https://example.test";
  const shell = `<html><head><title>Elijah Mwambazi</title><meta name="description" content="generic"></head><body></body></html>`;

  it("bakes note metadata into the prerendered HTML", () => {
    write(notesDir, "pub", note("pub", 'updated: 2026-06-01\n'));
    const [n] = loadNotes({ notesDir, draftsDir }, false);
    const html = renderPageHtml(shell, noteMeta(n, origin));
    expect(html).toContain("<title>Title pub · Elijah Mwambazi</title>");
    expect(html).toContain('<link rel="canonical" href="https://example.test/notes/pub"');
    expect(html).toContain('property="og:type" content="article"');
    expect(html).toContain('property="article:modified_time" content="2026-06-01"');
    expect(html.match(/name="description"/g)).toHaveLength(1);
    expect(html).not.toContain("generic");
  });

  it("omits canonical and og:url without a configured origin", () => {
    write(notesDir, "pub", note("pub"));
    const [n] = loadNotes({ notesDir, draftsDir }, false);
    const html = renderPageHtml(shell, noteMeta(n));
    expect(html).not.toContain("canonical");
    expect(html).not.toContain("og:url");
  });

  it("escapes HTML in titles and descriptions", () => {
    write(notesDir, "pub", note("pub").replace('"Title pub"', `'A <b>"bold"</b> & more'`));
    const [n] = loadNotes({ notesDir, draftsDir }, false);
    const html = renderPageHtml(shell, noteMeta(n, origin));
    expect(html).not.toContain("<b>");
    expect(html).toContain("&lt;b&gt;&quot;bold&quot;&lt;/b&gt; &amp; more");
  });

  it("keeps drafts out of the sitemap and RSS feed", () => {
    write(notesDir, "pub", note("pub"));
    write(notesDir, "hidden", note("hidden", "draft: true\n"));
    write(draftsDir, "wip", note("wip", "draft: true\n", null));
    const notes = loadNotes({ notesDir, draftsDir }, false);
    const sitemap = renderSitemap(origin, notes);
    const rss = renderRss(origin, notes);
    expect(sitemap).toContain("/notes/pub");
    expect(sitemap + rss).not.toMatch(/hidden|wip/);
    expect(rss).toContain("<pubDate>Fri, 01 May 2026 00:00:00 GMT</pubDate>");
  });
});
