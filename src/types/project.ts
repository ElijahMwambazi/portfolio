export type ProjectSection = {
  title: string;
  body: string;
};

export type ProjectLink = {
  label: string;
  href: string;
};

export type Platform = "linux" | "windows" | "android" | "macos" | "other";

export type ProjectStatus = "Stable" | "Beta" | "In progress" | "Prototype" | "Reference";

export type ProjectScreenshot = {
  src: string;
  alt: string;
  caption?: string;
  /** Phone-shaped screenshots render in a narrower frame. */
  portrait?: boolean;
};

export type ProjectFeature = {
  title: string;
  body: string;
};

export type InstallStep = {
  platform: string;
  summary?: string;
  steps: string[];
  /** Optional shell snippet, rendered with a copy button. */
  code?: string;
};

export type ProjectFaq = {
  question: string;
  answer: string;
};

/** GitHub repo to read releases from. When set, the page shows live downloads. */
export type ProjectRelease = {
  repo: string; // "owner/name"
  /** Shown when a platform asset can't be loaded. */
  fallbackUrl?: string;
};

export type Project = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  stack: string[];
  featured?: boolean;
  githubUrl?: string;
  liveUrl?: string;
  logo?: string;
  status?: ProjectStatus;
  type?: string;
  focus?: string;
  year?: string;
  overview?: ProjectSection[];
  links?: ProjectLink[];

  // Product-page fields (all optional)
  release?: ProjectRelease;
  features?: ProjectFeature[];
  screenshots?: ProjectScreenshot[];
  install?: InstallStep[];
  requirements?: string[];
  faq?: ProjectFaq[];
  /** Short honest note shown near the download/get-started area. */
  notice?: string;
};
