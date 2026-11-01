---
title: "What I Learned Deploying Windows Applications Across an Office"
slug: windows-office-application-deployment
description: "Field notes on shipping a Windows desktop application to an office: what a verified build looks like, and the packaging, signing, deployment and rollout lessons that need your first-hand account."
category: "Infrastructure"
tags: ["windows", "deployment", "packaging", "msi", "operations"]
featured: false
draft: true
---

> **Draft status: partly outline.** The headline topics are **MSI packaging, certificate distribution, Action1 deployment, pilot testing and rollout strategy**. This describes real deployment work you carried out, but its operational evidence (packaging scripts, certificates, deployment-tool configuration, pilot and rollout records) is not in the repositories or local files I could search, and I make no inference from that absence. The first-hand parts below are therefore **[AUTHOR TO PROVIDE]** prompts. The second section summarises build-and-verify practices from a separate project's documentation; **that project is employer-related, so treat that section as flagged confidential content** until you decide what may be said. Nothing company-specific is included. Delete this note and the checklist before publishing.

## The problem

**[AUTHOR TO PROVIDE]** What you had to deploy, to how many machines, who the users were, and what "across an office" meant in practice (managed domain or not, remote or local, mixed Windows versions). Keep it anonymous: no company, site, hostname or people.

## Constraints and requirements

**[AUTHOR TO PROVIDE]** Real constraints. Prompts:

- Standard users without admin rights?
- A policy on unsigned software, SmartScreen or antivirus prompts?
- Whether devices were managed centrally and whether the app needed to run offline.
- Downtime tolerance and who could approve a rollout.

## What I can document: a build I could trust

One of my Windows projects (a Python desktop tool) shows the build-and-verify half of this story, and it is checked into the project's docs:

- **Reproducible build.** A pinned Python version, a clean virtual environment, and a single build script producing a versioned `onedir` folder. The version in code supplies the artifact name and the Windows file metadata.
- **Don't ship the developer machine.** The build temporarily sanitises `PATH` during dependency analysis so unrelated Qt, OpenSSL or other libraries on a developer's PC cannot leak into the package.
- **A smoke test of the frozen app, not the source.** After building, a verifier launches the packaged executable from a path containing spaces and runs the main workflow offscreen: import a bundled synthetic workbook, run the analysis, visit every page, export and reopen files, restart and reload.
- **A CI build on a clean Windows runner** uploads the artifact and the non-sensitive smoke reports, with no production credentials.
- **No admin rights at runtime.** Mutable data goes under the user's profile, never beside the executable, and configuration comes from user or system environment variables, not compiled-in values.
- **A manual clean-machine checklist** run as a standard user on a machine without Python or developer tools: extract the whole folder (not just the `.exe`), confirm no console window or missing-DLL dialog, test with spaces in paths and with the network disconnected, and record OS build, architecture, artifact hash and Git revision as release evidence.
- **Honest scope.** The doc states it does not deploy the app, create an installer or perform the final rollout exercise, and that until release signing exists the artifact should be distributed only through a controlled path.

## Architecture and technical decisions

**[AUTHOR TO PROVIDE]** The deployment design you actually used. Questions a reader would ask:

1. **Packaging.** Why MSI? Which tool produced it? How did you handle per-machine versus per-user install, and silent install switches?
2. **Signing and trust.** Was the installer signed? With what kind of certificate? How did machines come to trust it? If you distributed a certificate, how, and how did you avoid training users to ignore warnings?
3. **Deployment tooling.** What did Action1 do for you (software packaging, targeting, scheduling, reporting)? **[VERIFY against Action1's documentation before describing any feature.]**
4. **Rollout.** Pilot group selection, success criteria, how long each stage lasted, and how you decided to go wider.
5. **Rollback.** How you would have backed out, and whether you ever had to.

## Implementation details that can be verified

**[AUTHOR TO PROVIDE]** Only things you can show or reproduce, with identifiers removed. Examples: the exact msiexec options, the detection rule used to tell whether the app was installed, the pre-requisite checks, log locations. Do not publish real hostnames, group names, policy IDs, certificate thumbprints or tenant details.

## Challenges and trade-offs

**[AUTHOR TO PROVIDE]** Real troubleshooting stories, which are the part readers will value most. From the sourced project, the documented failure modes are: a missing-DLL error from copying files instead of the whole folder, a missing Qt platform plugin when security software quarantined files, and settings that only apply after restarting the process. Include them only if you hit them.

## Lessons learned

**[AUTHOR TO PROVIDE]** Your lessons. Don't reuse the ones above unless they match your experience.

## Current limitations and next steps

**[AUTHOR TO PROVIDE]** What remains manual, what you'd automate, and any open issues such as code-signing, automatic updates or monitoring.

---

## Review checklist (delete before publishing)

- [ ] This article needs your first-hand account of MSI, signing, certificate distribution, Action1 and the pilot. Without it, don't publish.
- [ ] Confirm permission to publish anything derived from a workplace deployment, and anonymise it.
- [ ] Remove all internal names, addresses, policies, certificate details and personnel.
- [ ] Verify tool-specific claims (Action1, MSI options) against vendor documentation.
- [ ] Sources for the documented section: `docs/WINDOWS_RELEASE_VERIFICATION.md`, `docs/OTA_UPDATES.md`, `.github/workflows/windows-package.yml` (names only; I did not read the workflow file's contents).
