import type { ScriptTool } from "../types/script";

export const SCRIPTS_REPO_URL =
  "https://github.com/ElijahMwambazi/utility-scripts";

// * SCRIPT FORMAT
// {
//   slug: "tool-slug",
//   name: "Tool name",
//   category: "Email",            // groups + filters the list
//   language: "Python",
//   summary: "What it does.",
//   highlights: ["Feature", "Feature"],
//   requirements: ["Python 3.10+"],
//   path: "category/tool-folder", // folder inside the repo
//   run: "python tool.py --dry-run",
// }

export const scripts: ScriptTool[] = [
  {
    slug: "outlook-bulk-mail",
    name: "Outlook bulk personalized email",
    category: "Email",
    language: "Python",
    summary:
      "Sends a separate Microsoft 365 / Outlook email to each recipient through Microsoft Graph, so nobody sees a CC or BCC list.",
    highlights: [
      "One message per recipient, first-name personalization",
      "CSV input and HTML templates",
      "Dry-run mode and duplicate detection",
      "Send/failure logging with a configurable delay",
    ],
    requirements: [
      "Python 3.10+",
      "Microsoft Entra app with Graph Mail.Send permission",
    ],
    path: "email/outlook-bulk-mail",
    run: "python send_bulk_email.py --dry-run",
  },
];
