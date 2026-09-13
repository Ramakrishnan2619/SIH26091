# User Journey Maps

Primary persona: Meena (see 02_USER_PERSONAS.md). Single end-to-end journey, formalized from the team's draft plan, with backend/GCP touchpoints made explicit so Antigravity can trace each screen to the system component it depends on.

---

## Journey A — Core Flow (Login → Report → Chat → Scheme Search)

| Stage | User Action | Screen | What Meena Sees/Feels | Backend / GCP Touchpoint |
|---|---|---|---|---|
| 1. Auth | Signs in via Google OAuth 2.0 or normal signup | `/login` | Wants this to be fast — one tap, no long form | Google OAuth 2.0 (Spring Security), JWT issued (1hr session), profile pic/name/email stored |
| 2. Orientation | Lands on home page, reads brief description, sees "Try Out" CTA | `/` | Needs to quickly trust this is a real government-linked tool, not a scam app | Static content; no backend calls |
| 3. Intake | Fills form: Name, Available Margin Capital, Business Category, Business Idea Description | `/assess` | Should feel like 4 short fields, not a loan application | Client-side validation only at this point |
| 4. Location | Taps "Share Location" — map slides in, drops pin, draws 10km circle | `/assess` (map overlay) | Reassurance that the app knows exactly where she is | Browser Geolocation API → reverse-geocode via **Geocoding API** for display; raw lat/lng passed forward |
| 5. Submit | Taps Submit (enabled only once all required fields + location are set) | `/assess` | Anticipation — this is the "moment of truth" tap | Triggers backend orchestration (Spring Boot) |
| 6. Processing | Sees rotating-ring loader with **step-by-step live status text** ("Querying Places for competitor density…", "Calculating EMI…", "Synthesizing report…") | Loading overlay | Reduces anxiety about a "black box" — she can see it's doing real work | **Places Aggregate API** (competitor count) → **Places API (New)** (POI/distribution channels) → Layer 2 static DB lookup (Census/HCES/DDP via LGD code) → Module 2 deterministic calculator (parallel, instant) → **Vertex AI Gemini 2.5 Flash** (grounded synthesis of the 6-point report) |
| 7. Unified Dashboard | Sees tabbed report: Feasibility / Financial+EMI / Risk+Saturation / Scheme Eligibility | `/report` | This is the payoff moment — needs to feel authoritative and clear, not like a chatbot wall of text | Results persisted to **Cloud SQL**; competitor pins rendered on map; FOIR/break-even bridge numbers displayed with 🟢🟡🔴 |
| 8. Follow-up Chat | Opens bottom chat drawer, asks a follow-up question about her report | `/report` (chat drawer) | Wants a specific, contextual answer — not a generic chatbot restart | Chat context = the already-generated report + Layer 2 data; **Vertex AI Gemini 2.5 Flash**; transcript saved to Cloud SQL |
| 8b. (Optional) Live Voice | Toggles to live voice session instead of typing | `/chat` | Prefers speaking Tamil over typing English | WebSocket to **Vertex AI Gemini Live 2.5 Flash Native Audio**; audio transcript saved to Cloud SQL |
| 9. Search for Schemes | Taps "Search for Schemes" button at top of report | Progressive questionnaire modal | One question at a time (e.g. "Who will run this business? Me / Spouse / Joint / Not decided") — must not feel like a 30-field government form | Answers collected progressively; full context (M1+M2 output + household answers) sent to **Vertex AI Gemini** with the mock-scheme-archetype grounding (see Data Dictionary doc) |
| 10. Scheme Results | Sees structured, categorized scheme cards (by business/bank/loan type), each labeled "AI-generated illustrative match" | `/report` (schemes tab) | Should feel like a genuine next step, while honestly knowing it's a starting point, not a final answer | Vertex AI output only — **no live scheme DB call** |
| 11. Settings | Edits profile, views Gemini token usage, logs out | `/settings` | Occasional visit, low emotional stakes | Cloud SQL (profile), token-usage counter (app-side tracking of Vertex AI calls) |

---

## Journey B — Edge Cases (must be designed, not just happy-path)

| Scenario | Trigger | Required Behavior |
|---|---|---|
| **Sparse Places data** | Village has near-zero Places API results (real rural coverage gap) | Do **not** report "zero competitors" as a positive signal — fall back to the population-ratio modeled estimate from Layer 2, and flag confidence as "modeled estimate" in the report, not "live count" |
| **Project Cost > ₹50L** | User's margin capital implies a project cost beyond Term Loan Scheme scope | Module 2 shows a clear message: *"Exceeds Term Loan Scheme eligibility (max ₹50L project cost). Consult your SCA for standard enterprise financing."* — not a silent cap or error |
| **Boundary project cost** (exactly ₹1.4L) | Edge of Micro Finance / Term Loan split | Deterministic, tested rule: `≤ ₹1.4L → Micro Finance` (documented explicitly so it's not ambiguous in code) |
| **Returning user** | Logs in again after a previous session | Settings → History shows past sessions; can reopen a saved report and resume chat rather than re-running Module 1/2 from scratch |
| **No location permission granted** | User declines location share | Fall back to manual Village/Block/District dropdown (LGD-code-backed autocomplete) — location sharing is a convenience, not a hard requirement |
| **Slow/dropped connection mid-processing** | 2G/3G network drops during Step 6 | Step-by-step status text should be resumable/re-triggerable, not force a full form re-fill; consider caching intake-form values client-side until submit succeeds |

---

## Journey Design Principle (carry into every screen)

At every stage, Meena should be able to answer "why does the app think this?" — the step-by-step loading text and the source-tagging on report numbers exist specifically so this journey never feels like an opaque black box, which is both a UX requirement and a hackathon-judging requirement (see Product Vision, Section 7).
