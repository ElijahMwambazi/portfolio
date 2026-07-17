import type { Project } from "../types/project";
import dropDenLogo from "../assets/projects/drop-den-logo.png";
import lagRatLogo from "../assets/projects/lag-rat-logo.png";

// * PROJECT FORMAT
// {
//   slug: "project-slug",
//   title: "Project Title",
//   summary: "One-line summary.",
//   description: "Longer project description.",
//   stack: ["React", "TypeScript"],
//   featured: true,
//   githubUrl: "https://github.com/...",
//   liveUrl: "https://...",
//   logo: someLogo,
//   status: "In progress",
//   type: "Web app",
//   focus: "Tooling, education, visualization",
//   year: "2026",
//   overview: [
//     {
//       title: "What it is",
//       body: "Explain the project.",
//     },
//     {
//       title: "Current direction",
//       body: "Explain where it is going.",
//     },
//   ],
//   links: [
//     {
//       label: "Documentation",
//       href: "https://...",
//     },
//   ],
// }

export const projects: Project[] = [
  {
    slug: "lag-rat",
    title: "Lag Rat",
    summary:
      "Local network observability platform for home and local networks.",
    description:
      "Lag Rat is a local observability platform focused on visibility into connectivity, latency, DNS health, outages, alerts, and device activity through a local API and dashboard.",
    stack: ["Rust", "React", "TypeScript", "SQLite"],
    featured: true,
    githubUrl: "https://github.com/ElijahMwambazi/lag-rat",
    logo: lagRatLogo,
    status: "In progress",
    type: "Software project",
    focus: "Observability, local tooling, network visibility",
    year: "2026",
    overview: [
      {
        title: "What it is",
        body: "Lag Rat is a local-first observability tool for monitoring network conditions, outages, DNS health, latency, and device activity in a way that is practical and easy to reason about.",
      },
      {
        title: "Current direction",
        body: "The current focus is on refining the dashboard, strengthening backend behavior, improving the data model, and making the overall system clearer both technically and visually.",
      },
    ],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/ElijahMwambazi/lag-rat",
      },
    ],
  },
  {
    slug: "drop-den",
    title: "Drop Den",
    summary: "Local-only file and message sharing for nearby devices.",
    description:
      "Drop Den moves files and short messages between devices on the same local network, without accounts, cloud uploads, or public sharing links.",
    stack: ["Rust", "React", "TypeScript", "Tauri", "SQLite"],
    featured: true,
    githubUrl: "https://github.com/ElijahMwambazi/drop-den",
    logo: dropDenLogo,
    status: "In progress",
    type: "Local file-sharing app",
    focus: "Local-first sharing, cross-device delivery, privacy",
    overview: [
      {
        title: "What it is",
        body: "Drop Den is a local-only transfer hub for sharing files and short messages with nearby phones, tablets, and computers through a browser, desktop app, or Android app.",
      },
      {
        title: "How it works",
        body: "One host machine runs the backend, and participating devices connect over the same local network using its displayed address or QR code. Files and messages pass through the host rather than a cloud service.",
      },
      {
        title: "Current direction",
        body: "The current work is focused on preparing public packages for Linux, Android, and Windows, with macOS packaging and release signing still in progress.",
      },
    ],
    links: [
      {
        label: "Technical overview",
        href: "https://github.com/ElijahMwambazi/drop-den/blob/main/docs/dropden.md",
      },
    ],
  },
];
