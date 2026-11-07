import type { Project } from "../types/project";
import dropDenLogo from "../assets/projects/drop-den-logo.png";
import lagRatLogo from "../assets/projects/lag-rat-logo.png";
import ntumbaLogo from "../assets/projects/ntumba/ntumba-logo.png";
import ntumbaGetPaidDesktop from "../assets/projects/ntumba/get-paid-desktop.png";
import ntumbaGetPaidMobile from "../assets/projects/ntumba/get-paid-mobile.png";
import ntumbaShareMobile from "../assets/projects/ntumba/share-mobile.png";
import ntumbaCheckoutMobile from "../assets/projects/ntumba/checkout-mobile.png";
import ntumbaActivityMobile from "../assets/projects/ntumba/activity-mobile.png";
import checkoutScoutLogo from "../assets/projects/checkout-scout-logo.svg";
import lyritLoomLogo from "../assets/projects/lyrit-loom/lyrit-loom-logo.png";

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
//   status: "Beta", // Stable | Beta | In progress | Prototype
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
//   release: { repo: "owner/name" }, // live downloads from GitHub Releases
//   features: [{ title: "...", body: "..." }],
//   screenshots: [{ src: img, alt: "...", caption: "...", portrait: true }],
//   install: [{ platform: "Linux", steps: ["..."], code: "..." }],
//   requirements: ["..."],
//   faq: [{ question: "...", answer: "..." }],
//   notice: "Honest caveat shown beside the download.",

export const projects: Project[] = [
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
    status: "Beta",
    type: "Local file-sharing app",
    focus: "Local-first sharing, cross-device delivery, privacy",
    year: "2026",
    release: { repo: "ElijahMwambazi/drop-den" },
    notice:
      "Trusted home-network beta. Use it on private networks you control, and never expose it directly to the internet. The Windows installer is unsigned and may trigger SmartScreen.",
    features: [
      {
        title: "Share with everyone or one device",
        body: "Send several files at once to the whole network or a specific connected device.",
      },
      {
        title: "Preview before download",
        body: "Look at images, video, and audio in the browser, then download single files or a ZIP.",
      },
      {
        title: "Short messages",
        body: "Send quick text between connected devices alongside file transfers.",
      },
      {
        title: "Join by QR code",
        body: "Other devices connect through the host's displayed address or QR code and a six-digit join PIN.",
      },
      {
        title: "Transfers stay on the host",
        body: "Files expire after 24 hours by default (configurable from 1 hour to 30 days) and never touch a cloud service.",
      },
      {
        title: "Desktop, Android, and browser",
        body: "Run the host on Linux or Windows, share from the Android share sheet, or use any modern browser.",
      },
    ],
    install: [
      {
        platform: "Linux",
        summary: "RPM package for x86_64.",
        steps: [
          "Download the .rpm from the panel above.",
          "Install it with your package manager.",
          "Launch Drop Den and note the address or QR code it displays.",
        ],
        code: "sudo dnf install ./drop-den-*-linux-x86_64.rpm",
      },
      {
        platform: "Windows",
        summary: "Unsigned NSIS installer for x64.",
        steps: [
          "Download the setup .exe from the panel above.",
          "If SmartScreen warns about an unrecognised app, choose More info → Run anyway.",
          "Launch Drop Den and share the displayed address or QR code.",
        ],
      },
      {
        platform: "Android",
        summary: "Signed APK; also acts as a share-sheet target.",
        steps: [
          "Download the .apk on your phone.",
          "Allow installation from your browser or file manager when prompted.",
          "Open Drop Den and enter the host's address, or scan its QR code.",
        ],
      },
      {
        platform: "Verify",
        summary: "Check downloads against SHA256SUMS.txt before installing.",
        steps: [
          "Put the downloaded files and SHA256SUMS.txt in one folder.",
          "Run the check; every file should report OK.",
        ],
        code: "sha256sum --check SHA256SUMS.txt",
      },
    ],
    requirements: [
      "All devices on the same local network and able to reach the host",
      "A modern browser (Chrome or Firefox) for browser clients",
      "macOS: build from source for now",
    ],
    faq: [
      {
        question: "Does anything go through the cloud?",
        answer:
          "No. One computer hosts; other devices connect over your local network and files pass through that host only.",
      },
      {
        question: "Is it safe on public Wi-Fi?",
        answer:
          "No. It is built for trusted home, office, and event networks, not hostile or public ones.",
      },
      {
        question: "Is there a macOS build?",
        answer:
          "Not yet. Public macOS binaries are postponed; you can build from source from the repository.",
      },
    ],
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
        body: "The first public beta ships Linux, Windows, and Android builds. macOS packaging and release signing are still in progress.",
      },
    ],
    links: [
      {
        label: "Technical overview",
        href: "https://github.com/ElijahMwambazi/drop-den/blob/main/docs/dropden.md",
      },
    ],
  },
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
    type: "Network observability",
    focus: "Observability, local tooling, network visibility",
    year: "2026",
    features: [
      {
        title: "Connectivity and DNS monitoring",
        body: "Tracks router reachability, internet connectivity, and DNS health continuously.",
      },
      {
        title: "Outages and alerts",
        body: "Outage tracking with an acknowledgeable alert lifecycle and a timeline of history.",
      },
      {
        title: "Device inventory",
        body: "See which devices are on the network, with history and per-device activity.",
      },
      {
        title: "Wi-Fi room sampling",
        body: "Room-based Wi-Fi sampling with summaries, alerts, and dashboard views.",
      },
      {
        title: "Traffic summaries",
        body: "Top talkers, recent samples, and detail drawers for traffic investigation.",
      },
      {
        title: "Guarded packet capture",
        body: "Queued, cancellable capture requests using allowlisted interfaces and safe generated filters.",
      },
    ],
    overview: [
      {
        title: "What it is",
        body: "Lag Rat is a local-first observability tool for monitoring network conditions, outages, DNS health, latency, and device activity in a way that is practical and easy to reason about.",
      },
      {
        title: "Current direction",
        body: "The project is in a late MVP stage. Current focus is polishing capture output after real .pcap testing, improving dashboard cohesion, and keeping the collector/plugin boundary clean for future modules.",
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
    slug: "ntumba",
    title: "Ntumba",
    summary:
      "Accountless Bitcoin and Kwacha payment requests for Zambian merchants.",
    description:
      "Ntumba lets merchants create one-time payment requests without registering, and lets payers open the link as anonymous guests, with direct settlement to Lightning wallets and mobile-money accounts.",
    stack: ["TypeScript", "React", "Fastify", "PostgreSQL", "PWA"],
    featured: true,
    githubUrl: "https://github.com/ElijahMwambazi/ntumba",
    logo: ntumbaLogo,
    status: "Prototype",
    type: "Payments PWA",
    focus: "Bitcoin and Lightning, mobile money, privacy",
    year: "2026",
    relatedNotes: ["bitcoin-mobile-money-bridge"],
    notice:
      "Development prototype. It uses deterministic fake Lightning and mobile-money adapters only: no real funds, live rates, or mainnet payments are supported, and it is not production-safe.",
    screenshots: [
      {
        src: ntumbaGetPaidDesktop,
        alt: "Ntumba Get paid screen on desktop",
        caption: "Creating a payment request",
      },
      {
        src: ntumbaGetPaidMobile,
        alt: "Ntumba Get paid screen on mobile",
        caption: "Get paid, on mobile",
        portrait: true,
      },
      {
        src: ntumbaShareMobile,
        alt: "Ntumba request sharing screen",
        caption: "Sharing a request by link or QR code",
        portrait: true,
      },
      {
        src: ntumbaCheckoutMobile,
        alt: "Ntumba guest checkout screen",
        caption: "Anonymous guest checkout",
        portrait: true,
      },
      {
        src: ntumbaActivityMobile,
        alt: "Ntumba activity screen",
        caption: "Activity history",
        portrait: true,
      },
    ],
    features: [
      {
        title: "No merchant account",
        body: "Merchants create one-time requests without registering; there are no balances or synced profiles.",
      },
      {
        title: "Anonymous guest checkout",
        body: "Payers open an opaque link and choose the available payment method themselves.",
      },
      {
        title: "Share by link or QR",
        body: "Copy the link, show a QR code, or use native Web Share from the installed PWA.",
      },
      {
        title: "Direct Lightning settlement",
        body: "The BTC to BTC rail pays a merchant-owned invoice directly and is non-custodial.",
      },
      {
        title: "Quotes you confirm",
        body: "Payer-created 60-second integer-only quotes with explicit confirmation and a single claim.",
      },
      {
        title: "Local-first data",
        body: "Preferences, requests, and receipts live in IndexedDB with a confirmed clear-data action.",
      },
    ],
    install: [
      {
        platform: "Run locally",
        summary: "Needs Node.js 24.18.0, Corepack with Yarn 4.17.1, and Docker Compose.",
        steps: [
          "Clone the repository and copy .env.example to .env.",
          "Start the database and run migrations.",
          "Start the dev servers, then open http://localhost:5173.",
        ],
        code: `corepack enable
cp .env.example .env
yarn install --immutable
docker compose up -d database
yarn db:migrate
yarn dev`,
      },
    ],
    faq: [
      {
        question: "Can I use it with real money?",
        answer:
          "No. The current build only uses fake Voltage/LND and Lipila adapters for development and testing.",
      },
      {
        question: "Is it custodial?",
        answer:
          "The BTC to BTC rail is non-custodial. The planned conversion rails would be custodial during settlement because the operator controls both liquidity legs.",
      },
    ],
    overview: [
      {
        title: "What it is",
        body: "Ntumba is a merchant-first, accountless payment bridge: one-time requests, anonymous payers, and direct settlement with no merchant balances.",
      },
      {
        title: "Current direction",
        body: "The checkout envelope, quotes, one-time claim, accounting, and refund obligations are implemented against fake providers. Real provider integrations are the next major step.",
      },
    ],
    links: [
      {
        label: "Product docs",
        href: "https://github.com/ElijahMwambazi/ntumba/blob/main/docs/PRODUCT.md",
      },
    ],
  },
  {
    slug: "lyrit-loom",
    title: "Lyrit Loom",
    summary:
      "Kinetic lyric video studio that syncs word-level lyrics to audio.",
    description:
      "Lyrit Loom turns audio, a background image, and editable word timestamps into polished animated-typography lyric videos, built with Rust, React, Whisper, and FFmpeg.",
    stack: ["Rust", "React", "TypeScript", "PostgreSQL", "FFmpeg"],
    githubUrl: "https://github.com/ElijahMwambazi/lyrit-loom",
    logo: lyritLoomLogo,
    status: "In progress",
    type: "Video studio",
    focus: "Media pipelines, transcription, creative tooling",
    year: "2026",
    notice:
      "Early milestones only. Transcription currently uses a deterministic fake transcriber; Whisper integration and video rendering are still to come.",
    features: [
      {
        title: "Durable projects and media",
        body: "Audio and background images are streamed, hashed, probed with ffprobe, and stored safely.",
      },
      {
        title: "Background job worker",
        body: "A separate Tokio worker claims PostgreSQL jobs with leases, heartbeats, and progress events.",
      },
      {
        title: "Word-timed transcripts",
        body: "Transcription results display with per-word timing, ready for editing.",
      },
      {
        title: "Live upload progress",
        body: "Drag-and-drop uploads with visible progress in the React workspace.",
      },
      {
        title: "Typed API contract",
        body: "An OpenAPI contract generates the frontend client types.",
      },
      {
        title: "Run with one command",
        body: "Docker Compose brings up the API, worker, database, and web app together.",
      },
    ],
    install: [
      {
        platform: "Run with Docker",
        summary: "Requires Docker with the Compose plugin.",
        steps: [
          "Build and start everything.",
          "Open http://localhost:3000 and create a project.",
          "Drop in an audio file and a background image, then choose Transcribe audio.",
        ],
        code: `docker compose up --build -d
make smoke   # optional readiness check
make down    # stop containers`,
      },
    ],
    overview: [
      {
        title: "What it is",
        body: "A studio for building lyric videos where every word is timed and animated, so the visuals follow the song instead of fighting it.",
      },
      {
        title: "Current direction",
        body: "Milestones 0 and 1 are executable: projects, validated uploads, and the job pipeline. Real Whisper transcription, a timestamp editor, and FFmpeg rendering follow.",
      },
    ],
    links: [
      {
        label: "Development guide",
        href: "https://github.com/ElijahMwambazi/lyrit-loom/blob/main/docs/DEVELOPMENT.md",
      },
    ],
  },
  {
    slug: "zm-terminal",
    title: "ZM Terminal",
    summary:
      "Zambia-first market intelligence terminal for FX, equities, and macro data.",
    description:
      "ZM Terminal is a personal financial terminal for Zambia-specific research alongside global market context, combining a React frontend, a FastAPI application API, PostgreSQL, and the OpenBB platform.",
    stack: ["React", "TypeScript", "FastAPI", "PostgreSQL", "OpenBB", "Docker"],
    githubUrl: "https://github.com/ElijahMwambazi/zm-terminal",
    status: "Prototype",
    type: "Market data terminal",
    focus: "Zambian markets, FX, data engineering",
    year: "2026",
    relatedNotes: ["bank-of-zambia-fx-adapter"],
    notice:
      "v0.1 scaffold. Only the Bank of Zambia USD/ZMW backend adapter exists; frontend FX views and the LuSE, crypto, and commodity adapters are still pending. It deliberately shows no fabricated prices.",
    features: [
      {
        title: "Official USD/ZMW rates",
        body: "A backend adapter reads Bank of Zambia observations and preserves buy, mid, and sell as exact decimal strings with UTC timestamps.",
      },
      {
        title: "Honest data handling",
        body: "Stale quotes are flagged, and conflicting or malformed upstream rows fail explicitly instead of silently picking older data.",
      },
      {
        title: "Provider-independent API",
        body: "OpenBB sits behind the FastAPI layer, so Zambian sources and derived instruments can be combined without coupling the UI to one provider.",
      },
      {
        title: "Planned coverage",
        body: "LuSE equities and LASI, T-bills and bonds, Bitcoin in USD and ZMW, copper, and Zambia macro indicators.",
      },
      {
        title: "Keyboard-first commands",
        body: "A command palette is planned, with commands such as FX USDZMW, BTCZMW, and CHART USDZMW 1Y.",
      },
      {
        title: "Offline-testable",
        body: "The adapter is covered by mocked-HTTP tests that need no BoZ access, database, or OpenBB.",
      },
    ],
    install: [
      {
        platform: "Run with Docker",
        summary: "Requires Docker Engine or Desktop, Compose v2, and Git.",
        steps: [
          "Clone the repository and copy .env.example to .env.",
          "Build and start the stack.",
          "Open the web app on :5173 and the API docs on :8000/docs.",
        ],
        code: `git clone https://github.com/ElijahMwambazi/zm-terminal.git
cd zm-terminal
cp .env.example .env
docker compose up --build`,
      },
    ],
    faq: [
      {
        question: "Why are there no prices in the UI yet?",
        answer:
          "The project will not display fabricated market data. The frontend will show prices once real adapters feed it.",
      },
    ],
    overview: [
      {
        title: "What it is",
        body: "A Zambia-first research terminal: ZMW foreign exchange, Lusaka Securities Exchange instruments, Treasury securities, Bitcoin, copper, and macro indicators in one keyboard-driven place.",
      },
      {
        title: "Current direction",
        body: "Wire the USD/ZMW endpoint into the frontend, then add LuSE, crypto, and commodity adapters behind the same API.",
      },
    ],
  },
  {
    slug: "checkout-scout",
    title: "Checkout Scout",
    summary: "Community-updated price discovery for nearby stores.",
    description:
      "Checkout Scout helps people check product prices across nearby stores before buying. It is not a marketplace: no carts, orders, payments, or delivery.",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Supabase", "PostgreSQL"],
    githubUrl: "https://github.com/ElijahMwambazi/checkout-scout",
    logo: checkoutScoutLogo,
    status: "Prototype",
    type: "Community web app",
    focus: "Local price transparency, community data",
    year: "2026",
    notice:
      "Early scaffold: the database schema, typed data layer, and UI components are in place. Several MVP features are still planned.",
    features: [
      {
        title: "Browse stores and products",
        body: "Store and product lists with search, built as reusable components.",
      },
      {
        title: "Compare prices",
        body: "A price comparison table that lines up the same product across nearby stores.",
      },
      {
        title: "Community price reports",
        body: "Users submit prices and confirm or flag existing ones with vote buttons.",
      },
      {
        title: "Confidence scoring",
        body: "Each price carries a confidence badge derived from community confirmations.",
      },
      {
        title: "Moderation",
        body: "Admin moderation rules and flows are designed to keep reports trustworthy.",
      },
      {
        title: "Validated data",
        body: "Zod schemas and a Supabase PostgreSQL schema with migrations and seed data.",
      },
    ],
    install: [
      {
        platform: "Run locally",
        summary: "Needs Node.js and a Supabase project.",
        steps: [
          "Clone the repository and install dependencies.",
          "Copy .env.example to .env.local and add your Supabase URL, anon key, and service role key.",
          "Start the dev server.",
        ],
        code: `npm install
npm run dev`,
      },
    ],
    overview: [
      {
        title: "What it is",
        body: "A focused tool for one question: what does this cost nearby? Prices come from the community rather than a store feed.",
      },
      {
        title: "Current direction",
        body: "Finish the MVP loop of browsing, comparing, submitting, and confirming prices, then add admin moderation.",
      },
    ],
    links: [
      {
        label: "Project brief",
        href: "https://github.com/ElijahMwambazi/checkout-scout/blob/main/docs/project-brief.md",
      },
    ],
  },
  {
    slug: "ai-dev-stack",
    title: "AI Dev Stack",
    summary: "Documented, verified AI coding workstation setup on Fedora.",
    description:
      "A version-controlled source of truth for a staged Fedora AI development stack: configuration examples and environment templates, diagnostics, and dated validation evidence for working with Codex, Claude Code, Graphify, Headroom, and Git worktrees.",
    stack: ["Bash", "Python", "Fedora", "Git worktrees", "Markdown"],
    status: "Reference",
    type: "Documentation and tooling",
    focus: "AI-assisted development, security boundaries, verification",
    year: "2026",
    relatedNotes: ["fedora-ai-development-stack"],
    notice:
      "This is documentation, not an installable product. It records what was and was not verified on one machine, and historical acceptance is not a live availability guarantee.",
    features: [
      {
        title: "Verification matrix",
        body: "Every component is marked VERIFIED, CONFIGURED, or NOT EXERCISED, so it is clear what has actually been demonstrated.",
      },
      {
        title: "Security baseline",
        body: "Credentials, sessions, and indexes stay out of Git; code analysis runs local and code-only.",
      },
      {
        title: "Worktree workflow",
        body: "Scripts for isolated per-agent branches, with documented conventions for comparing agent output.",
      },
      {
        title: "Status and doctor checks",
        body: "Non-model health checks that report OK, WARN, NOT VERIFIED, or FAIL.",
      },
      {
        title: "Phase reports",
        body: "Sanitized, dated reports documenting each stage from audit to final state.",
      },
      {
        title: "Rollback and maintenance",
        body: "Update policy, regression gates, troubleshooting, and rollback procedures.",
      },
    ],
    overview: [
      {
        title: "What it is",
        body: "An operating manual for running AI coding agents deliberately: direct logins, no hidden routing, no automatic agent launching, and reviewed integration into main.",
      },
      {
        title: "Why it exists",
        body: "To make a fast-moving tool stack reproducible and honest, with its limits written down next to its capabilities.",
      },
    ],
  },
];
