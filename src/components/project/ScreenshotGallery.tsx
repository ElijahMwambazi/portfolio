import { useCallback, useEffect, useRef, useState } from "react";
import type { ProjectScreenshot } from "../../types/project";

export function ScreenshotGallery({
  shots,
  title,
}: {
  shots: ProjectScreenshot[];
  title: string;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setOpen(null);
    triggerRef.current?.focus();
  }, []);

  const step = useCallback(
    (dir: 1 | -1) =>
      setOpen((i) =>
        i === null ? i : (i + dir + shots.length) % shots.length,
      ),
    [shots.length],
  );

  useEffect(() => {
    if (open === null) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close, step]);

  const current = open !== null ? shots[open] : null;

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-3 [scrollbar-width:thin] snap-x snap-mandatory">
        {shots.map((shot, i) => (
          <button
            key={shot.src}
            type="button"
            onClick={(e) => {
              triggerRef.current = e.currentTarget;
              setOpen(i);
            }}
            aria-label={`Open screenshot: ${shot.alt}`}
            className={`group relative shrink-0 snap-start overflow-hidden rounded-2xl border border-white/10 bg-white/4 transition hover:border-white/25 ${
              shot.portrait ? "h-80 sm:h-96" : "h-56 sm:h-72"
            }`}
          >
            <img
              src={shot.src}
              alt={shot.alt}
              loading="lazy"
              className="h-full w-auto object-cover transition duration-300 group-hover:scale-[1.02]"
            />
          </button>
        ))}
      </div>

      {current ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} screenshots`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={close}
        >
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-4 top-4 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white transition hover:bg-white/20"
          >
            Close
          </button>

          {shots.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="Previous screenshot"
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-xl border border-white/15 bg-white/10 px-3 py-3 text-white transition hover:bg-white/20"
              >
                ←
              </button>
              <button
                type="button"
                aria-label="Next screenshot"
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl border border-white/15 bg-white/10 px-3 py-3 text-white transition hover:bg-white/20"
              >
                →
              </button>
            </>
          ) : null}

          <figure
            className="flex max-h-full max-w-5xl flex-col items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={current.src}
              alt={current.alt}
              className="max-h-[78vh] w-auto max-w-full rounded-2xl border border-white/10 object-contain"
            />
            <figcaption className="text-center text-sm text-neutral-300">
              {current.caption ?? current.alt}
              <span className="ml-2 text-neutral-500">
                {open! + 1} / {shots.length}
              </span>
            </figcaption>
          </figure>
        </div>
      ) : null}
    </>
  );
}
