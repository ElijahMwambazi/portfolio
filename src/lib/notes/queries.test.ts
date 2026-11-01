import { describe, expect, it } from "vitest";
import { fixtureNotes } from "../../test/fixtures";
import { readingMinutes } from "./reading";
import { extractHeadings } from "./headings";
import { createNotesStore } from "./createStore";
import { adjacentNotes, allTags, filterNotes, relatedNotes, sortNewestFirst, toNote } from "./queries";

const published = createNotesStore(fixtureNotes, { includeDrafts: false }).published;

describe("reading time", () => {
  it("is at least one minute and scales with length", () => {
    expect(readingMinutes("short")).toBe(1);
    expect(readingMinutes("word ".repeat(1100))).toBe(5);
  });
  it("ignores fenced code", () => {
    expect(readingMinutes("```\n" + "x ".repeat(5000) + "\n```\nhi")).toBe(1);
  });
});

describe("extractHeadings", () => {
  it("returns h2/h3 with github-style unique ids", () => {
    const md = "# Title\n\n## Setup\n\n### `code` bit\n\n## Setup\n\n#### skipped";
    expect(extractHeadings(md)).toEqual([
      { id: "setup", text: "Setup", depth: 2 },
      { id: "code-bit", text: "code bit", depth: 3 },
      { id: "setup-1", text: "Setup", depth: 2 },
    ]);
  });
  it("ignores headings inside code fences", () => {
    expect(extractHeadings("```md\n## nope\n```\n\n## yes")).toHaveLength(1);
  });
});

describe("sorting and drafts", () => {
  it("sorts newest first", () => {
    expect(published.map((n) => n.slug)).toEqual([
      "beta-on-fedora",
      "alpha-on-lightning",
      "gamma-tooling",
    ]);
  });

  it("excludes drafts everywhere when drafts are disabled", () => {
    const store = createNotesStore(fixtureNotes, { includeDrafts: false });
    expect(store.published.some((n) => n.draft)).toBe(false);
    expect(store.drafts).toEqual([]);
    expect(store.find("secret-draft")).toBeUndefined();
    const json = JSON.stringify([store.published, store.related(store.published[0])]);
    expect(json).not.toContain("SECRET-DRAFT");
  });

  it("only exposes drafts when explicitly enabled, never in related/adjacent", () => {
    const store = createNotesStore(fixtureNotes, { includeDrafts: true });
    expect(store.published.some((n) => n.draft)).toBe(false);
    const draft = store.find("secret-draft")!;
    expect(draft.draft).toBe(true);
    expect(store.related(store.published[0]).some((n) => n.draft)).toBe(false);
    expect(store.adjacent(draft)).toEqual({ newer: undefined, older: undefined });
  });

  it("places undated drafts last", () => {
    const sorted = sortNewestFirst(fixtureNotes.map(toNote));
    expect(sorted.at(-1)!.slug).toBe("secret-draft");
  });
});

describe("filterNotes", () => {
  it("searches title, description and tags", () => {
    expect(filterNotes(published, { query: "fedora" })).toHaveLength(1);
    expect(filterNotes(published, { query: "routing payments" })).toHaveLength(1);
    expect(filterNotes(published, { query: "LIGHTNING" })).toHaveLength(1);
    expect(filterNotes(published, { query: "nothing-like-this" })).toHaveLength(0);
  });
  it("filters by category and tag and combines them", () => {
    expect(filterNotes(published, { category: "Infrastructure" }).map((n) => n.slug)).toEqual(["beta-on-fedora"]);
    expect(filterNotes(published, { tag: "tooling" })).toHaveLength(2);
    expect(filterNotes(published, { tag: "tooling", category: "Engineering" }).map((n) => n.slug)).toEqual(["gamma-tooling"]);
  });
  it("lists unique sorted tags", () => {
    expect(allTags(published)).toEqual(["bitcoin", "lightning", "linux", "tooling"]);
  });
});

describe("related and adjacent", () => {
  it("ranks by shared tags then category and excludes the note itself", () => {
    const alpha = published.find((n) => n.slug === "alpha-on-lightning")!;
    const related = relatedNotes(published, alpha);
    expect(related.map((n) => n.slug)).toEqual(["gamma-tooling"]);
  });
  it("returns newer/older neighbours", () => {
    expect(adjacentNotes(published, "alpha-on-lightning")).toMatchObject({
      newer: { slug: "beta-on-fedora" },
      older: { slug: "gamma-tooling" },
    });
    expect(adjacentNotes(published, "nope")).toEqual({ newer: undefined, older: undefined });
  });
});
