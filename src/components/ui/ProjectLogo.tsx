type Props = {
  title: string;
  logo?: string;
  className?: string;
};

/** Renders the project logo, or a monogram when none exists yet. */
export function ProjectLogo({ title, logo, className = "h-12 w-12" }: Props) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/4 p-2 backdrop-blur-md ${className}`}
    >
      {logo ? (
        <img
          src={logo}
          alt={`${title} logo`}
          className="h-full w-full object-contain"
        />
      ) : (
        <span
          aria-hidden="true"
          className="text-lg font-semibold text-neutral-300"
        >
          {title.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}
