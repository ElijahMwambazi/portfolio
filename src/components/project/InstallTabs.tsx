import { useId, useState } from "react";
import type { InstallStep } from "../../types/project";
import { CodeBlock } from "../ui/CodeBlock";

export function InstallTabs({ items }: { items: InstallStep[] }) {
  const [active, setActive] = useState(0);
  const baseId = useId();
  const current = items[active] ?? items[0];

  function onKeyDown(e: React.KeyboardEvent, index: number) {
    let next = index;
    if (e.key === "ArrowRight") next = (index + 1) % items.length;
    else if (e.key === "ArrowLeft")
      next = (index - 1 + items.length) % items.length;
    else return;
    e.preventDefault();
    setActive(next);
    document.getElementById(`${baseId}-tab-${next}`)?.focus();
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Install instructions"
        className="flex flex-wrap gap-2"
      >
        {items.map((item, i) => (
          <button
            key={item.platform}
            id={`${baseId}-tab-${i}`}
            role="tab"
            type="button"
            aria-selected={i === active}
            aria-controls={`${baseId}-panel`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={`rounded-xl border px-4 py-2 text-sm transition ${
              i === active
                ? "border-white/25 bg-white text-black font-semibold"
                : "border-white/10 bg-white/4 text-neutral-300 hover:bg-white/8 hover:text-white"
            }`}
          >
            {item.platform}
          </button>
        ))}
      </div>

      <div
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${active}`}
        className="mt-5"
      >
        {current.summary ? (
          <p className="text-sm leading-7 text-neutral-400 sm:text-base">
            {current.summary}
          </p>
        ) : null}
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-7 text-neutral-300 marker:text-neutral-500 sm:text-base">
          {current.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        {current.code ? <CodeBlock code={current.code} /> : null}
      </div>
    </div>
  );
}
