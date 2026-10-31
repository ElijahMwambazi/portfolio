import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MarkdownContent } from "./MarkdownContent";
import { extractHeadings } from "../../lib/notes/headings";

const renderMd = (markdown: string) =>
  render(
    <MemoryRouter>
      <MarkdownContent markdown={markdown} />
    </MemoryRouter>,
  );

const sample = `
Intro with [external](https://example.com) and [internal](/notes) and \`inline\`.

## First heading

1. one
2. two

- a
- b

> quoted

### Sub heading

\`\`\`bash
yarn install
\`\`\`

![diagram](https://example.com/x.png)

## First heading
`;

describe("MarkdownContent", () => {
  it("renders headings with ids and anchor links, lists, quotes, code and images", () => {
    const { container } = renderMd(sample);
    expect(screen.getByRole("heading", { level: 3, name: /Sub heading/ })).toHaveAttribute("id", "sub-heading");
    expect(container.querySelectorAll("ol li")).toHaveLength(2);
    expect(container.querySelectorAll("ul li")).toHaveLength(2);
    expect(container.querySelector("blockquote")).toHaveTextContent("quoted");
    expect(container.querySelector("p code")).toHaveTextContent("inline");
    expect(screen.getByAltText("diagram")).toHaveAttribute("loading", "lazy");
    expect(screen.getByRole("link", { name: /Link to section: Sub heading/ })).toHaveAttribute("href", "#sub-heading");
  });

  it("renders fenced code with a language label and copy button", () => {
    renderMd(sample);
    expect(screen.getByText("yarn install")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Copy bash code/ })).toBeInTheDocument();
  });

  it("opens external links safely and keeps internal links in-app", () => {
    renderMd(sample);
    const ext = screen.getByRole("link", { name: "external" });
    expect(ext).toHaveAttribute("target", "_blank");
    expect(ext).toHaveAttribute("rel", expect.stringContaining("noopener"));
    expect(screen.getByRole("link", { name: "internal" })).not.toHaveAttribute("target");
  });

  it("assigns the same heading ids as the table-of-contents extractor", () => {
    const { container } = renderMd(sample);
    const rendered = Array.from(container.querySelectorAll("h2[id], h3[id]")).map((h) => h.id);
    expect(rendered).toEqual(extractHeadings(sample).map((h) => h.id));
    expect(rendered).toContain("first-heading-1");
  });

  it("does not render raw HTML or script-capable markup", () => {
    const { container } = renderMd(
      `<script>window.__pwned = 1</script>\n\n<img src=x onerror="window.__pwned = 1">\n\n<div onclick="x()">hi</div>\n\n[bad](javascript:alert(1))`,
    );
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("[onclick]")).toBeNull();
    const bad = screen.getByText("bad");
    expect(bad.getAttribute("href") ?? "").not.toMatch(/^javascript:/i);
    expect((window as unknown as Record<string, unknown>).__pwned).toBeUndefined();
  });
});
