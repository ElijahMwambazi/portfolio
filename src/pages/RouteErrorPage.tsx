import { useEffect } from "react";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { NotFoundPage } from "./NotFoundPage";

/**
 * Root error boundary. Only genuine 404s show "Page not found"; anything else
 * (e.g. a lazy route chunk that failed to load) is reported as an error so it
 * is not mistaken for a missing page.
 */
export function RouteErrorPage() {
  const error = useRouteError();
  const is404 = isRouteErrorResponse(error) && error.status === 404;

  useEffect(() => {
    if (!is404) console.error("Route error:", error);
  }, [error, is404]);

  if (is404) return <NotFoundPage />;

  return (
    <section className="py-20">
      <Container>
        <h1 className="text-3xl font-semibold">Something went wrong</h1>
        <p className="mt-4 text-neutral-300">
          This page failed to load. Reloading usually fixes it.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 inline-block underline hover:text-white"
        >
          Reload page
        </button>
      </Container>
    </section>
  );
}
