# Tech Stack & Constraints

## 1. Confirmed Decisions (from project owner)

- **AI access path: Vertex AI**, not plain Gemini API/AI Studio key — matches the rest of the GCP-native stack (service-account auth, consistent IAM model, no separate API-key secret to manage).
- **No local dev/test environment** — the app is deployed directly to Cloud Run and tested manually on the live URL. Design accordingly: fast, low-friction redeploys matter more than local dev ergonomics.
- **Testing approach (explicit team decision):** audit the codebase, deploy, and manually test on the live interface — no automated test suite planned. **One exception worth flagging to the team:** Module 2's EMI/amortization math should still get a small standalone script or a couple of assertions run once before demo day (boundary cases: exactly ₹1.4L, exactly ₹50L, moratorium offset) — this isn't a full test suite, just insurance against a live-demo-breaking arithmetic bug, and it doesn't conflict with the "manual testing" decision since it's a one-time correctness check, not a CI process.

## 2. Backend

| Component | Choice |
|---|---|
| Language | Java 21 |
| Framework | Spring Boot 3.x |
| Build tool | Maven |
| Auth | Google OAuth 2.0 (Spring Security) + local signup fallback; JWT session, 1-hour expiry |
| Database | Google Cloud SQL (MySQL 8.0) |
| Deployment | Single Docker container → Google Cloud Run |
| Logging | Cloud Logging |

## 3. Frontend

| Component | Choice |
|---|---|
| Framework | React |
| Styling | Tailwind CSS |
| Animation | Motion for React (Framer Motion) + shadcn/ui components + KokonutUI button effects |
| Charts | Recharts |
| Fonts | Plus Jakarta Sans + Noto Sans (Devanagari/Tamil/Telugu) |
| Maps | Client-side map component (Leaflet/Mapbox — pick one; not yet locked) for the 5-10km competitor-density radius view |

**Deployment assumption (stated explicitly, confirm with team):** "Unified Docker Container deployed on Google Cloud Run" is interpreted as the React production build being bundled as static resources served by the Spring Boot app (`src/main/resources/static`), with the same container serving both the REST API and the frontend. This avoids needing a second hosting target (e.g. Firebase Hosting) and keeps the single-container deployment story the team already committed to. **If this assumption is wrong** (i.e., frontend and backend are meant to deploy separately), the CORS/auth-cookie configuration in Section 5 changes — confirm before backend auth wiring is finalized.

## 4. AI / LLM

| Use case | Model | Access |
|---|---|---|
| Feasibility report synthesis (Module 1), chat follow-up, Search-for-Schemes mock generation | `gemini-2.5-flash` | Vertex AI (Generative AI on Vertex), service-account auth |
| Live voice assistant | `gemini-live-2.5-flash-native-audio` | Vertex AI, WebSocket session |

Rate limits: apply application-level throttling per user (referenced in draft plan as "Applied Rate limits") — implement as a simple per-user request counter feeding the Settings-page usage tracker (`llm_usage_log` table), not just relying on Vertex AI's own project-level quota.

## 5. GCP Resources & IAM — Enable Checklist

Since `sih26-508313` is a fresh project, enable these APIs and grant these roles before development starts:

**APIs to enable:**
- [ ] Vertex AI API (`aiplatform.googleapis.com`)
- [ ] Places API (New) (`places.googleapis.com`)
- [ ] Places Aggregate API — **verify current access tier/allowlist status before relying on it**; if it requires a separate enablement request, do this first, it's a bigger lead time than other APIs
- [ ] Geocoding API (`geocoding-backend.googleapis.com`)
- [ ] Cloud SQL Admin API
- [ ] Cloud Run Admin API
- [ ] Cloud Build API (for CI/CD image builds)
- [ ] Artifact Registry API (Docker image storage)
- [ ] Cloud Logging API
- [ ] IAM Service Account Credentials API
- [ ] OAuth consent screen configured under APIs & Services → Credentials (separate from the above, needed for Google Sign-In)

**IAM roles (minimum viable, per service account used by the Cloud Run service):**
- `roles/aiplatform.user` (Vertex AI calls)
- `roles/cloudsql.client` (Cloud SQL connection from Cloud Run)
- `roles/logging.logWriter`
- `roles/run.invoker` (if any service-to-service calls are added later)

**Secrets/config to provision:**
- Places API + Geocoding API key(s) — restrict by API and, if possible, by IP/referrer
- Cloud SQL connection string / Cloud SQL Auth Proxy config
- OAuth client ID/secret for Google Sign-In
- JWT signing secret

## 6. Known Constraints & Risks (carry these into sprint planning)

| Constraint | Why it matters | Mitigation |
|---|---|---|
| **Places Aggregate API rural coverage** | Small villages are often sparsely indexed on Google Maps — a near-zero competitor count can mean "no data," not "no competitors" | Layer 2's population-ratio fallback model + explicit `confidence` tagging (already designed) |
| **2G/3G rural network target** | Frontend must stay light — no heavy PNG hero banners, SVG-only graphics, `font-display: swap` | Already specified in `frontend_spec_master.md`; keep enforcing during build, don't let Motion/shadcn animation libraries bloat bundle size |
| **No automated tests** | Live-demo risk if Module 2 math has an edge-case bug | One-time boundary-case verification script for EMI/amortization logic, run before demo day (see Section 1) |
| **Single Cloud Run container** | Frontend and backend changes both require a full redeploy | Keep build/deploy fast (multi-stage Dockerfile, cache Maven/npm layers) so iteration during the hackathon isn't blocked by slow redeploys |
| **Vertex AI Gemini Live latency/cost** | Native audio sessions are heavier than text chat | Keep voice as an optional toggle, not the default interaction mode, exactly as currently scoped |
| **Search-for-Schemes is mocked** | Must never be presented as real scheme data | Enforce the `is_illustrative` flag and UI disclosure at the API response level, not just as a frontend afterthought — bake it into the `scheme_search_sessions` schema itself (see Data Dictionary doc) so it can't accidentally be dropped |
