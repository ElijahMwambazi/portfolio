---
title: "Building a Market Data Adapter for Zambia's Exchange Rates"
slug: bank-of-zambia-fx-adapter
description: "How ZM Terminal reads the Bank of Zambia's published USD/ZMW rates without floats, local-time guesswork, or silent fallbacks, and what the adapter's tests are designed to catch."
category: "Bitcoin & Finance"
tags: ["fastapi", "python", "fx", "zambia", "testing"]
featured: false
draft: true
---

> **Draft status.** Written from the `zm-terminal` source and tests (adapter introduced in commit `dcbffca`; claims rechecked against the code and tests on 2026-11-01). Items marked **[VERIFY]** need your confirmation; items marked **[AUTHOR TO PROVIDE]** are things only you can supply. Delete this note and the review checklist before publishing.

## The problem

ZM Terminal is meant to be a Zambia-first market terminal: ZMW exchange rates, Lusaka Securities Exchange instruments, Treasury securities, Bitcoin, copper and macro indicators in one place. The first instrument I wired up end to end is USD/ZMW, using the Bank of Zambia (BoZ) as the source.

The project's README sets one rule that shaped everything below: the application deliberately does not display fabricated market prices. If the adapter cannot establish a trustworthy rate, the right answer is an error, not a plausible number.

## Constraints

- **An official source, not a vendor feed.** The adapter reads a JSON view published by the BoZ website, configured through `BOZ_USD_RATES_URL`. **[VERIFY: this is an undocumented website endpoint, not a contractual API. State clearly in the article whether you checked the BoZ's terms of use.]**
- **Awkward row shape.** Each observation carries `buying`, `mid_rate` and `selling` as strings, plus a `time` field that is not a timestamp but an HTML fragment containing a `<time datetime="...">` element and human-readable text.
- **Money values.** These are rates quoted to four decimal places in the test fixture. Floating point is the wrong tool for a value other code will multiply and compare.
- **No database in the path.** The adapter has to work when PostgreSQL and OpenBB are unavailable, so it is independent of both.

## Architecture and decisions

The application API (FastAPI) exposes `GET /api/v1/fx/USDZMW`. The route calls a small service module, `services/boz.py`, which fetches and validates the upstream payload and returns a typed `FxQuote`. OpenBB sits behind the same API for other data, but this adapter does not depend on it.

A few decisions did most of the work.

**Rates stay decimal strings from end to end.** The parser accepts a rate only if it matches a plain decimal pattern, converts it with `Decimal`, and never goes through `float`. The response model serialises `buy`, `mid` and `sell` as JSON strings. One test feeds in a rate with 30 decimal places and asserts it survives parsing and serialisation unchanged.

**Timestamps come from the machine-readable attribute, never the display text.** The adapter parses the HTML fragment with Python's `HTMLParser`, requires exactly one `<time>` element with a `datetime` attribute, and requires that attribute to be an explicit UTC timestamp (`Z` or `+00:00`). The visible text is ignored, and a test replaces it with "untrusted display text" to prove that. In the sample fixture, a row stamped `07:30:00Z` is displayed as `09:30`, which is the kind of mismatch that makes reading display text dangerous. **[VERIFY: the fixture's values are altered test data. Don't claim the live site shows this offset unless you checked.]**

**The symbol means ZMW per USD, without inversion.** The upstream labels the pair ZMW/USD. The application symbol `USDZMW` represents the same number, and the code does not invert it.

**The latest observation is chosen across all hours.** The BoZ website applies an additional hour filter whose rules are undocumented. The adapter does not try to reproduce it. It takes the newest valid timestamp in the payload, regardless of row order.

## Implementation details

Validation is strict by design. Every row is validated before one is selected, so a malformed older row cannot be skipped over to find a nicer one. The rules, each covered by a test:

- identical duplicate rows at the same timestamp collapse to one;
- two rows at the same timestamp with different rates raise an error, at either index;
- a bad timestamp fails the whole payload even if other rows are valid;
- malformed decimals, missing fields, an empty array or a changed overall shape all fail;
- reversing the row order gives the same result.

Staleness is a separate, explicit judgement. A quote is `stale` when its observation is more than 96 hours older than the retrieval time. The code comments call this an application heuristic that tolerates weekends and some holiday gaps, not a BoZ publication guarantee and not a holiday calendar. Tests pin the boundary: exactly 96 hours is fresh, 96 hours plus one second is stale. Stale quotes still return HTTP 200 with `stale: true`, so the caller decides what to do with them. An observation in the future, or any naive (timezone-less) datetime, raises rather than being treated as fresh.

Upstream failures are translated at the route:

| Condition | Response |
|---|---|
| Request timeout (10 s, no retries) | `504`, "Bank of Zambia request timed out" |
| HTTP error, connection error, non-JSON content type, invalid data | `502`, "Bank of Zambia data unavailable or invalid" |

A test injects errors whose messages contain internal host details and private payload text, and asserts the response body contains only the fixed safe message.

## Challenges and trade-offs

- **Failing loudly versus staying up.** Rejecting a whole payload for one bad row makes the endpoint less available. I chose that because a quietly chosen older rate is worse than an error in a financial display. **[AUTHOR TO PROVIDE: whether you actually weighed a "best effort" mode, and what pushed you to strict.]**
- **No caching, no persistence.** Every request goes to the BoZ. That keeps the data honest and the code simple, but it adds latency and load, and a BoZ outage is an application outage for this endpoint.
- **A heuristic freshness window.** 96 hours is a judgement, not a fact about BoZ publishing. It will mislabel in unusual calendar stretches.
- **Dependence on page structure.** The adapter parses an HTML fragment inside JSON. If the site changes that shape, the endpoint will fail with a 502, which is the intended behaviour, but it still needs someone to notice and fix it.

## Lessons learned

**[AUTHOR TO PROVIDE]** These should be your own words. What the code and tests support as starting points:

- Treat display text as untrusted even when the source is official.
- Decide what "stale" means in code and test its boundary, rather than leaving it implicit.
- Offline fixtures with a mocked HTTP transport let the whole adapter be tested without touching the BoZ, PostgreSQL or OpenBB.

## Current limitations and next steps

- Only USD/ZMW exists. The LuSE, crypto and commodity adapters are pending, and the README lists them as such.
- The frontend does not display the quote yet; frontend FX commands and historical charts remain pending.
- There are no stored quotes, so no history.
- Tests: the API suite (74 tests, of which 20 are the Bank of Zambia adapter and FX route tests) passed on 2026-11-01 in a clean virtual environment.

---

## Review checklist (delete before publishing)

- [ ] Confirm the BoZ endpoint and attribution are fine to describe publicly.
- [ ] Confirm the fixture offset statement is acceptable as described.
- [ ] Add your own lessons and any real-world incidents.
- [ ] Test claim verified 2026-11-01 (74 passed via pytest in a throwaway venv; `make api-test` itself uses Docker and was not run). Re-run before publishing if the code changes.
- [ ] Sources: `apps/api/app/services/boz.py`, `apps/api/app/schemas/fx.py`, `apps/api/app/api/router.py`, `apps/api/tests/test_boz.py`, `apps/api/tests/test_fx.py`, README.
