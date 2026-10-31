import { useState } from "react";

export function CopyLinkButton({ url }: { url: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
    } catch {
      setState("failed");
    }
    window.setTimeout(() => setState("idle"), 2000);
  }

  return (
    <>
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center rounded-xl border border-white/10 bg-white/4 px-3 py-2 text-sm text-neutral-300 transition hover:border-white/20 hover:bg-white/8 hover:text-white"
      >
        {state === "copied" ? "Link copied" : state === "failed" ? "Copy failed" : "Copy link"}
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {state === "copied" ? "Link copied to clipboard" : ""}
      </span>
    </>
  );
}
