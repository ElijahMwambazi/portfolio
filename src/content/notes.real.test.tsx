import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { NotePage } from "../pages/NotePage";
import { NotesPage } from "../pages/NotesPage";

// Uses the real content in src/content/notes (no mocks).
const ORIGINAL_URLS = [
  ["why-this-site-exists", "Why this site exists"],
  ["why-i-use-polar-for-bitcoin-and-lightning-prototyping", "Why I use Polar for Bitcoin and Lightning prototyping"],
  ["notes-on-useful-tools", "Notes on useful tools"],
] as const;

describe("existing note URLs", () => {
  for (const [slug, title] of ORIGINAL_URLS) {
    it(`/notes/${slug} still renders`, () => {
      const router = createMemoryRouter([{ path: "/notes/:slug", element: <NotePage /> }], {
        initialEntries: [`/notes/${slug}`],
      });
      render(<RouterProvider router={router} />);
      expect(screen.getByRole("heading", { level: 1, name: title })).toBeInTheDocument();
    });
  }

  it("lists all three on the index", () => {
    const router = createMemoryRouter([{ path: "/notes", element: <NotesPage /> }], {
      initialEntries: ["/notes"],
    });
    render(<RouterProvider router={router} />);
    for (const [, title] of ORIGINAL_URLS) {
      expect(screen.getAllByRole("heading", { name: title }).length).toBeGreaterThan(0);
    }
  });
});
