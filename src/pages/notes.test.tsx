import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

vi.mock("virtual:notes", async () => ({
  default: (await import("../test/fixtures")).fixtureNotes,
}));

async function setup(
  path: string,
  env: { dev?: boolean; siteUrl?: string } = {},
) {
  vi.resetModules();
  vi.stubEnv("DEV", env.dev ?? false);
  vi.stubEnv("VITE_SITE_URL", env.siteUrl ?? "");
  const { NotesPage } = await import("./NotesPage");
  const { NotePage } = await import("./NotePage");
  const router = createMemoryRouter(
    [
      { path: "/notes", element: <NotesPage /> },
      { path: "/notes/:slug", element: <NotePage /> },
    ],
    { initialEntries: [path] },
  );
  render(<RouterProvider router={router} />);
  return { router, user: userEvent.setup() };
}

const cardTitles = () =>
  screen
    .getAllByRole("heading", { level: 3 })
    .map((h) => h.textContent);

beforeEach(() => {
  document.head.innerHTML = "";
  document.title = "Elijah Mwambazi";
});
afterEach(() => vi.unstubAllEnvs());

describe("Notes index", () => {
  it("lists published notes newest first, featured separately, without duplicates", async () => {
    await setup("/notes");
    expect(screen.getByRole("heading", { name: "Featured" })).toBeInTheDocument();
    const titles = cardTitles();
    expect(titles).toEqual(["Alpha on Lightning", "Beta on Fedora", "Gamma tooling"]);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("never shows drafts in production mode", async () => {
    await setup("/notes");
    expect(screen.queryByText(/Secret draft/)).toBeNull();
    expect(screen.queryByText(/SECRET-DRAFT/)).toBeNull();
    expect(screen.queryByText(/Local drafts/)).toBeNull();
  });

  it("shows drafts only in a clearly marked local section in dev", async () => {
    await setup("/notes", { dev: true });
    const section = screen.getByRole("heading", { name: "Local drafts" }).parentElement!;
    expect(within(section).getByText("Secret draft")).toBeInTheDocument();
  });

  it("filters by search text", async () => {
    const { user } = await setup("/notes");
    await user.type(screen.getByRole("searchbox", { name: /search notes/i }), "fedora");
    expect(cardTitles()).toEqual(["Beta on Fedora"]);
    expect(screen.getByRole("status")).toHaveTextContent("1 of 3 notes");
  });

  it("filters by category and tag, and clears", async () => {
    const { user, router } = await setup("/notes");
    const categories = screen.getByRole("group", { name: "Filter by category" });
    await user.click(within(categories).getByRole("button", { name: "Infrastructure" }));
    expect(cardTitles()).toEqual(["Beta on Fedora"]);
    expect(router.state.location.search).toBe("?category=Infrastructure");

    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    const tags = screen.getByRole("group", { name: "Filter by tag" });
    await user.click(within(tags).getByRole("button", { name: "tooling" }));
    expect(cardTitles()).toEqual(["Beta on Fedora", "Gamma tooling"]);
  });

  it("restores filters from the URL and shows an empty state", async () => {
    await setup("/notes?q=zzzz");
    expect(screen.getByText("No notes match those filters.")).toBeInTheDocument();
  });

  it("clicking a card tag filters by it", async () => {
    const { user } = await setup("/notes");
    const card = screen.getByRole("heading", { name: "Gamma tooling" }).closest("article")!;
    await user.click(within(card).getByRole("button", { name: "tooling" }));
    expect(cardTitles()).toEqual(["Beta on Fedora", "Gamma tooling"]);
  });
});

describe("Note article page", () => {
  it("renders an article with TOC, tags, reading time and neighbours", async () => {
    await setup("/notes/alpha-on-lightning");
    expect(screen.getByRole("heading", { level: 1, name: "Alpha on Lightning" })).toBeInTheDocument();
    expect(screen.getAllByText(/1 min read/)[0]).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /First part/ })).toHaveAttribute("id", "first-part");
    expect(screen.getAllByRole("link", { name: "First part" })[0]).toHaveAttribute("href", "#first-part");
    expect(screen.getByRole("link", { name: "lightning" })).toHaveAttribute("href", "/notes?tag=lightning");
    const nav = screen.getByRole("navigation", { name: "More notes" });
    expect(within(nav).getByRole("link", { name: /Gamma tooling/ })).toHaveAttribute("href", "/notes/gamma-tooling");
    expect(within(nav).getByRole("link", { name: /Beta on Fedora/ })).toHaveAttribute("href", "/notes/beta-on-fedora");
  });

  it("lists related notes by shared tags without drafts", async () => {
    await setup("/notes/alpha-on-lightning");
    const related = screen.getByRole("heading", { name: "Related notes" }).parentElement!;
    expect(within(related).getByText("Gamma tooling")).toBeInTheDocument();
    expect(screen.queryByText("Secret draft")).toBeNull();
  });

  it("shows not-found for unknown slugs and for drafts in production", async () => {
    await setup("/notes/nope");
    expect(screen.getByRole("heading", { name: "Note not found" })).toBeInTheDocument();
  });

  it("does not resolve a draft slug in production", async () => {
    await setup("/notes/secret-draft");
    expect(screen.getByRole("heading", { name: "Note not found" })).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("SECRET-DRAFT");
  });

  it("previews a draft in dev with a banner and no SEO metadata", async () => {
    await setup("/notes/secret-draft", { dev: true });
    expect(screen.getByText(/Draft preview/)).toBeInTheDocument();
    expect(document.head.querySelector('meta[name="description"]')).toBeNull();
  });
});

describe("SPA metadata", () => {
  const meta = (selector: string) =>
    document.head.querySelector(selector)?.getAttribute("content") ??
    document.head.querySelector(selector)?.getAttribute("href");

  it("updates title and tags per route and cleans up on leaving", async () => {
    const { router } = await setup("/notes/alpha-on-lightning", {
      siteUrl: "https://example.test/",
    });
    expect(document.title).toBe("Alpha on Lightning · Elijah Mwambazi");
    expect(meta('meta[name="description"]')).toBe("Notes about routing payments.");
    expect(meta('link[rel="canonical"]')).toBe("https://example.test/notes/alpha-on-lightning");
    expect(meta('meta[property="og:type"]')).toBe("article");
    expect(meta('meta[property="article:published_time"]')).toBe("2026-03-01");

    await router.navigate("/notes/beta-on-fedora");
    await screen.findByRole("heading", { level: 1, name: "Beta on Fedora" });
    await waitFor(() => expect(document.title).toBe("Beta on Fedora · Elijah Mwambazi"));
    expect(meta('meta[name="description"]')).toBe("Setting up a workstation.");
    expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1);
    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);

    await router.navigate("/notes");
    await screen.findByRole("heading", { level: 1, name: /Notes, ideas/ });
    await waitFor(() => expect(document.title).toBe("Notes · Elijah Mwambazi"));
    expect(meta('meta[property="og:type"]')).toBe("website");
    expect(document.head.querySelector('meta[property="article:published_time"]')).toBeNull();
  });

  it("omits canonical and og:url when no site origin is configured", async () => {
    await setup("/notes/alpha-on-lightning");
    expect(document.head.querySelector('link[rel="canonical"]')).toBeNull();
    expect(document.head.querySelector('meta[property="og:url"]')).toBeNull();
  });
});
