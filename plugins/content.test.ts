import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadNotes } from "./notes";

const dirs = {
  notesDir: path.resolve(__dirname, "../src/content/notes"),
  draftsDir: path.resolve(__dirname, "../src/content/drafts"),
};

const EXPECTED_DRAFTS = [
  "bank-of-zambia-fx-adapter",
  "bitcoin-mobile-money-bridge",
  "debian-tauri-internal-updates",
  "explainable-claims-anomaly-investigation",
  "fedora-ai-development-stack",
  "windows-office-application-deployment",
];

describe("real content", () => {
  it("loads every draft in dev, all unpublished and undated", () => {
    const all = loadNotes(dirs, true);
    const drafts = all.filter((n) => n.draft);
    expect(drafts.map((n) => n.slug).sort()).toEqual(EXPECTED_DRAFTS);
    for (const d of drafts) {
      expect(d.date, `${d.slug} must not have a publication date`).toBeUndefined();
      expect(d.updated).toBeUndefined();
    }
  });

  it("includes no draft in a production load", () => {
    const prod = loadNotes(dirs, false);
    expect(prod.some((n) => n.draft)).toBe(false);
    expect(prod.map((n) => n.slug)).not.toEqual(expect.arrayContaining(EXPECTED_DRAFTS));
    expect(JSON.stringify(prod)).not.toMatch(/AUTHOR TO PROVIDE|\[VERIFY/);
  });

  it("keeps the three original notes published at their original slugs", () => {
    const slugs = loadNotes(dirs, false).map((n) => n.slug).sort();
    expect(slugs).toEqual([
      "notes-on-useful-tools",
      "why-i-use-polar-for-bitcoin-and-lightning-prototyping",
      "why-this-site-exists",
    ]);
  });
});
