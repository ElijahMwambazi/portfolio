import type { ProjectStatus } from "../../types/project";

const styles: Record<ProjectStatus, string> = {
  Stable: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  Beta: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  "In progress": "border-sky-400/30 bg-sky-400/10 text-sky-200",
  Prototype: "border-violet-400/30 bg-violet-400/10 text-violet-200",
  Reference: "border-neutral-400/30 bg-neutral-400/10 text-neutral-200",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em] ${styles[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {status}
    </span>
  );
}
