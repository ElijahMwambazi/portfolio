import { Outlet } from "react-router-dom";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { ScrollToLocation } from "../routing/ScrollToLocation";

export function SiteLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-neutral-950 text-neutral-100">
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[60] -translate-y-24 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-neutral-950 transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      <ScrollToLocation />
      <SiteHeader />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
