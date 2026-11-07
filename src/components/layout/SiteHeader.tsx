import { Link, NavLink, useLocation } from "react-router-dom";
import { useState } from "react";

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function navLinkClassName({ isActive }: { isActive: boolean }) {
  return isActive
    ? "rounded-full border border-white/10 bg-white/[0.08] px-3 py-1.5 text-white"
    : "rounded-full px-3 py-1.5 text-neutral-300 transition hover:bg-white/[0.04] hover:text-white";
}

function mobileNavLinkClassName({ isActive }: { isActive: boolean }) {
  return isActive
    ? "rounded-lg bg-white/8 px-3 py-3 text-white"
    : "rounded-lg px-3 py-3 text-neutral-300 transition hover:bg-white/4 hover:text-white";
}

export function SiteHeader() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const contactHref = location.pathname === "/" ? "#contact" : "/#contact";

  const closeMenu = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-6">
        <Link
          to="/"
          onClick={closeMenu}
          className="inline-flex min-h-6 min-w-6 items-center text-sm font-semibold uppercase tracking-[0.2em] text-neutral-100"
        >
          EM
        </Link>

        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-6 text-sm font-medium text-neutral-300 md:flex"
        >
          <NavLink to="/" className={navLinkClassName}>
            Home
          </NavLink>
          <NavLink to="/work" className={navLinkClassName}>
            Work
          </NavLink>
          <NavLink to="/notes" className={navLinkClassName}>
            Notes
          </NavLink>
          <Link
            to={contactHref}
            className="rounded-full px-3 py-1.5 transition hover:bg-white/[0.04] hover:text-white"
          >
            Contact
          </Link>
        </nav>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/3 text-neutral-200 transition hover:bg-white/6 md:hidden"
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-white/10 bg-neutral-950/95 md:hidden">
          <nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
            className="mx-auto flex max-w-6xl flex-col px-5 py-4 text-sm font-medium text-neutral-300 sm:px-6"
          >
            <NavLink
              to="/"
              onClick={closeMenu}
              className={mobileNavLinkClassName}
            >
              Home
            </NavLink>
            <NavLink
              to="/work"
              onClick={closeMenu}
              className={mobileNavLinkClassName}
            >
              Work
            </NavLink>
            <NavLink
              to="/notes"
              onClick={closeMenu}
              className={mobileNavLinkClassName}
            >
              Notes
            </NavLink>
            <Link
              to={contactHref}
              onClick={closeMenu}
              className="rounded-lg px-3 py-3 transition hover:bg-white/4 hover:text-white"
            >
              Contact
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
