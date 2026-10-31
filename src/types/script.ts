export type ScriptTool = {
  slug: string;
  name: string;
  category: string;
  language: string;
  summary: string;
  highlights: string[];
  requirements?: string[];
  /** Folder in the utility-scripts repo, e.g. "email/outlook-bulk-mail". */
  path: string;
  run?: string;
};
