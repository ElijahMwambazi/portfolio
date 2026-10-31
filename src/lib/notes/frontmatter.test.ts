import { describe, expect, it } from "vitest";
import { NoteParseError, parseNoteSource } from "./frontmatter";

const valid = `---
title: "A title"
slug: a-title
description: "A description"
date: 2026-04-21
category: Engineering
tags: [One, two]
featured: true
draft: false
---

Hello **world**.
`;

describe("parseNoteSource", () => {
  it("parses valid frontmatter and body", () => {
    const note = parseNoteSource(valid, "a-title.md");
    expect(note).toMatchObject({
      title: "A title",
      slug: "a-title",
      date: "2026-04-21",
      category: "Engineering",
      tags: ["one", "two"],
      featured: true,
      draft: false,
      body: "Hello **world**.",
    });
  });

  it("handles CRLF line endings and a BOM", () => {
    const note = parseNoteSource("﻿" + valid.replace(/\n/g, "\r\n"), "x.md");
    expect(note.title).toBe("A title");
    expect(note.body).toBe("Hello **world**.");
  });

  it("keeps date-like values as strings (no timezone shift)", () => {
    expect(parseNoteSource(valid, "x.md").date).toBe("2026-04-21");
  });

  it("allows drafts without a date but requires one when published", () => {
    const noDate = valid.replace("date: 2026-04-21\n", "");
    expect(() => parseNoteSource(noDate, "x.md")).toThrow(/"date" is required/);
    const draft = noDate.replace("draft: false", "draft: true");
    expect(parseNoteSource(draft, "x.md").date).toBeUndefined();
  });

  it("rejects missing frontmatter", () => {
    expect(() => parseNoteSource("# just markdown", "x.md")).toThrow(NoteParseError);
  });

  it("reports every problem, including unknown fields", () => {
    const bad = valid
      .replace("category: Engineering", "category: Nope")
      .replace("date: 2026-04-21", "date: 2026-13-45")
      .replace("featured: true", "featured: true\nautor: me");
    let message = "";
    try {
      parseNoteSource(bad, "bad.md");
    } catch (e) {
      message = (e as Error).message;
    }
    expect(message).toMatch(/bad\.md/);
    expect(message).toMatch(/"category" must be one of/);
    expect(message).toMatch(/"date" must be a real/);
    expect(message).toMatch(/unknown field "autor"/);
  });

  it("rejects invalid slugs and an updated date before the publication date", () => {
    expect(() => parseNoteSource(valid.replace("slug: a-title", "slug: Bad_Slug"), "x.md")).toThrow(/slug/);
    expect(() => parseNoteSource(valid.replace("draft: false", "draft: false\nupdated: 2026-01-01"), "x.md")).toThrow(/updated/);
  });

  it("rejects an empty body", () => {
    expect(() => parseNoteSource(valid.replace(/\n\nHello[\s\S]*$/, "\n"), "x.md")).toThrow(/body is empty/);
  });
});
