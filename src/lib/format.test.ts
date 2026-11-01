import { describe, expect, it } from "vitest";
import { formatDate } from "./format";
import { renderPageHtml } from "./seo";

describe("formatDate", () => {
  it("never shifts a date-only value", () => {
    expect(formatDate("2026-04-21")).toBe("21 Apr 2026");
  });
  it("formats a full timestamp", () => {
    expect(formatDate("2026-04-20T12:00:00Z")).toBe("20 Apr 2026");
  });
});

describe("renderPageHtml", () => {
  it("does not expand $ replacement patterns in titles or descriptions", () => {
    const shell = `<html><head><title>x</title><meta name="description" content="g"></head><body></body></html>`;
    const html = renderPageHtml(shell, {
      title: "Spend $& and $' fees",
      description: "Costs $` more",
    } as Parameters<typeof renderPageHtml>[1]);
    expect(html).toContain("Spend $&amp; and $' fees");
    expect(html.match(/<\/head>/g)).toHaveLength(1);
    expect(html).not.toContain("<body></body></html>\n");
  });
});
