import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { RouteErrorPage } from "./RouteErrorPage";

function renderAt(path: string, routes: Parameters<typeof createMemoryRouter>[0]) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
}

describe("RouteErrorPage", () => {
  it("shows page-not-found for an unmatched URL", () => {
    renderAt("/nope", [{ path: "/", element: <div />, errorElement: <RouteErrorPage /> }]);
    expect(screen.getByRole("heading", { name: "Page not found" })).toBeInTheDocument();
  });

  it("reports a thrown error as an error, not a 404", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    function Boom(): never {
      throw new Error("chunk failed");
    }
    renderAt("/", [{ path: "/", element: <Boom />, errorElement: <RouteErrorPage /> }]);
    expect(screen.getByRole("heading", { name: "Something went wrong" })).toBeInTheDocument();
    expect(screen.queryByText("Page not found")).not.toBeInTheDocument();
    spy.mockRestore();
  });
});
