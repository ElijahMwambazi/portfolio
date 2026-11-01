import { Link } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { usePageMeta } from "../hooks/usePageMeta";

export function NotFoundPage() {
  usePageMeta({
    title: "Page not found",
    description: "The page you are looking for does not exist.",
    noindex: true,
  });
  return (
    <section className="py-20">
      <Container>
        <h1 className="text-3xl font-semibold">Page not found</h1>
        <p className="mt-4 text-neutral-300">
          The page you’re looking for does not exist.
        </p>
        <Link to="/" className="mt-6 inline-block underline hover:text-white">
          Go home
        </Link>
      </Container>
    </section>
  );
}
