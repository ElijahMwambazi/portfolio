import { useEffect } from "react";
import {
  metaTags,
  pageTitle,
  SITE_NAME,
  type PageMeta,
} from "../lib/seo";

const MARK = "data-seo";

function clearManaged() {
  document.head.querySelectorAll(`[${MARK}]`).forEach((el) => el.remove());
}

/**
 * Sets the document title and SEO tags for the current route and removes
 * them again on unmount, so metadata never leaks between SPA routes.
 */
export function usePageMeta(meta: PageMeta | null) {
  const key = meta ? JSON.stringify(meta) : "";

  useEffect(() => {
    if (!meta) return;
    document.title = pageTitle(meta.title);

    clearManaged(); // tags prerendered into the static HTML
    for (const { attrs } of metaTags(meta)) {
      const el = document.createElement("meta");
      for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
      el.setAttribute(MARK, "");
      document.head.appendChild(el);
    }
    if (meta.canonical) {
      const link = document.createElement("link");
      link.rel = "canonical";
      link.href = meta.canonical;
      link.setAttribute(MARK, "");
      document.head.appendChild(link);
    }

    return () => {
      clearManaged();
      document.title = SITE_NAME;
    };
    // `key` captures every field of `meta`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
