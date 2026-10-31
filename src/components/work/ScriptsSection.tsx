import { useState } from "react";
import { scripts, SCRIPTS_REPO_URL } from "../../content/scripts";
import { CodeBlock } from "../ui/CodeBlock";

export function ScriptsSection() {
  const categories = ["All", ...Array.from(new Set(scripts.map((s) => s.category)))];
  const [category, setCategory] = useState("All");
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  const visible = scripts.filter(
    (s) => category === "All" || s.category === category,
  );

  return (
    <div id="tools" className="mt-16 scroll-mt-24 sm:mt-20">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-medium text-neutral-100 sm:text-xl">
            Tools &amp; scripts
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-7 text-neutral-400">
            Small utilities for automation, admin, and data work, collected in
            one repository.
          </p>
        </div>
        <a
          href={SCRIPTS_REPO_URL}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-neutral-400 transition hover:text-white"
        >
          utility-scripts on GitHub →
        </a>
      </div>

      {categories.length > 2 ? (
        <div
          className="mb-4 flex flex-wrap gap-2"
          role="group"
          aria-label="Filter scripts by category"
        >
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
              className={`rounded-full border px-3 py-1.5 text-xs transition sm:text-sm ${
                category === c
                  ? "border-white/30 bg-white font-semibold text-black"
                  : "border-white/10 bg-white/4 text-neutral-300 hover:bg-white/8 hover:text-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      ) : null}

      <ul className="space-y-3">
        {visible.map((tool) => {
          const open = openSlug === tool.slug;
          const panelId = `script-${tool.slug}`;
          return (
            <li
              key={tool.slug}
              className="rounded-2xl border border-white/10 bg-white/4 transition hover:border-white/20"
            >
              <button
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenSlug(open ? null : tool.slug)}
                className="flex w-full items-start justify-between gap-4 p-4 text-left sm:p-5"
              >
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-semibold text-neutral-100">
                      {tool.name}
                    </span>
                    <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-neutral-400">
                      {tool.category}
                    </span>
                    <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-neutral-400">
                      {tool.language}
                    </span>
                  </span>
                  <span className="mt-2 block text-sm leading-7 text-neutral-400">
                    {tool.summary}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className={`mt-1 text-neutral-500 transition ${open ? "rotate-45" : ""}`}
                >
                  +
                </span>
              </button>

              {open ? (
                <div id={panelId} className="border-t border-white/10 p-4 sm:p-5">
                  <ul className="list-disc space-y-1 pl-5 text-sm leading-7 text-neutral-300 marker:text-neutral-600">
                    {tool.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                  {tool.requirements ? (
                    <p className="mt-4 text-sm text-neutral-500">
                      Needs: {tool.requirements.join(" · ")}
                    </p>
                  ) : null}
                  {tool.run ? <CodeBlock code={tool.run} /> : null}
                  <a
                    href={`${SCRIPTS_REPO_URL}/tree/main/${tool.path}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex text-sm font-medium text-neutral-300 transition hover:text-white"
                  >
                    View source →
                  </a>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
