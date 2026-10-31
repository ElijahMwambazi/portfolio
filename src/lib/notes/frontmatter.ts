import { parse as parseYaml } from "yaml";
import { NOTE_CATEGORIES, type NoteCategory } from "./categories";

export type NoteMeta = {
  title: string;
  slug: string;
  description: string;
  /** ISO date (YYYY-MM-DD). Optional only while `draft` is true. */
  date?: string;
  updated?: string;
  category: NoteCategory;
  tags: string[];
  featured: boolean;
  draft: boolean;
};

export type ParsedNote = NoteMeta & { body: string };

const ALLOWED_KEYS = new Set([
  "title",
  "slug",
  "description",
  "date",
  "updated",
  "category",
  "tags",
  "featured",
  "draft",
]);

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const FRONTMATTER_RE = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)([\s\S]*)$/;

export class NoteParseError extends Error {
  constructor(file: string, problems: string[]) {
    super(`Invalid note "${file}":\n  - ${problems.join("\n  - ")}`);
    this.name = "NoteParseError";
  }
}

function isRealIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

/**
 * Splits and validates a Markdown note with YAML frontmatter.
 * Throws NoteParseError listing every problem found.
 */
export function parseNoteSource(source: string, file: string): ParsedNote {
  const text = source.replace(/^\uFEFF/, "");
  const match = FRONTMATTER_RE.exec(text);
  if (!match) {
    throw new NoteParseError(file, ["missing `---` frontmatter block"]);
  }

  let data: unknown;
  try {
    data = parseYaml(match[1]);
  } catch (error) {
    throw new NoteParseError(file, [
      `frontmatter is not valid YAML: ${(error as Error).message}`,
    ]);
  }
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new NoteParseError(file, ["frontmatter must be a YAML mapping"]);
  }

  const fm = data as Record<string, unknown>;
  const problems: string[] = [];

  for (const key of Object.keys(fm)) {
    if (!ALLOWED_KEYS.has(key)) problems.push(`unknown field "${key}"`);
  }

  const str = (key: string): string => {
    const v = fm[key];
    if (typeof v !== "string" || v.trim() === "") {
      problems.push(`"${key}" must be a non-empty string`);
      return "";
    }
    return v.trim();
  };
  const bool = (key: string): boolean => {
    const v = fm[key];
    if (v === undefined) return false;
    if (typeof v !== "boolean") problems.push(`"${key}" must be true or false`);
    return v === true;
  };

  const title = str("title");
  const slug = str("slug");
  const description = str("description");
  if (slug && !SLUG_RE.test(slug)) {
    problems.push(`"slug" must be lowercase letters, numbers and hyphens`);
  }

  const draft = bool("draft");
  const featured = bool("featured");

  let date: string | undefined;
  if (fm.date === undefined) {
    if (!draft) problems.push(`"date" is required unless draft: true`);
  } else if (!isRealIsoDate(fm.date)) {
    problems.push(`"date" must be a real YYYY-MM-DD date`);
  } else {
    date = fm.date;
  }

  let updated: string | undefined;
  if (fm.updated !== undefined) {
    if (!isRealIsoDate(fm.updated)) {
      problems.push(`"updated" must be a real YYYY-MM-DD date`);
    } else if (date && fm.updated < date) {
      problems.push(`"updated" cannot be earlier than "date"`);
    } else {
      updated = fm.updated;
    }
  }

  const category = fm.category;
  if (!NOTE_CATEGORIES.includes(category as NoteCategory)) {
    problems.push(`"category" must be one of: ${NOTE_CATEGORIES.join(", ")}`);
  }

  const tags = fm.tags;
  if (
    !Array.isArray(tags) ||
    tags.length === 0 ||
    tags.some((t) => typeof t !== "string" || t.trim() === "")
  ) {
    problems.push(`"tags" must be a non-empty list of strings`);
  }

  const body = match[2].replace(/^\s+/, "").trimEnd();
  if (body === "") problems.push("note body is empty");

  if (problems.length > 0) throw new NoteParseError(file, problems);

  return {
    title,
    slug,
    description,
    date,
    updated,
    category: category as NoteCategory,
    tags: (tags as string[]).map((t) => t.trim().toLowerCase()),
    featured,
    draft,
    body,
  };
}
