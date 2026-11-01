import { expect, it } from "vitest";
import { projects } from "./projects";
import projectsSource from "./projects.ts?raw";
import { extractProjectSlugs, renderSitemap } from "../lib/seo";

it("sitemap slug extraction matches the real projects list", () => {
  expect(extractProjectSlugs(projectsSource)).toEqual(projects.map((p) => p.slug));
});

it("adds extra paths to the sitemap", () => {
  const xml = renderSitemap("https://example.test", [], ["/work/a"]);
  expect(xml).toContain("<loc>https://example.test/work/a</loc>");
});
