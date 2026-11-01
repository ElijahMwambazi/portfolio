---
title: "Building My AI Development Environment on Fedora"
slug: fedora-ai-development-stack
description: "A documented, verified setup for working with Codex CLI and Claude Code on Fedora: direct logins, Git worktree isolation, local-only context tools, and a verification matrix that records what was not exercised."
category: "Infrastructure"
tags: ["fedora", "codex", "claude-code", "git-worktrees", "mcp"]
featured: false
draft: true
---

> **Draft status.** Written from the `ai-dev-stack` repository (17 commits, 2026-09-19 to 2026-10-10; claims checked against the repository on 2026-11-01). Tool versions and model names are **a snapshot dated 2026-10-10**; two of them had already changed on the machine by 2026-11-01 (see "Snapshot decay"). **[AUTHOR REVIEW]** marks the only passages that need your personal confirmation. The repository is private, so this article summarises its evidence instead of linking it. Delete this note and the checklist before publishing.

## The problem

The aim was to work with more than one AI coding agent on the same machine without losing track of what each one could see, what it changed, and what had actually been verified. The result is a repository, `ai-dev-stack`, that is the version-controlled source of truth for a staged Fedora 43 workstation: operating documentation, diagnostic scripts, dated validation reports and two sanitised environment templates.

## Constraints and requirements

- **Direct authentication only.** Codex uses its own ChatGPT account login and Claude Code its own Claude.ai account login. `ANTHROPIC_BASE_URL` is kept unset, and no alternate gateway sits in the normal path.
- **Nothing automatic.** The stack does not launch agents, trace sessions or route requests on its own. One agent is started for one authorised task.
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
  `-- Claude  -> direct Claude.ai account auth
        +-- Graphify skill, Headroom stdio MCP (registered)

OmniRoute -> optional localhost gateway, OFF, zero providers
Langfuse  -> explicit synthetic metadata harness only
```

(This is a simplified rendering of the diagram in the repository's final-architecture document.)

**Version snapshot, as recorded in the repository's docs and final-state evidence on 2026-10-10.** Treat this as a dated record. Re-check before publishing; tools change quickly.

| Component | Version recorded 2026-10-10 |
|---|---|
| Codex CLI | 0.162.0 |
| Claude Code | 2.1.296 |
| Graphify | 0.9.64 |
| Headroom | 0.37.0 |
| OmniRoute | 3.8.50 |
| Langfuse SDK | 4.15.4 (Cloud, EU region) |

**Headroom: context management.** Headroom is context-management tooling. Its documented purpose here is context optimisation: compressing bulky content and keeping the original retrievable. It runs on demand as an offline stdio MCP server (MCP is the Model Context Protocol, the interface through which an agent calls external tools), with its own isolated environment, offline and no-telemetry settings, and a local store for exact retrieval, kept separately for Codex and for Claude. It is not in the model-request path, and no HTTP proxy is enabled. What the repository verified: deterministic compression on five synthetic fixtures (a short-code fixture stayed byte-identical), and, from a Codex session in Phase 10, an explicit `headroom_compress` call on synthetic repeated JSON (2,329 tokens to 1,388, 40.4% saved) followed by a `headroom_retrieve` that returned the original byte for byte. That is one synthetic case, not a general savings figure. For Claude, Headroom is registered but was never successfully invoked, so it is not marked verified.

**Graphify: a codebase-analysis and navigation experiment.** Graphify builds a graph of a codebase's files, symbols and relationships so an agent can ask about structure instead of reading every file. Here it runs as a skill or CLI in local `--code-only` mode: code is parsed locally with tree-sitter, document, paper and image semantic extraction is skipped, no API key is needed, output is kept outside the project, and at most two workers run. On a small calculator project it produced 15 nodes, 21 edges and three communities, and `explain` showed a function's importing module, containing module and calling tests; a rerun recognised the unchanged files and re-extracted none. The same phase recorded a limit: one broad compound `query` selected only two start nodes and did not enumerate every requested relationship, even though the graph contained them. Codex's use is verified; Claude's is only discovery of the skill. Whether an existing graph is current is NOT VERIFIED, because diagnostics never rebuild indexes, and graphs are treated as sensitive because they contain source-derived symbol names and paths.

**An optional gateway left switched off.** OmniRoute is installed and hardened for loopback, with its service inactive and zero providers configured. The docs keep it optional because enabling it would add provider authorisation and another credential boundary that direct Codex or Claude work does not need.

**Observability without content.** Langfuse Cloud (EU) is wired only to a synthetic, metadata-only harness. No coding prompts, responses or source are exported, and no automatic session tracing is enabled.

## The central experiment: isolating two agents with Git worktrees

The question these tests address is practical: if two agents work on the same project, what keeps one from trampling the other's edits, and how can that be checked? The answer tested was a Git worktree per agent.

**The design.** Each agent gets its own sibling worktree on its own branch, `codex/<task>` and `claude/<task>`. The main checkout stays on `main` for review and integration. A worktree has its own files, HEAD and index, while commits, branches, objects and repository configuration are shared. Three small helper scripts (`ai-worktree-create`, `ai-worktree-status`, `ai-worktree-remove`) require an explicit project path, print their actions and base commit before changing anything, and refuse to overwrite an existing path or branch. They never launch an agent, commit, merge or push. A status check run before each session fails when you are on `main`, in the other agent's worktree, or inside a nested repository.

**Test 1: isolation without a model (Phase 9).** Before involving any agent, deterministic local edits created a marker file containing `codex` or `claude` in each worktree and committed it separately. Each worktree had the correct independent branch, root, marker and clean status; the primary checkout had no marker; and the diff between the two agent branches was exactly the differing marker contents. No AI model generated these edits, so the result tests Git and the helpers rather than a model's behaviour.

**Test 2: the same task, from the same base (Phase 10).** Codex and Claude were given the same small task, a typed `subtract(a, b)` function with tests, from the same base commit in separate worktrees. Two details of the setup matter:

- The worktrees started from the committed base (two tests), not from the primary checkout's uncommitted edits (five tests). The primary's `main` never moved, its original files were byte-identical afterwards, and no subtract change leaked into it.
- Both worktrees were removed afterwards without force, and both branches were kept for review.

**What the experiment showed.** Both implementations had an identical signature and computation; only the docstrings differed. Codex added six test methods and ran them (the suite went from 2 to 8 passing); Claude added three, and the operator's independent run passed 5 of 5. Claude's own test run was denied (see below). The documented review gate is tests, diff, history, compare, choose, merge, tests; for this task the Codex candidate was selected for broader committed coverage and a completed test run, and the docs state that this is a selection for one small task, not a claim that one model is better. Neither branch was merged.

**The limit, stated plainly.** The docs say worktrees prevent ordinary edit collisions, not malicious access. They share Git objects and anything else the operating system lets both processes read, so they are operational isolation, not a credential boundary or a sandbox. Git ignore rules are also not a history purge. This is why credentials, sessions, databases and generated indexes live outside every repository.

## Verifying instead of assuming

The most useful artefact in the repo is `docs/verification-matrix.md`. Each row has a capability, a status, an evidence source and the phase it was last verified. The statuses are VERIFIED, PARTIAL, CONFIGURED / NOT EXERCISED, SYNTHETIC ONLY, DISABLED, NOT CONFIGURED / NOT VERIFIED and NOT VERIFIED. Two entries show why that matters:

- Claude's coding implementation is VERIFIED, but its own test execution is PARTIAL: a bundled shell command was denied and was not retried, so the operator ran them independently.
- Claude's use of Graphify and Headroom is CONFIGURED / NOT EXERCISED. They were discovered and registered, but no successful invocation was recorded, so they are not marked verified.

## Challenges and trade-offs

- **Speed versus evidence.** Recording discovery, invocation and result separately is slower than assuming they work. It also keeps the matrix from claiming that Graphify or Headroom worked in Claude when there is no evidence.
- **Permissions friction.** A combined edit-and-test shell command was blocked by the tool allowlist. The docs' conclusion is to separate edits from the allowed test command, report denials promptly, and not use bypass-permissions or repeat model calls to turn a partial result into an apparent pass.
- **Snapshot decay.** Versions, model names and tool behaviour change quickly, so every version here is a dated snapshot, not a statement about what is installed now. The docs state that historical acceptance is not a live availability guarantee, and doctor checks classify OK, WARN, NOT VERIFIED and FAIL rather than reporting a single green tick.

- **Reproducibility is partial.** The repository documents the setup and records evidence, but it does not contain the applied configuration: the `config/codex`, `graphify`, `headroom`, `langfuse`, `omniroute` and `shared` folders hold only `.gitkeep` placeholders, and the only templates are `env/.env.example` and `config/omniroute.env.example`. Live configuration, state and credentials stay outside Git by design, so this is a documented, verifiable setup rather than a one-command rebuild.

## Lessons learned

The lessons below are the ones the repository's records support. They are stated as documented findings, not as personal reactions. **[AUTHOR REVIEW: confirm that each reflects your own conclusions, and edit or cut any that does not.]**

1. **Isolate each agent in its own Git worktree.** A model-free test (the marker-file check in Phase 9) separated "Git and the helpers isolate correctly" from "an agent behaved". Starting each worktree from the committed base, not the dirty primary checkout, kept the comparison fair and left the primary checkout's uncommitted work and `main` untouched.
2. **Make agent output independently verifiable.** Claude's coding result was accepted because the operator ran the tests independently (5 of 5), not because the agent reported success, and its own denied test run was recorded as PARTIAL rather than hidden. The verification matrix applies the same rule to tools: installed, discovered, invoked and succeeded are different states.
3. **Compare explicitly, on equal terms.** Both agents received the same specification and base commit, and the diff was reviewed against the base and against each other. The docs treat one small task as a selection for that task, not a ranking of models.
4. **Keep a human in the review gate.** The documented gate is tests, diff, history, compare, choose, merge, tests. Nothing in the stack launches agents, commits, merges or pushes on its own, and neither compared branch was merged.
5. **Isolation is operational, not a security boundary.** Worktrees prevent ordinary edit collisions. They share Git objects and anything else the operating system lets both processes read, so they are not a sandbox or a credential boundary. Credentials, sessions, databases and generated indexes stay outside every repository, and Git ignore rules are not a history purge.

## Current limitations and future work

**Limitations (documented).**

- Fedora baseline only. The README says Windows setup and additional routing, proxying or tracing are not enabled.
- Graphify freshness is NOT VERIFIED; diagnostics do not rebuild indexes.
- Claude's use of Graphify and Headroom, and its own test execution, are not verified.
- No multi-agent orchestration exists, by design.

**Future work.** None of the following is built or verified. Each is a direction, not a result.

- **Reproducibility.** Capture the applied configuration so the setup can be rebuilt from the repository, instead of only documented and audited. Today the live configuration lives outside Git.
- **Observability.** Langfuse is wired only to a synthetic, metadata-only harness. Extending tracing to real agent work would have to keep the rule that no prompts, responses or source are exported.
- **Controlled agent orchestration.** Any orchestration would have to preserve the review gate and the "nothing automatic" rule, so the operator still decides what runs.
- **A Telegram interface (planned).** Planned remote task submission, status reporting and result review from a phone. It is not built, and nothing in the repository implements or tests it. The planned safeguards are authentication of who may submit tasks, constrained execution limited to approved tasks and worktrees, and explicit human approval before results are accepted or anything is merged. **[AUTHOR REVIEW: confirm this description matches what you intend, and add anything about scope or timing you are willing to state.]**

---

## Review checklist (delete before publishing)

- [ ] Re-check every version and model name against the live setup.
- [ ] The `ai-dev-stack` repository is **private** (checked 2026-11-01); there is no `chore/prepare-public` branch and no commit after 2026-10-10. Either do not link it, or publish it first. Before making it public, remove absolute home-directory paths from its docs and reports (found in 16 of its 95 tracked files).
- [ ] Do not link or name the private repository's URL in the article. The Work page entry for AI Dev Stack currently links to it; decide whether to keep that link.
- [ ] Confirm you are comfortable naming the tools, the Langfuse region, and the version snapshot. Subscription plan names and the Langfuse project name are deliberately omitted.
- [ ] Describe the Telegram interface only as planned work unless it is built and verified.
- [ ] Review the five lessons and the Telegram paragraph (the only remaining `[AUTHOR REVIEW]` markers).
- [ ] Sources: `README.md`, `docs/final-architecture.md`, `docs/verification-matrix.md`, `docs/git-worktrees.md`, `docs/codex-vs-claude-workflow.md`, `reports/fedora/phase-10-end-to-end.md`.
