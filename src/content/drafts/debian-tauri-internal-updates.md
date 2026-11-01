---
title: "Building an Internal Update Server with Debian, Nginx and Tauri"
slug: debian-tauri-internal-updates
description: "How a Tauri desktop app can fetch signed updates from a small server on a private network, and what an internal Debian and Nginx setup has to get right."
category: "Infrastructure"
tags: ["tauri", "debian", "nginx", "updates", "signing"]
featured: false
draft: true
---

> **Draft status: outline, not a finished article.** I searched your GitHub repositories and local project folders and found **no source, configuration or notes for this setup**: no Debian provisioning, no Nginx config, no LAN DNS records, no Tauri updater configuration, no MSI packaging. The only Tauri project I can see (Drop Den) has no updater configured and builds an RPM. So every statement about *your* environment is a placeholder below. The Tauri updater facts are from the official documentation and are marked as such. Nothing here should be published until you fill in the **[AUTHOR TO PROVIDE]** sections from your real setup.

## The problem

**[AUTHOR TO PROVIDE]** What application needed updates, who runs it, how many machines, and why a public release channel (such as GitHub Releases) was not suitable. Typical reasons to check against your reality: machines without internet access, a policy against external downloads, or a need to control rollout timing.

## Constraints and requirements

**[AUTHOR TO PROVIDE]** Your real constraints. Prompts:

- Operating system and version of the clients (Windows is implied by the MSI mention) and of the server (Debian 13).
- Network shape: single site or several, VLANs, any proxy or firewall in the path.
- Who can publish an update, and who must approve one.
- What happens if the update server is down. Does the app keep working?

## Architecture and technical decisions

### What Tauri's updater needs (from the Tauri v2 documentation)

This part is documented and verifiable; confirm it against the Tauri version you actually used. **[VERIFY]**

- Updates **must be signed** and signature checking cannot be disabled. You generate a key pair with `tauri signer generate`, put the **public key content** (not a file path) in `plugins.updater.pubkey` in `tauri.conf.json`, and supply the private key at build time through the `TAURI_SIGNING_PRIVATE_KEY` environment variable (optionally with `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`).
- If you lose the private key you cannot publish updates to already-installed copies.
- Setting `bundle.createUpdaterArtifacts` to `true` makes the build emit updater artifacts with `.sig` files. On Windows the MSI and NSIS installers themselves are the update bundles.
- `plugins.updater.endpoints` is a list of URLs. The client moves to the next URL only when a response is not 2xx. URLs may contain `{{current_version}}`, `{{target}}` and `{{arch}}`.
- TLS is enforced in production. A non-HTTPS endpoint needs `dangerousInsecureTransportProtocol: true`, which the docs say to use with caution.
- The update server can be a **static JSON file** or a dynamic endpoint. A dynamic server returns `204` when there is no update and `200` with `version`, `url` and `signature` when there is one.
- On Windows, `plugins.updater.windows.installMode` is `passive` (default), `basicUi` or `quiet`. `quiet` works only for per-user installs or when the app already has admin rights.

An illustrative static manifest in the documented shape (placeholder URL and values, **not** from your setup):

```json
{
  "version": "1.2.0",
  "notes": "Example release notes",
  "pub_date": "2026-01-01T00:00:00Z",
  "platforms": {
    "windows-x86_64": {
      "signature": "<contents of the .sig file>",
      "url": "https://updates.example.invalid/app_1.2.0_x64.msi"
    }
  }
}
```

The docs state that Tauri validates the whole file before checking `version`, so every platform entry must be complete.

### Your server and network

**[AUTHOR TO PROVIDE]** The real design. Prompts, in the order a reader would ask them:

1. Why a static manifest served by Nginx, rather than a dynamic endpoint?
2. How clients resolve the update server: the internal DNS record type, who owns it, and how it is documented.
3. How TLS works on a private name: which certificate authority issued the server certificate, and how clients come to trust it. (This is the point most likely to break an internal updater, and it connects to your certificate-distribution experience in the Windows deployment article.)
4. Where artifacts and the manifest live on disk, and who or what can write to them.
5. What Debian 13 provides here, and any hardening you applied. Don't list hardening steps you did not take.

## Implementation details that can be verified

**[AUTHOR TO PROVIDE]** Only include what you can reproduce or show. Candidates:

- The Nginx server block (remove real hostnames, paths and addresses before publishing).
- The release procedure: build, sign, upload, update the manifest. Which steps are scripted?
- How the MSI is produced and how it relates to the `.sig` file. **[VERIFY: the Tauri docs describe MSI and NSIS installers as Windows update bundles; confirm which you used.]**
- How you tested an update end to end, including a tampered artifact and a wrong key.

## Challenges and trade-offs

**[AUTHOR TO PROVIDE]** What actually went wrong or required a decision. Possible angles, to keep only if true: private-CA trust on clients, manifest/artifact ordering during publishing, clients behind a proxy, rollback when a bad build ships, the installer needing elevation.

## Lessons learned

**[AUTHOR TO PROVIDE]** In your own words, from experience.

## Current limitations and next steps

**[AUTHOR TO PROVIDE]** Known gaps in the setup (monitoring, key rotation and recovery, rollback, staged rollout).

---

## Review checklist (delete before publishing)

- [ ] Decide whether this article can be written from memory and notes. If the work was done for an employer or client, confirm what you may publish, and anonymise hostnames, IP ranges, paths, product names and people.
- [ ] Provide the missing evidence listed above, or drop the article.
- [ ] Re-verify the Tauri facts against the version in use (docs: `v2.tauri.app/plugin/updater/`).
- [ ] Do not publish signing keys, key fingerprints, manifests with real URLs, or internal DNS names.
