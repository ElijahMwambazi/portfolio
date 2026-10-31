import { useEffect, useState } from "react";
import type { Heading } from "../../lib/notes/headings";

function useActiveHeading(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (ids.length === 0 || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -65% 0px" },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

function TocList({
  headings,
  active,
}: {
  headings: Heading[];
  active: string | null;
}) {
  return (
    <ol className="space-y-1.5 text-sm">
      {headings.map((h) => (
        <li key={h.id} className={h.depth === 3 ? "pl-4" : undefined}>
          <a
            href={`#${h.id}`}
            aria-current={active === h.id ? "location" : undefined}
            className={`block rounded-md py-1 leading-5 transition hover:text-white ${
              active === h.id ? "text-white" : "text-neutral-500"
            }`}
          >
            {h.text}
          </a>
        </li>
      ))}
    </ol>
  );
}

export function TableOfContents({
  headings,
  variant,
}: {
  headings: Heading[];
  variant: "mobile" | "desktop";
}) {
  const active = useActiveHeading(headings.map((h) => h.id));
  if (headings.length < 2) return null;

  if (variant === "mobile") {
    // In-flow and collapsed: nothing sticky on small screens.
    return (
      <details className="mb-8 rounded-2xl border border-white/10 bg-white/4 px-4 py-3 lg:hidden">
        <summary className="cursor-pointer text-sm font-medium text-neutral-200">
          On this page
        </summary>
        <nav aria-label="Table of contents" className="mt-3">
          <TocList headings={headings} active={active} />
        </nav>
      </details>
    );
  }

  return (
    <nav
      aria-label="Table of contents (sidebar)"
      className="sticky top-24 hidden max-h-[calc(100vh-8rem)] overflow-y-auto lg:block"
    >
      <p className="mb-3 text-xs uppercase tracking-[0.16em] text-neutral-500">
        On this page
      </p>
      <TocList headings={headings} active={active} />
    </nav>
  );
}
