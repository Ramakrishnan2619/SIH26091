# Product Vision Document
**Project (working name):** VyapaarSathi
**Problem Statement:** SIH 26091 — AI-Driven Hyper-Local Business Advisory and Financial Structuring Assistant for Rural Micro-Entrepreneurs
**Organization:** Ministry of Social Justice and Empowerment (MoSJE)
**GCP Project ID:** `sih26-508313`

---

## 1. Problem Summary

Rural and semi-urban first-time entrepreneurs can access concessional government credit (10% margin money + 90% concessional loan, via NSFDC-style schemes) relatively easily, but two things routinely cause the funded business to fail or the beneficiary to never apply confidently:

1. **No hyper-local market intelligence** — beneficiaries pick a business by anecdote, not by checking whether the local area can actually support it.
2. **No financial clarity** — beneficiaries can't calculate their real project-cost ceiling, which scheme they fall into, or what their actual repayment burden will be.

## 2. Vision Statement

> Give a rural first-time entrepreneur, in under two minutes, the same quality of feasibility and financial-structuring insight a bank's credit officer or a paid consultant would normally provide — grounded in real local data, not generic AI guesswork, and in their own language.

## 3. Core Modules (as mandated by the PS)

| Module | Function | Status in this build |
|---|---|---|
| **Module 1 — Hyper-Local Feasibility Report** | 6-point report: Market Reach, Opportunity Analysis, SWOT, Threats, Competitor Mapping, Product Market Value | ✅ **Real** — grounded via Places API (New) + Places Aggregate API (live) + LGD/Census/HCES/DDP static Layer 2 DB (already built) + Vertex AI Gemini synthesis |
| **Module 2 — Smart Financial Calculator & Scheme Router** | Project Cost / Loan Amount calculation, Micro Finance vs Term Loan auto-routing, EMI + moratorium amortization schedule | ✅ **Real** — pure deterministic backend logic, no AI, no external API dependency |

## 4. Value-Add Features Beyond the Bare PS Ask

These were deliberately added because they make Module 1 and Module 2 function as one connected product instead of two bolted-together tools, and they directly serve the PS's own Impact Goals.

| Feature | What it does | Build status |
|---|---|---|
| **Integration Bridge (M1 ⇄ M2)** | M1's price/revenue estimate + M2's EMI feed into an FOIR affordability check (🟢🟡🔴) and a break-even units/month calculator | ✅ Real, deterministic |
| **Stress-test scenario** | Re-runs FOIR at 70% revenue (lean-season case) using M1's own flagged seasonal Threats | ✅ Real, deterministic |
| **What-if capital slider** | Live recompute of PC/Loan/Scheme/EMI/FOIR as user drags margin-capital input | ✅ Real, pure function, no new API calls |
| **Dynamic Eligibility Matrix** | Routes Micro Finance / Term Loan selection by beneficiary category (social category, gender, disability, ex-servicemen) in addition to project cost | ✅ Real — static rule table |
| **Search for Schemes** | Broader "which other government schemes could this household qualify for" discovery, varying by business type, bank, and loan type | ⚠️ **Fully simulated/mocked** — see Section 5 |
| **Business Life Cycle roadmap** | Seed → Launch → Repayment → Growth stage checklist | 📋 **Roadmap only** — shown as a static UI concept (e.g. home-page 3D flip cards), not a working tracked feature. No persistent lifecycle tracking, no scheduled reminders, in this build. |
| **DigiLocker/API Setu document fetch** | Auto-fetch Aadhaar/Udyam docs | 📋 **Stretch, credential-dependent** — build a mocked consent+checklist UI regardless; wire real Setu sandbox only if credentials are approved in time |

## 5. ⚠️ Critical Scope Decision: "Search for Schemes" is a Simulated Feature

This is a deliberate, explicit product decision — document it prominently so no one on the team or judging panel is confused about what's real vs illustrative:

- The **Search for Schemes** flow (progressive household questionnaire → scheme recommendations) does **not** connect to any live government scheme database.
- Vertex AI Gemini generates **plausible, well-structured, illustrative scheme matches** based on the household inputs and the already-generated Module 1 + Module 2 output, varying output style by business category, bank/lending institution type, and loan type.
- Output must still be **structured and polished** (categorized cards: Business-linked schemes / Bank-specific schemes / Loan-type-specific schemes), not a wall of free text — this is what makes it read as a real feature rather than an obvious placeholder.
- **Mandatory UI disclosure:** every scheme card in this flow must carry a visible label such as *"AI-generated illustrative match — verify with your nearest SCA/bank before applying"*. This is a non-negotiable, not a nice-to-have — it protects real users (this is a Ministry-linked tool for a vulnerable population) and it's also the correct answer if a judge asks "is this data real?"
- To keep the mock consistent across demo runs (not pure hallucination each time), ground the LLM prompt against a small static **mock scheme archetype catalog** (see Data Dictionary doc) rather than fully freeform generation.

## 6. Explicit Out-of-Scope (for this build)

- Real credit-scoring or loan-approval-likelihood ML models — rejected on both technical-risk and fairness grounds (see earlier project analysis).
- Persistent multi-month lifecycle tracking with scheduled push notifications.
- A distinct SCA/Bank Officer dashboard or flow — kept as a role label only, no separate UI (see User Personas doc for rationale).
- Any live integration with actual DigiLocker production APIs (sandbox-only, best-effort).

## 7. Success Criteria for the Hackathon Build

1. Module 2's calculator and EMI table are numerically exact and demonstrably correct for boundary cases (₹1.4L, ₹50L).
2. Module 1's report visibly cites its data sources (live Places API count vs static Census/HCES/DDP figures vs LLM reasoning) — no unlabeled numbers.
3. The FOIR/break-even bridge is visibly working end-to-end in the unified dashboard.
4. Search for Schemes clearly reads as a polished, structured feature while being honestly labeled as illustrative.
5. The app is demoable end-to-end on Cloud Run without requiring local setup.

## 8. Why This Matters (Impact Goals, verbatim from PS)

- Reduce failure rate of newly funded micro-enterprises through data-backed business model choice.
- Eliminate financial confusion by mapping available cash (10%) to borrowing capacity (90%) and exact repayment obligations.
- Empower marginalized youth with enterprise intelligence, grassroots-level.
