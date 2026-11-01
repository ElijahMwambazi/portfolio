---
title: "Building an Explainable Anomaly Investigation Tool"
slug: explainable-claims-anomaly-investigation
description: "Lessons from building a local desktop tool that flags unusual health-claims patterns for human review: explainable findings, conservative numbers, local-first data handling, and UI tests that run without a screen."
category: "Engineering"
tags: ["python", "pyside6", "pandas", "explainability", "testing"]
featured: false
draft: true
---

> **Draft status and confidentiality.** Written from the private repository for this tool (README, user guide, release-verification doc, tests). It describes work done in a business context, so I have **anonymised it**: no organisation, provider, member or claim names; no screenshots (the repo's screenshots are from sample data, but they are not reproduced here); and no exact detector thresholds. **[AUTHOR TO PROVIDE]** whether you may publish this at all, whether the product name (the repo uses "MedIQ") and the domain can be named, and how much detector detail is acceptable. Delete this note and the checklist before publishing.

## The problem

Claims reviewers need to check a member's history before they process a claim, and unusual billing patterns are easy to miss when the data arrives as a series of spreadsheet exports. The tool I built gives a reviewer one place to import those exports, look up a member, and see which records look unusual and why.

Its first design rule, written into both the README and the user guide: findings are **anomalies for review, not fraud determinations**.

## Constraints and requirements

- **Windows desktop, usable without installing Python.** Reviewers run a packaged executable; developers can run from source.
- **Data stays on the machine.** Claims are stored in a local SQLite database. The app does not encrypt it, and the docs say so plainly and point to device encryption, access control and retention policy.
- **Exports overlap.** Weekly and monthly exports repeat earlier visits, so importing the same visit twice must not inflate any total.
- **Explainable by construction.** A reviewer must be able to see exactly which records caused a flag and what rule fired.
- **Never block the claims workflow.** Optional reporting and telemetry must be best-effort.

## Architecture and decisions

The stack is Python 3.11 with PySide6 for the UI, pandas and openpyxl for reading and writing Excel, and SQLite for storage. Packaging uses PyInstaller in a verified `onedir` layout.

**Findings are rules, not scores.** Each detector is a small, readable rule with a stated confidence level, and the evidence dialog lists every record in the group (visit, provider, invoice, dates, amounts, status). The user guide describes the confidence levels and what each means. **[AUTHOR TO PROVIDE: decide whether to name the rule types and confidence labels publicly.]**

**Context is not a verdict.** A missing invoice or a diagnosis is shown as context for review. By design neither can raise a finding to the highest confidence on its own.

**Conservative money numbers.** Duplicate exposure is computed once per exact-invoice cluster as the sum of the cluster's values minus the largest, on the reasoning that one of the claims may be legitimate. Near matches are review-only and are excluded from headline totals. Missing values stay missing: they are never converted to zero, and an incomplete cluster shows a "known related value" but no invented exposure figure. The paid-status assumption used for "approved/paid" figures is labelled in the docs as a supplied operational assumption, not a universal rule.

**One cumulative local history.** A new workbook never replaces the database. New visits are added, changed visits are updated by visit number, unchanged visits are left alone, and an exact repeat of a workbook is detected by its SHA-256 hash and skipped before any processing. Each workbook is imported atomically. In a batch, a malformed file is reported without partial writes and the rest are still attempted. Detectors run over all history by default, so a pattern split across two exports is still caught, and an analysis-scope control lets a reviewer switch to the latest import only.

## Implementation details

- **Explainability in the UI.** A case-first Findings view shows one row per case, not per claim, with filters for type, confidence, provider, member and date range. The summary keeps case count, claim count, member count and flagged value distinct, and states that flagged value is not duplicate exposure. "Copy as note" produces a plain-text summary a reviewer can paste into the claims system.
- **Filtering and exploration.** A claims explorer offers search, status, invoice-status, risk and date filters, advanced filters and paging, plus analytics tables for missing invoices and repeat patterns.
- **Supervisor trends.** A trend view compares flagged volume by import, week or month. "Trending up" is defined precisely (latest period above the average of earlier ones, with zero-flag periods counted as zero) and the docs label it a prioritisation signal, not evidence.
- **Privacy boundary for reporting.** The app has a separate, offline-first outbox for coarse usage telemetry that never carries claim, member, provider, invoice or financial content, and it can be switched off with an environment variable. Reporting a case to management is a separate, explicit action behind a confirmation dialog whose default is Cancel. **[VERIFY and AUTHOR TO PROVIDE: confirm you can describe this at all, and whether these features are live or only designed.]**

## Testing the UI without a screen

The UI is tested with pytest on both Linux and Windows runners in CI. Qt runs with `QT_QPA_PLATFORM=offscreen`, so no display is needed.

- Page-level tests build a real main window against a temporary SQLite database, import synthetic data and check behaviour: empty-state routing, restored-data routing, scope changes that refresh alerts while leaving the member's cumulative history alone, non-blocking import success versus modal errors.
- A navigation smoke test visits every page, opens the evidence and settings dialogs, then resizes the window between 900×620 and 1600×1000 and asserts that key controls stay inside their containers.
- A separate packaged smoke test launches the frozen executable in a path containing spaces, renders the window offscreen, imports a bundled synthetic workbook, runs the detectors, navigates every page and writes and reopens the Excel exports.

These are regression checks for layout and flow, not pixel comparisons. **[VERIFY: say whether you ever used screenshot comparison; I found no evidence of it in the tests I read.]**

## Challenges and trade-offs

- **Being conservative costs recall.** Excluding near matches from totals and refusing to guess missing values means the headline numbers understate. That was a deliberate choice for a tool whose output people will act on. **[AUTHOR TO PROVIDE: how reviewers responded.]**
- **Local-first means local risk.** No server means no central access control, and the unencrypted database depends on the organisation's device policy.
- **Explaining a flag takes UI work.** Evidence dialogs, case views and tooltips took more effort than the detectors.
- **Overlapping exports.** Making imports idempotent and order-independent was most of the data-layer work.

## Lessons learned

**[AUTHOR TO PROVIDE]** Your real lessons. The documents support these as starting points only.

- Name what the number is not (not fraud, not duplicate exposure) next to the number.
- Treat "missing" as a state, not zero.
- Offscreen Qt tests let CI catch layout and flow regressions cheaply.

## Current limitations and next steps

- Findings are heuristics for human review, and the tool does not produce determinations.
- The local database is unencrypted by the application.
- No installer or automatic update mechanism ships today; a secure update design exists only as a document. **[VERIFY]**
- **[AUTHOR TO PROVIDE]** What is planned.

---

## Review checklist (delete before publishing)

- [ ] **Permission to publish.** Confirm with the owner/employer that this can be described in public, and at what level of detail.
- [ ] Remove or generalise the product name, provider and domain terms if required.
- [ ] Do not add screenshots unless they contain only synthetic data and you have checked each one.
- [ ] Confirm no detector thresholds, column names, hostnames or telemetry endpoints appear.
- [ ] Sources: `README.md`, `docs/USER_GUIDE.md`, `docs/WINDOWS_RELEASE_VERIFICATION.md`, `tests/test_ui_phase1.py`, `tests/test_window_smoke.py`, `.github/workflows/ci.yml`, `requirements.txt`.
