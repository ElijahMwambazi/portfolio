---
title: "Designing a Bitcoin–Mobile Money Bridge for Zambia"
slug: bitcoin-mobile-money-bridge
description: "How Ntumba models payments between Bitcoin and Zambian mobile money: three payment directions, operator liquidity, a settlement saga, and an honest account of what is custodial and what is still only simulated."
category: "Bitcoin & Finance"
tags: ["bitcoin", "lightning", "payments", "zambia", "architecture"]
featured: false
draft: true
---

> **Draft status.** Written from the `ntumba` README and docs (`PAYMENT_FLOWS.md`, `ARCHITECTURE.md`, `PRIVACY.md`). Ntumba currently uses deterministic fake provider adapters only, and this article says so throughout. Items marked **[VERIFY]** or **[AUTHOR TO PROVIDE]** need you. Delete this note and the checklist before publishing.

## The problem

A merchant in Zambia often wants to be paid in one rail and receive value in another: a customer holds Bitcoin, the merchant wants kwacha in a mobile-money wallet, or the other way round. Ntumba is my attempt to model that as a payment-request flow where the merchant never opens an account.

The product idea in one line, from the README: an accountless payment bridge with direct settlement and no merchant balances.

## Constraints and requirements

- **No merchant accounts.** Merchants create one-time requests without registering. Payers open a link as anonymous guests.
- **No stored balances for merchants.** Value is settled to the merchant's own destination, not parked with Ntumba.
- **Privacy by default.** No merchant profile, raw destinations in URLs, payer phone numbers, raw callbacks, wallet credentials or API keys are persisted server-side (per `PRIVACY.md`).
- **Money must never move twice.** Callbacks can repeat, arrive late or arrive out of order, so every step has to be idempotent.
- **Honesty about custody.** Some directions cannot be non-custodial. The design has to say which.

## Three payment directions

| Direction | How it works | Custody |
|---|---|---|
| BTC → BTC | The payer pays a merchant-owned Lightning invoice directly. | Non-custodial. Ntumba never receives or forwards the Bitcoin. |
| BTC → ZMW | Intended design: collect Bitcoin on an operator-controlled Voltage-hosted LND node, then disburse ZMW from the operator's Lipila balance. | Custodial during settlement. |
| ZMW → BTC | Intended design: collect ZMW into the operator's Lipila balance, then pay the merchant's invoice from the operator's LND node. | Custodial during settlement. |

For the two conversion directions, Ntumba controls both liquidity legs, so the money is in the operator's hands between collection and payout. Merchants still have no Ntumba account or balance, but I won't describe the conversion rails as non-custodial, because they are not.

## Architecture

Ntumba is a TypeScript modular monolith: a React merchant PWA, a Fastify API, PostgreSQL for operational and treasury state, and `pg-boss` for a purge job. The merchant's history lives in IndexedDB on their own device and is never synchronised.

Treasury logic sits behind explicit boundaries: a Bitcoin liquidity rail, a mobile-money liquidity rail, a settlement coordinator, a destination vault, an asset-specific journal and a reconciliation service. All providers are currently deterministic fakes.

> **What is real and what is not.** No Voltage connection, Lipila connection, live exchange rate, mainnet payment or real funds exist in this codebase. The bridge gate defaults to `disabled`; development may choose `fake`; production rejects fake execution. Real provider behaviour is **unverified** (the docs say so, and so should this article).

## Implementation details

**One-time, claim-once requests.** A merchant creates a request that stays open for 15 minutes by default. Method selection creates a fresh 60-second, integer-only quote that the guest must explicitly confirm. Confirmation takes a row lock and moves the request from `open` to `claimed`, recording the winning selection key and quote and allocating a stable payment-intent UUID. A different claimant gets a conflict; the winning key resumes the same intent.

**Destinations stay out of URLs and out of the database.** The merchant's raw destination (mobile number, Lightning address or invoice) goes into a development-only, expiring in-memory vault, and only an opaque token is persisted. If the vault loses the value after the source side has settled, the saga does not pretend success: it releases unmoved liquidity, creates one refund obligation and enters `refund_required`. Production would need provider tokenisation or a short-lived envelope-encrypted store; neither is built (`docs/CURRENT_STATE.md`, "Not implemented").

**Liquidity is reserved before it is promised.** Before collecting, the coordinator reserves destination-side inventory. Spendable value is the current book balance minus active reservations, computed with a row lock, so concurrent requests cannot over-reserve. Journal movements, inventory changes, the reservation and the lifecycle update share one transaction.

**Two legs, two journals.** Source and destination are separate legs with separate idempotency keys. The treasury journal is append-only and balanced independently in BTC and ZMW, linked by an exchange reference.

**Callbacks are verified before they are believed.** The fake treasury sends events signed with an HMAC over the timestamp and exact raw bytes. Missing, invalid or more-than-five-minutes-old signatures are rejected before parsing. A repeat of an identical event is acknowledged as a duplicate; the same event ID with different bytes is rejected.

**Failure has named states.** The documented state model includes `source_payment_failed`, `destination_settlement_failed`, `liquidity_unavailable`, `rate_expired`, `refund_required`, `refund_pending`, `refunded` and `manual_review`. Rules worth calling out:

- an unknown outcome maps to manual review and must not trigger a second payment;
- a confirmed destination failure may retry only with its original settlement key;
- a source settlement that becomes conclusive after the request expired is journaled once and produces one refund obligation, and the destination leg is never started;
- a poisoned provider event is retried with bounded backoff, then dead-lettered, while later unrelated events keep flowing.

## Challenges and trade-offs

- **Custody versus convenience.** Conversion needs inventory on both sides, which means holding someone's value for a short time. The accountless design limits what is stored, but it does not remove that trust.
- **Direct payments are unverifiable by default.** In BTC → BTC the funds go from payer to merchant, so Ntumba can't see them. Status stays `direct_payment_pending` until a merchant-wallet integration or independent proof exists.
- **Privacy versus recoverability.** A non-durable destination vault is good for privacy and bad for crash recovery. The current answer is refund, not retry.
- **Complexity of the saga.** Late events, unknown outcomes and refunds make the state machine large. **[AUTHOR TO PROVIDE: which parts you found hardest, and what you cut.]**

## Lessons learned

**[AUTHOR TO PROVIDE]** Candidate themes the documents support, to be confirmed or replaced by your real experience:

- Writing the failure states before the happy path changed the design.
- "Unknown" needs to be a first-class outcome that never causes a retry.
- Being explicit that conversions are custodial is more useful than a vague "non-custodial" claim.

## Current limitations and next steps

- Fake providers only; no real funds.
- The destination vault is process memory (a development-only store), so an open request whose destination is gone becomes unavailable. Public request reads are durable and multi-instance, but payment is not, because the destination lives in one process.
- Real Voltage and Lipila semantics, fees, limits and failure modes are unverified. The repo states that no Voltage or Lipila integration, credentials or network calls exist, so this article should not describe their features.
- Integrating real providers and a production-safe destination store are the next major steps.

---

## Review checklist (delete before publishing)

- [ ] Confirm Voltage and Lipila are the providers you still intend, and that naming them publicly is fine.
- [ ] Confirm every "intended design" sentence still matches your plan.
- [ ] Add your own experience for lessons and trade-offs.
- [ ] Sources: `README.md`, `docs/PAYMENT_FLOWS.md`, `docs/ARCHITECTURE.md`, `docs/PRIVACY.md`.
