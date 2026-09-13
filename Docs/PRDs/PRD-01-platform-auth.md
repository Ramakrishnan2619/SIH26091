# PRD-01: Platform & Authentication

---

## 1. Module Overview & Goal
The Platform & Authentication module establishes the core security boundary, user session lifecycle, identity management, and platform governance infrastructure for the VyapaarSathi application. It provides seamless single-sign-on (Google OAuth 2.0) with local credential fallbacks, manages stateless 1-hour JWT sessions, enables past assessment history retrieval, and tracks application-level Vertex AI token usage quotas against the Cloud SQL database.  
**Traceability:** Sourced from `Docs/01_PRODUCT_VISION.md` (Section 2, 7), `Docs/03_USER_JOURNEY_MAPS.md` (Stage 1, 11; Journey B Scenario 33), `Docs/04_DATA_DICTIONARY_IA.md` (Section 2: `users`, `llm_usage_log`, `assessments`), `Docs/05_TECH_STACK_CONSTRAINTS.md` (Section 2, 4), and `Docs/Rough Plan/frontend_spec_master.md` (Page 1, 6).

---

## 2. In Scope / Out of Scope

### In Scope
- **Google OAuth 2.0 Integration:** Authentication via Google identity provider returning `sub`, `email`, `name`, and `picture`.
- **Local Authentication Fallback:** Email/password registration and login with secure password hashing (BCrypt).
- **Session Management:** Stateless JSON Web Token (JWT) issuance with a strict 1-hour expiration lifespan (`session_life: 1hr`).
- **User Profile Management:** Viewing and editing user display name, preferred UI/advisory language (`en`, `hi`, `ta`, `te`), and role indicator.
- **Role Label Representation:** Display of `role` (`beneficiary` or `sca_officer`) as an informational profile label.
- **Assessment History Retrieval:** Listing previously executed feasibility and financial assessments from `assessments` associated with the authenticated `user_id`.
- **LLM Usage & Rate Tracking:** Logging Vertex AI model consumption (`gemini-2.5-flash`, `gemini-live-2.5-flash-native-audio`) in `llm_usage_log` and displaying cumulative daily usage / rate limit counters in `/settings`.
- **Global Theme & Accessibility Tokens:** Baseline UI state for UX4G Aqua Blue tokens, language selection, and `Ctrl+F2` accessibility trigger.

### Out of Scope
- **Role-Based Access Control (RBAC) Permissive Logic:** Differentiated permission gates, admin controls, or distinct operational workflows for `sca_officer` vs `beneficiary` (explicitly decided in `01_PRODUCT_VISION.md` Section 6 and `02_USER_PERSONAS.md` Section 1; `sca_officer` is a display label only).
- **Multi-Factor Authentication (MFA / SMS OTP):** No SMS gateway integration or phone OTP infrastructure in this release.
- **Social Auth Providers other than Google:** No Facebook, Apple, or DigiLocker OAuth in this release.
- **Password Reset / Mail Delivery Service:** No external SMTP mailer integration for forgot-password links; password updates occur in active authenticated sessions.

---

## 3. User Stories
- **US-1.1 (Fast Onboarding):** As Meena, I want to sign in with a single tap using my existing Google account on my Android phone so that I do not have to fill out a lengthy registration form before testing my business idea (`Docs/02_USER_PERSONAS.md`, `Docs/03_USER_JOURNEY_MAPS.md` Stage 1).
- **US-1.2 (Regional Language Persistence):** As Meena, I want to set Tamil (`ta`) as my preferred language in my profile settings so that the app defaults to my native tongue across sessions without re-asking (`Docs/02_USER_PERSONAS.md`, `Docs/Rough Plan/frontend_spec_master.md` Page 6).
- **US-1.3 (Past Session Retrieval):** As Meena, I want to view my past saved business assessments in a History list so that I can resume reviewing an earlier advisory report without re-running the intake form from scratch (`Docs/03_USER_JOURNEY_MAPS.md` Journey B Scenario 33).
- **US-1.4 (Usage Transparency):** As Meena (or an evaluator testing the app), I want to see how many AI advisory queries I have consumed today in the Settings page so that I understand my remaining daily quota (`Docs/03_USER_JOURNEY_MAPS.md` Stage 11, `Docs/05_TECH_STACK_CONSTRAINTS.md` Section 4).

---

## 4. Functional Requirements

### Authentication & Authorization
- **FR-1.1:** The system shall support Google OAuth 2.0 authentication using Spring Security Client. On successful OAuth callback, the backend shall extract `google_sub`, `email`, `name`, and `profile_pic_url`.
- **FR-1.2:** The system shall verify if a record with the returned `email` exists in the `users` table:
  - If not present, create a new `users` row with `auth_provider = 'google'`, `role = 'beneficiary'`, and default `preferred_language = 'en'`.
  - If present, update `google_sub`, `name`, and `profile_pic_url` if changed.
- **FR-1.3:** The system shall support local authentication via `/api/auth/register` and `/api/auth/login`. Passwords shall be salted and hashed using BCrypt (strength factor $\ge 10$) before storage in `password_hash`.
- **FR-1.4:** Upon successful authentication (Google or local), the backend shall issue a cryptographically signed JWT containing `user_id`, `email`, and `role`, configured with an exact 60-minute (1-hour) expiration timestamp.
- **FR-1.5:** All protected API routes (`/api/assess/**`, `/api/reports/**`, `/api/chat/**`, `/api/schemes/**`, `/api/user/**`) shall validate the JWT from the `Authorization: Bearer <token>` header or authenticated session cookie. Expired or forged tokens shall return `HTTP 401 Unauthorized`.

### User Profile & Settings
- **FR-1.6:** The system shall provide an endpoint `GET /api/user/profile` returning user metadata (`user_id`, `email`, `name`, `profile_pic_url`, `preferred_language`, `role`, `created_at`).
- **FR-1.7:** The system shall provide an endpoint `PUT /api/user/profile` allowing the user to update `name`, `preferred_language` (enum: `'en'`, `'hi'`, `'ta'`, `'te'`), and `role` (enum: `'beneficiary'`, `'sca_officer'`).
- **FR-1.8:** The system shall expose `POST /api/auth/logout` which invalidates client-side tokens and clears session cookies.

### Assessment History
- **FR-1.9:** The system shall provide `GET /api/user/history` returning an array of past assessment summaries ordered descending by `created_at`:
  ```json
  [
    {
      "assessment_id": 1024,
      "village_lgd_code": 639842,
      "business_category": "Dairy",
      "margin_capital": 100000.00,
      "project_cost": 1000000.00,
      "scheme_selected": "Term Loan Scheme",
      "affordability_verdict": "SAFE",
      "created_at": "2026-09-12T10:15:30Z"
    }
  ]
  ```
- **FR-1.10:** Tapping any past assessment shall route the user to `/report?id={assessment_id}` with pre-populated report data from the persisted row.

### LLM Quota & Usage Tracker
- **FR-1.11:** Whenever an internal service executes a call to Vertex AI (`gemini-2.5-flash` or `gemini-live-2.5-flash-native-audio`), the backend shall write a record to `llm_usage_log` with `user_id`, `model`, `tokens_used`, and current timestamp.
- **FR-1.12:** The system shall enforce an application-level rate limit of **100 AI queries per user per 24-hour rolling window**.
- **FR-1.13:** The endpoint `GET /api/user/usage` shall calculate and return:
  - `total_queries_today` (count of rows in `llm_usage_log` for the user in the past 24 hours),
  - `daily_limit` (`100`),
  - `total_tokens_consumed` (sum of `tokens_used` across all user records),
  - `remaining_queries` (`max(0, 100 - total_queries_today)`).
- **FR-1.14:** When `total_queries_today >= 100`, any subsequent Vertex AI dispatch shall be blocked with `HTTP 429 Too Many Requests` and a user-friendly message: *"Daily advisory limit reached (100 queries). Please try again tomorrow."*

---

## 5. Data Requirements

### Tables Read/Written (`Docs/04_DATA_DICTIONARY_IA.md` Section 2)
1. **`users` Table:**
   - *Columns Read:* `user_id`, `auth_provider`, `google_sub`, `email`, `name`, `profile_pic_url`, `password_hash`, `preferred_language`, `role`, `created_at`.
   - *Columns Written:* New row insertion on registration/OAuth callback; updates to `name`, `preferred_language`, `role` on profile update.
2. **`assessments` Table:**
   - *Columns Read:* `assessment_id`, `user_id`, `village_lgd_code`, `business_category`, `margin_capital`, `module2_result_json -> $.project_cost`, `module2_result_json -> $.scheme_name`, `module2_result_json -> $.foir_verdict`, `created_at`.
   - *Filter:* `WHERE user_id = :current_user_id ORDER BY created_at DESC`.
3. **`llm_usage_log` Table:**
   - *Columns Written:* `log_id` (PK, auto-increment), `user_id` (FK), `model` (VARCHAR 100), `tokens_used` (INT), `created_at` (TIMESTAMP).
   - *Columns Read:* Aggregations `COUNT(*)` and `SUM(tokens_used)` where `user_id = :current_user_id AND created_at >= NOW() - INTERVAL 1 DAY`.

---

## 6. API / Integration Requirements
- **Google OAuth 2.0 (`accounts.google.com`):** Configured via Spring Security OAuth2 Client (`spring.security.oauth2.client.registration.google`). Requires `clientId`, `clientSecret`, and redirect URI `/login/oauth2/code/google`. Scopes requested: `openid`, `profile`, `email`.
- **GCP IAM & Cloud SQL Connection:** Service Account must hold role `roles/cloudsql.client`. Connection handled via Google Cloud SQL MySQL Connector or Unix domain socket on Cloud Run.
- **Cloud Logging:** Service Account must hold role `roles/logging.logWriter`. Security audits (failed logins, rate limit breaches) emitted as structured JSON logs.
- **Fallback Behavior:**
  - If Google OAuth endpoints are unreachable or user cancels the Google prompt, the UI remains on `/login` and renders an alert banner: *"Google Sign-In was cancelled or unavailable. You can register with email and password."*
  - If Cloud SQL fails during session validation, the server returns `HTTP 503 Service Unavailable` with retry-after header.

---

## 7. Edge Cases & Error States
- **EC-1.1 (Expired JWT Token):** If a user leaves the app idle for $> 60$ minutes and attempts an authenticated request, the backend returns `401 Unauthorized`. Frontend intercepts this response, clears local storage tokens, displays a toast *"Session expired. Please sign in again"*, and redirects to `/login`.
- **EC-1.2 (Duplicate Local Registration):** If a user attempts to register locally using an email that already exists (either via Google OAuth or local signup), the backend returns `HTTP 409 Conflict` with message: *"An account with this email already exists."*
- **EC-1.3 (Exceeded Daily Query Quota):** When a user reaches 100 queries in a day, the intake submit button and chat input display an inline warning and disable dispatch.
- **EC-1.4 (Network Drop During Login):** If the network drops while awaiting OAuth redirect, frontend catches fetch error and retains form inputs with a "Retry Connection" button.

---

## 8. Acceptance Criteria
- [ ] Developer can log in using a standard Google account via Google OAuth 2.0 on a live Cloud Run URL.
- [ ] Developer can register a local account with email and password, log out, and log back in successfully.
- [ ] JWT issued upon login contains an expiration claim exactly 3600 seconds (1 hour) from generation time.
- [ ] Requests to protected endpoints without a token or with an expired token return `HTTP 401 Unauthorized`.
- [ ] Changing `preferred_language` in `/settings` updates the `users.preferred_language` database column and persists across page reloads.
- [ ] Selecting `Role: SCA Officer` in `/settings` updates `users.role` to `'sca_officer'` as a profile label without breaking navigation or unlocking unbuilt views.
- [ ] Navigating to `/settings` displays the user's past assessments loaded from `assessments` table for the current `user_id`.
- [ ] Each Vertex AI call made during testing increments the record count in `llm_usage_log` and correctly updates the `queries used today` counter in `/settings`.
- [ ] Simulating 100 records in `llm_usage_log` for the test user triggers `HTTP 429` on subsequent Vertex AI dispatch attempts.

---

## 9. Dependencies on Other Modules
- **Downstream Dependents:** All other modules (PRD-02, PRD-03, PRD-04, PRD-05, PRD-06) depend on PRD-01 for authenticated `user_id` context and JWT session validation.
- **Database Dependency:** Requires `users`, `assessments`, and `llm_usage_log` tables provisioned in Cloud SQL MySQL 8.0 per `Docs/04_DATA_DICTIONARY_IA.md`.

---

## 10. Open Questions / Assumptions
- **Assumption (Single-Container Deployment):** In line with `Docs/05_TECH_STACK_CONSTRAINTS.md` Section 3, the React frontend build is assumed to be served as static assets from Spring Boot's `src/main/resources/static`, sharing domain and port. If frontend and backend are split into separate domains in production, CORS headers (`Access-Control-Allow-Credentials: true`) and cross-site `SameSite=None` cookie handling will need to be configured.
- **Assumption (Rate Limit Reset Window):** A rolling 24-hour window is assumed for the 100-query quota rather than a calendar midnight reset, simplifying SQL query execution to `created_at >= NOW() - INTERVAL 1 DAY`.
