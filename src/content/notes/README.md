# Notes

Each `.md` file here is one published note. The file name must be `<slug>.md`
and match the `slug` field; the slug is the URL (`/notes/<slug>`), so never
rename a published note.

## Frontmatter

    ---
    title: "Readable title"
    slug: kebab-case-slug
    description: "One or two sentences. Used on cards, in search, and as the meta description."
    date: 2026-05-01            # publication date, YYYY-MM-DD (required when published)
    updated: 2026-06-01         # optional, YYYY-MM-DD, not earlier than date
    category: "Engineering"     # Engineering | Infrastructure | Bitcoin & Finance | Experiments & Learning
    tags: [rust, observability] # lowercase, at least one
    featured: false             # shown in the Featured section
    draft: false                # true = never included in production builds
    ---

Unknown fields, bad dates, unknown categories and slug/file-name mismatches
fail the build with a message naming the file.

## Writing

The body is Markdown (GFM): `##`/`###` headings (they feed the table of
contents and get anchor links), paragraphs, links, ordered and unordered lists,
blockquotes, inline code, fenced code blocks with an optional language,
tables, and images (`![alt](https://...)` or a file under `public/`).

Do not use `#` in the body; the title is the page `<h1>`. Raw HTML is not
rendered, by design. Reading time is computed automatically.

## Publishing a draft

Drafts live in `src/content/drafts/` and are only visible in `yarn dev`.
To publish one after review: move the file into this folder, set
`draft: false`, add a real `date`, and commit. Production builds never read
the drafts folder.

Set `VITE_SITE_URL` in the hosting environment to enable canonical URLs,
`sitemap.xml` and `rss.xml`.
