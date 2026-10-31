# Drafts

Unpublished notes. Every file here must have `draft: true` and a filename
matching its `slug`. They are visible only in `yarn dev` (the index shows a
"Local drafts" section and `/notes/<slug>` previews them) and are never read
by `vite build`, so they cannot end up in the production bundle, the sitemap
or the RSS feed. Drafts do not need a `date`; do not invent one.

See `../notes/README.md` for the format and the publishing steps.
