import { useState } from "react";

export function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable (insecure context / denied); leave text selectable
    }
  }

  return (
    <div className="relative mt-4 rounded-2xl border border-white/10 bg-black/40">
      <button
        type="button"
        onClick={copy}
        className="absolute right-2 top-2 rounded-lg border border-white/10 bg-white/6 px-2.5 py-1 text-xs text-neutral-300 transition hover:bg-white/12 hover:text-white"
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <pre className="overflow-x-auto p-4 pr-20 text-xs leading-6 text-neutral-200 sm:text-sm">
        <code>{code}</code>
      </pre>
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </div>
  );
}
