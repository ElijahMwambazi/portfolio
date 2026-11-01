---
title: "Building My AI Development Environment on Fedora"
slug: fedora-ai-development-stack
description: "A documented, verified setup for working with Codex CLI and Claude Code on Fedora: direct logins, Git worktree isolation, local-only context tools, and a verification matrix that records what was not exercised."
category: "Infrastructure"
tags: ["fedora", "codex", "claude-code", "git-worktrees", "mcp"]
featured: false
draft: true
---

> **Draft status.** Written from the `ai-dev-stack` repository (17 commits, 2026-09-19 to 2026-10-10; claims checked against the repository on 2026-11-01). Tool versions and model names are **a snapshot dated 2026-10-10**; two of them had already changed on the machine by 2026-11-01 (see "Snapshot decay"). **[VERIFY]** and **[AUTHOR TO PROVIDE]** mark things only you can confirm. The repository is private, so this article summarises its evidence instead of linking it. Delete this note and the checklist before publishing.

## The problem

I wanted to work with more than one AI coding agent on the same machine without losing track of what each one could see, what it changed, and what I had actually verified. The result is a repository, `ai-dev-stack`, that is the version-controlled source of truth for a staged Fedora 43 workstation: operating documentation, diagnostic scripts, dated validation reports and two sanitised environment templates.

## Constraints and requirements

- **Direct authentication only.** Codex uses its own ChatGPT login and Claude Code its own Claude.ai Pro login. `ANTHROPIC_BASE_URL` is kept unset, and no alternate gateway sits in the normal path.
- **Nothing automatic.** The stack does not launch agents, trace sessions or route requests on its own. I start one agent for one authorised task.
- **Private code stays local.** Repository analysis uses a local, code-only path.
- **Evidence over assumption.** Installing a tool is not proof it works. Every capability needs a recorded classification.
- **Credentials stay out of Git.** Sessions, databases and generated indexes live outside the repository.

## Architecture and decisions

```text
Operator -> one reviewed project branch / assigned sibling worktree
  |
  +-- Codex   -> direct ChatGPT auth
  |     +-- node_repl MCP, Headroom stdio MCP, Graphify skill/CLI
  |
  `-- Claude  -> direct Claude.ai Pro auth
        +-- Graphify skill, Headroom stdio MCP (registered)

OmniRoute -> optional localhost gateway, OFF, zero providers
Langfuse  -> explicit synthetic metadata harness only
```

(This is a simplified rendering of the diagram in `docs/final-architecture.md`.)

**Local context tools, on demand.** Graphify runs as a skill or CLI with local code-only extraction, with output kept outside the project and at most two workers. Headroom runs as an offline stdio MCP server with its own isolated environment and local exact-retrieval storage, with separate state for Codex and Claude. No HTTP proxy is enabled. MCP is the Model Context Protocol, the interface through which an agent calls external tools. **[AUTHOR TO PROVIDE: what Headroom and Graphify do for you, in your own words.]**

**An optional gateway left switched off.** OmniRoute is installed and hardened for loopback, with its service inactive and zero providers configured. I kept it optional because enabling it adds provider authorisation and another credential boundary that direct Codex or Claude work doesn't need.

**Observability without content.** Langfuse Cloud (EU) is wired only to a synthetic, metadata-only harness. No coding prompts, responses or source are exported, and no automatic session tracing is enabled.

## The central experiment: isolating two agents with Git worktrees

The question behind the whole stack was practical: if two agents work on the same project, what stops one from trampling the other's edits, and how would I know? The answer I tested was a Git worktree per agent.

**The design.** Each agent gets its own sibling worktree on its own branch, `codex/<task>` and `claude/<task>`. The main checkout stays on `main` for review and integration. A worktree has its own files, HEAD and index, while commits, branches, objects and repository configuration are shared. Three small helper scripts (`ai-worktree-create`, `ai-worktree-status`, `ai-worktree-remove`) require an explicit project path, print their actions and base commit before changing anything, and refuse to overwrite an existing path or branch. They never launch an agent, commit, merge or push. A status check run before each session fails when you are on `main`, in the other agent's worktree, or inside a nested repository.

**Test 1: isolation without a model (Phase 9).** Before involving any agent, deterministic local edits created a marker file containing `codex` or `claude` in each worktree and committed it separately. Each worktree had the correct independent branch, root, marker and clean status; the primary checkout had no marker; and the diff between the two agent branches was exactly the differing marker contents. No AI model generated these edits, so the result tests Git and the helpers rather than a model's behaviour.

**Test 2: the same task, from the same base (Phase 10).** Codex and Claude were given the same small task, a typed `subtract(a, b)` function with tests, from the same base commit in separate worktrees. Two details of the setup matter:

- The worktrees started from the committed base (two tests), not from the primary checkout's uncommitted edits (five tests). The primary's `main` never moved, its original files were byte-identical afterwards, and no subtract change leaked into it.
- Both worktrees were removed afterwards without force, and both branches were kept for review.

**What the experiment showed.** Both implementations had an identical signature and computation; only the docstrings differed. Codex added six test methods and ran them (the suite went from 2 to 8 passing); Claude added three, and my independent run passed 5 of 5. Claude's own test run was denied (see below). The documented review gate is tests, diff, history, compare, choose, merge, tests; for this task the Codex candidate was selected for broader committed coverage and a completed test run, and the docs state that this is a selection for one small task, not a claim that one model is better. Neither branch was merged.

**The limit, stated plainly.** The docs say worktrees prevent ordinary edit collisions, not malicious access. They share Git objects and anything else the operating system lets both processes read, so they are operational isolation, not a credential boundary or a sandbox. Git ignore rules are also not a history purge. This is why credentials, sessions, databases and generated indexes live outside every repository.

## Verifying instead of assuming

The most useful artefact in the repo is `docs/verification-matrix.md`. Each row has a capability, a status, an evidence source and the phase it was last verified. The statuses are VERIFIED, PARTIAL, CONFIGURED / NOT EXERCISED, SYNTHETIC ONLY, DISABLED, NOT CONFIGURED / NOT VERIFIED and NOT VERIFIED. Two entries show why that matters:

- Claude's coding implementation is VERIFIED, but its own test execution is PARTIAL: a bundled shell command was denied and was not retried, so I ran the tests myself.
- Claude's use of Graphify and Headroom is CONFIGURED / NOT EXERCISED. They were discovered and registered, but no successful invocation was recorded, so they are not marked verified.

## Challenges and trade-offs

- **Speed versus evidence.** Recording discovery, invocation and result separately is slower than assuming they work. It also stopped me from claiming Graphify or Headroom worked in Claude when I had no evidence.
- **Permissions friction.** A combined edit-and-test shell command was blocked by the tool allowlist. The docs' conclusion is to separate edits from the allowed test command, report denials promptly, and not use bypass-permissions or repeat model calls to turn a partial result into an apparent pass.
- **Snapshot decay.** Versions, model names and tool behaviour change quickly. The docs record Codex 0.162.0 and Claude Code 2.1.296; on 2026-11-01 the installed versions were 0.166.0 and 2.1.316, while Graphify 0.9.64 and Headroom 0.37.0 still matched. The docs say historical acceptance is not a live availability guarantee, and doctor checks classify OK, WARN, NOT VERIFIED and FAIL rather than reporting a single green tick.
- **Reproducibility is partial.** The repository documents the setup and records evidence, but it does not contain the applied configuration: the `config/codex`, `graphify`, `headroom`, `langfuse`, `omniroute` and `shared` folders hold only `.gitkeep` placeholders, and the only templates are `env/.env.example` and `config/omniroute.env.example`. Live configuration, state and credentials stay outside Git by design, so this is a documented, verifiable setup rather than a one-command rebuild.

## Lessons learned

**[AUTHOR TO PROVIDE]** The worktree experiment should carry this section, and the conclusions have to be yours. The records support these starting points, which are my reading of the reports, not your stated experience:

- A model-free isolation test (Test 1) is worth running before trusting any agent result; it separates "Git and my helpers work" from "the agent behaved".
- Starting worktrees from the committed base, not the dirty primary, is what made the comparison fair, and it also protected uncommitted work.
- Isolation is operational, not a security boundary; the credential rules did the real protective work.
- One small task is an anecdote, not a ranking.

Questions only you can answer are listed in the review notes (your reasons for choosing worktrees over separate clones, anything that surprised you, what you would change).

## Current limitations and next steps

- Fedora baseline only. The README says Windows setup and additional routing, proxying or tracing are not enabled.
- Graphify freshness is NOT VERIFIED; diagnostics do not rebuild indexes.
- No multi-agent orchestration exists, by design.
- **Future work (proposed, not built or verified):** a Telegram-based interface for starting and reviewing agent tasks. Nothing in the repository implements or tests it, so it should be described only as an idea. **[AUTHOR TO PROVIDE: what you intend it to do, and what safeguards it would need given the "nothing automatic" rule.]**
- **[AUTHOR TO PROVIDE]** Anything else you plan next.

---

## Review checklist (delete before publishing)

- [ ] Re-check every version and model name against the live setup.
- [ ] The `ai-dev-stack` repository is **private** (checked 2026-11-01); there is no `chore/prepare-public` branch and no commit after 2026-10-10. Either do not link it, or publish it first. Before making it public, remove absolute home-directory paths from its docs and reports (found in 16 of its 95 tracked files).
- [ ] Do not link or name the private repository's URL in the article. The Work page entry for AI Dev Stack currently links to it; decide whether to keep that link.
- [ ] Confirm what you are comfortable sharing about tools and accounts (plan names, Langfuse project name).
- [ ] Describe the Telegram interface only as future work unless it is built and verified.
- [ ] Add your own lessons from the worktree experiment and any problems you hit.
- [ ] Sources: `README.md`, `docs/final-architecture.md`, `docs/verification-matrix.md`, `docs/git-worktrees.md`, `docs/codex-vs-claude-workflow.md`, `reports/fedora/phase-10-end-to-end.md`.
