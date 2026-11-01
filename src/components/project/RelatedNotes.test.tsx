import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { RelatedNotes } from "./RelatedNotes";
import { toNote } from "../../lib/notes/queries";
import { projects } from "../../content/projects";
import { fixtureNotes } from "../../test/fixtures";

const notes = fixtureNotes.map(toNote);
const published = notes.filter((n) => !n.draft && n.date);

const show = (slugs: string[] | undefined) =>
  render(
    <MemoryRouter>
      <RelatedNotes slugs={slugs} published={published} />
    </MemoryRouter>,
  );

describe("RelatedNotes", () => {
  it("links published notes only", () => {
    const pub = published[0];
    const draft = notes.find((n) => n.draft)!;
    show([pub.slug, draft.slug, "does-not-exist"]);
    expect(screen.getByRole("heading", { name: "Related engineering notes" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: pub.title })).toHaveAttribute("href", `/notes/${pub.slug}`);
    expect(screen.queryByText(draft.title)).not.toBeInTheDocument();
  });

  it("renders nothing when no referenced note is published", () => {
    const draft = notes.find((n) => n.draft)!;
    const { container } = show([draft.slug]);
    expect(container).toBeEmptyDOMElement();
    expect(show(undefined).container).toBeEmptyDOMElement();
  });
});

describe("project → note references", () => {
  it("every relatedNotes slug has a note or draft file", () => {
    const files = Object.keys(
      import.meta.glob("../../content/{notes,drafts}/*.md", { query: "?raw" }),
    ).map((f) => f.split("/").pop()!.replace(/\.md$/, ""));
    const referenced = projects.flatMap((p) => p.relatedNotes ?? []);
    expect(referenced.length).toBeGreaterThan(0);
    for (const slug of referenced) expect(files).toContain(slug);
  });
});
