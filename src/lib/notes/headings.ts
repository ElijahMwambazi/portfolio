import GithubSlugger from "github-slugger";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { toString } from "mdast-util-to-string";
import { visit } from "unist-util-visit";
import type { Root } from "mdast";

export type Heading = { id: string; text: string; depth: 2 | 3 };

/**
 * Extracts h2/h3 headings with the same ids rehype-slug assigns when the
 * article is rendered (both use github-slugger in document order).
 */
export function extractHeadings(markdown: string): Heading[] {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown) as Root;
  const slugger = new GithubSlugger();
  const headings: Heading[] = [];

  visit(tree, "heading", (node) => {
    const text = toString(node);
    const id = slugger.slug(text);
    if (node.depth === 2 || node.depth === 3) {
      headings.push({ id, text, depth: node.depth });
    }
  });

  return headings;
}
