/// <reference types="vite/client" />

declare module "virtual:notes" {
  import type { ParsedNote } from "./lib/notes/frontmatter";
  const notes: ParsedNote[];
  export default notes;
}

interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string;
}
