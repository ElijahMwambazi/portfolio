import type { ParsedNote } from "../lib/notes/frontmatter";

const base = {
  featured: false,
  draft: false,
} as const;

export const fixtureNotes: ParsedNote[] = [
  {
    ...base,
    title: "Alpha on Lightning",
    slug: "alpha-on-lightning",
    description: "Notes about routing payments.",
    date: "2026-03-01",
    category: "Bitcoin & Finance",
    tags: ["bitcoin", "lightning"],
    featured: true,
    body: "Intro paragraph.\n\n## First part\n\nText.\n\n## Second part\n\nMore.",
  },
  {
    ...base,
    title: "Beta on Fedora",
    slug: "beta-on-fedora",
    description: "Setting up a workstation.",
    date: "2026-04-01",
    category: "Infrastructure",
    tags: ["linux", "tooling"],
    body: "Body of beta.",
  },
  {
    ...base,
    title: "Gamma tooling",
    slug: "gamma-tooling",
    description: "Thoughts on tools.",
    date: "2026-02-01",
    category: "Engineering",
    tags: ["tooling", "bitcoin"],
    body: "Body of gamma.",
  },
  {
    ...base,
    title: "Secret draft",
    slug: "secret-draft",
    description: "SECRET-DRAFT-DESCRIPTION",
    category: "Engineering",
    tags: ["bitcoin", "tooling"],
    draft: true,
    body: "SECRET-DRAFT-BODY",
  },
];
