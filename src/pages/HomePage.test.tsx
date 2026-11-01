import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HomePage } from "./HomePage";

describe("HomePage metadata", () => {
  it("sets a description and restores nothing stale on unmount", () => {
    const { unmount } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );
    expect(document.head.querySelector('meta[name="description"]')?.getAttribute("content")).toMatch(/Elijah/);
    unmount();
    expect(document.head.querySelector('meta[name="description"][data-seo]')).toBeNull();
  });
});
