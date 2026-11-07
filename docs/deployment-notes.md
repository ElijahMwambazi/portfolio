# Deployment notes

Behaviour that depends on the host (Vercel) and has not been confirmed from a
local build. Check these on a Vercel preview before relying on them.

## Production settings

- `VITE_SITE_URL` must be set (e.g. `https://example.com`, no trailing slash).
  Without it the build skips `sitemap.xml`, `rss.xml` and canonical URLs.

## Known: SPA soft 404s

`vercel.json` rewrites every path to `/index.html`, so an unknown URL such as
`/nope` or `/notes/missing` returns **HTTP 200** with the SPA shell, and the
"not found" screen is rendered client-side. Mitigation in place: those screens
set `<meta name="robots" content="noindex">`. Crawlers that do not run
JavaScript still see a 200 with the generic shell. No routing change has been
made; changing the rewrite would affect every client-side route and needs
testing on a preview first.

## To verify: prerendered notes and trailing slashes

The build writes `dist/notes/<slug>/index.html` for each published note, with
the note's title, canonical, Open Graph tags and a single description baked in.
`vite preview` serves the generic shell at `/notes/<slug>` (no trailing slash)
and the prerendered file at `/notes/<slug>/`. Confirm on Vercel:

1. `curl -s https://<preview>/notes/why-this-site-exists | grep -E '<title>|canonical'`
   returns the note's title and canonical (not the generic shell).
2. The same request with a trailing slash returns the same document.
3. Opening the note and refreshing in a browser renders the note, not the
   not-found screen.
4. `/sitemap.xml` and `/rss.xml` load, are valid XML and list only published
   notes.
5. A draft slug (e.g. `/notes/fedora-ai-development-stack`) shows the
   "Note not found" screen, and view-source contains no draft text.

If (1) fails, the rewrite is shadowing the prerendered directory. The fix to
test is a `vercel.json` rewrite that excludes existing files, or
`cleanUrls`/`trailingSlash`; do not change it without checking every route.
