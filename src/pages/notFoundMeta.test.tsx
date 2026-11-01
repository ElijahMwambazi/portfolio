import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { NotFoundPage } from "./NotFoundPage";
import { NotePage } from "./NotePage";
import { ProjectPage } from "./ProjectPage";
import { RouteErrorPage } from "./RouteErrorPage";
import { notesStore } from "../lib/notes/store";

const robots = () =>
  document.head.querySelector('meta[name="robots"]')?.getAttribute("content") ?? null;

function renderAt(path: string, routes: Parameters<typeof createMemoryRouter>[0]) {
  render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: [path] })} />);
}

beforeEach(() => {
  document.head.innerHTML = "";
});

describe("noindex on genuine not-found screens", () => {
  it("unmatched URL", async () => {
    renderAt("/nope", [{ path: "*", element: <NotFoundPage /> }]);
    await screen.findByRole("heading", { name: "Page not found" });
    expect(robots()).toBe("noindex");
  });

  it("unmatched URL handled by the router error boundary", async () => {
    renderAt("/nope", [{ path: "/", element: <div />, errorElement: <RouteErrorPage /> }]);
    await screen.findByRole("heading", { name: "Page not found" });
    expect(robots()).toBe("noindex");
  });

  it("unknown note", async () => {
    renderAt("/notes/missing", [{ path: "/notes/:slug", element: <NotePage /> }]);
    await screen.findByRole("heading", { name: "Note not found" });
    expect(robots()).toBe("noindex");
  });

  it("unknown project", async () => {
    renderAt("/work/missing", [{ path: "/work/:slug", element: <ProjectPage /> }]);
    await screen.findByRole("heading", { name: "Project not found" });
    expect(robots()).toBe("noindex");
  });

  it("is not set on a real note", async () => {
    const slug = notesStore.published[0].slug;
    renderAt(`/notes/${slug}`, [{ path: "/notes/:slug", element: <NotePage /> }]);
    await screen.findByRole("heading", { level: 1 });
    expect(robots()).toBeNull();
  });
});
