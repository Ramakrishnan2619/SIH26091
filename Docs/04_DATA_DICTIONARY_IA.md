# Data Dictionary & Information Architecture

## 1. Three-Layer Data Architecture (overview)

```
Layer 1 — LIVE SUPPLY DATA           Layer 2 — STATIC DEMAND DATA          Layer 3 — REASONING
(Google Places, per-request)          (pre-built local DB, per-request      (Vertex AI Gemini,
                                        lookup, no external call)             grounded synthesis)
```

**Layer 1 (live, per-request):** Geocoding API, Places API (New), Places Aggregate API. Never cached long-term — this is intentionally the "real-time" part of the system.

**Layer 2 (static, already built — do not duplicate here):** LGD hierarchy + Census 2011 (DCHB Village/Town Release, PCA) + HCES 2022-23 + Tamil Nadu DDP, joined and keyed by LGD code, Tamil Nadu only. Full schema, cleaning log, and query interface already exist in the repo at:
- `/Optimized DB for Layer 2/layer2_demand_economics.db` (and `.json`/`.parquet` mirror)
- `/Optimized DB for Layer 2/DATA_DICTIONARY.md` — authoritative field-by-field reference
- `/Optimized DB for Layer 2/CLEANING_LOG.md` — every encoding fix, dropped column, and name-matched (non-code-matched) join, for provenance defense

**Do not re-specify Layer 2's schema in new documents — always point here.** This document instead covers what's *new*: the app's own operational database, Module 2's static reference data, and the Search-for-Schemes mock data layer.

---

## 2. Application Operational Database (Cloud SQL — MySQL 8.0)

This schema does not exist yet and needs to be created. Proposed structure:

### `users`
| Column | Type | Notes |
|---|---|---|
| `user_id` | BIGINT PK | |
| `auth_provider` | ENUM('google','local') | |
| `google_sub` | VARCHAR(255) NULL | Google OAuth subject ID, if applicable |
| `email` | VARCHAR(255) UNIQUE | |
| `name` | VARCHAR(255) | |
| `profile_pic_url` | VARCHAR(512) NULL | |
| `password_hash` | VARCHAR(255) NULL | Only for local signup |
| `preferred_language` | ENUM('en','hi','ta','te') DEFAULT 'en' | |
| `role` | ENUM('beneficiary','sca_officer') DEFAULT 'beneficiary' | Label only — see Personas doc; no permission logic branches on this in MVP |
| `created_at` | TIMESTAMP | |

### `assessments` (one row per Module 1+2 run — the "report")
| Column | Type | Notes |
|---|---|---|
| `assessment_id` | BIGINT PK | |
| `user_id` | BIGINT FK → users | |
| `village_lgd_code` | INT | Join key into Layer 2 |
| `latitude`, `longitude` | DECIMAL | From Geocoding/Geolocation |
| `business_category` | VARCHAR(100) | |
| `margin_capital` | DECIMAL(12,2) | |
| `business_idea_description` | TEXT | |
| `module1_report_json` | JSON | Full 6-point report, each field carrying its own `source`/`confidence` tag (per Layer 2 convention) |
| `module2_result_json` | JSON | Project cost, loan amount, scheme, EMI table, FOIR verdict, break-even units, stress-test result |
| `created_at` | TIMESTAMP | |

### `chat_messages`
| Column | Type | Notes |
|---|---|---|
| `message_id` | BIGINT PK | |
| `assessment_id` | BIGINT FK → assessments | Chat is always contextual to one report |
| `sender` | ENUM('user','assistant') | |
| `content` | TEXT | |
| `is_voice` | BOOLEAN | True for Gemini Live sessions |
| `created_at` | TIMESTAMP | |

### `scheme_search_sessions` (Search for Schemes — mocked feature)
| Column | Type | Notes |
|---|---|---|
| `session_id` | BIGINT PK | |
| `assessment_id` | BIGINT FK → assessments | |
| `household_answers_json` | JSON | Progressive questionnaire answers (age, gender, social category, income band, disability, ex-servicemen, etc. — see draft plan Step 7 field list) |
| `generated_schemes_json` | JSON | LLM output — each entry must carry `is_illustrative: true` and category tag (business-linked / bank-specific / loan-type-specific) |
| `created_at` | TIMESTAMP | |

### `llm_usage_log`
| Column | Type | Notes |
|---|---|---|
| `log_id` | BIGINT PK | |
| `user_id` | BIGINT FK | |
| `model` | VARCHAR(100) | `gemini-2.5-flash` or `gemini-live-2.5-flash-native-audio` |
| `tokens_used` | INT | For the Settings-page usage tracker |
| `created_at` | TIMESTAMP | |

**Privacy note:** `household_answers_json` may contain sensitive fields (income band, disability status, social category). Treat this table with the same care as PII — encrypt at rest if Cloud SQL config allows, and do not log its contents to Cloud Logging.

---

## 3. Module 2 Static Reference Data (config, not user data — can be a JSON config file or a small DB table, no external source)

### `scheme_rules`
| Field | Micro Finance | Term Loan |
|---|---|---|
| `min_project_cost` | 0 | 140,001 |
| `max_project_cost` | 140,000 | 5,000,000 |
| `max_loan_cap` | 125,000 | 4,500,000 |
| `interest_rate_pa` | 6.5% | 8.0% |
| `tenure_months` | 36 | 84 |
| `moratorium_months` | 3 | 6 |
| `repayment_frequency` | Quarterly | Quarterly |

> **Moratorium & Quarterly Amortization Policy (Option B — Serviced Interest):**
> In accordance with NSFDC / SCA concessional credit standards, simple interest is **serviced quarterly during the moratorium** (Quarter 1 for Micro Finance; Quarters 1–2 for Term Loan) with zero principal repayment. Interest is **not capitalized** into the principal balance. Post-moratorium, equal quarterly installments (EQI) amortize the constant principal to exactly ₹0.00 over the remaining repayment quarters (11 quarters for Micro Finance, 26 quarters for Term Loan).

### `eligibility_matrix` (Dynamic Eligibility Matrix feature)
Static lookup table: `{social_category, gender, disability_status, ex_servicemen_status, income_band} → {applicable_corporation_hint, concession_flag}`. Small, hand-authored table — not sourced from an external dataset; label it as such in the Data Dictionary comments.

### `working_capital_ratios`
Static lookup: `business_category → typical_working_capital_pct_of_project_cost`. Reuses `business_build_plan.csv` / `business_risk_patterns.csv` already in the repo as seed content — cite these files as "team-curated domain reference," not as an external government source.

---

## 4. Search-for-Schemes Mock Grounding Data (new — needs to be authored)

To keep the mocked scheme output "polished" and consistent across demo runs rather than pure per-call hallucination, create a small static **mock scheme archetype catalog**, e.g.:

```json
{
  "archetype_id": "MICRO_WOMEN_DAIRY",
  "applies_when": {"business_category": "Dairy", "gender": "Female"},
  "illustrative_scheme_name": "Women Entrepreneur Dairy Support (illustrative)",
  "illustrative_bank_type": "Cooperative Bank / SCA",
  "illustrative_benefit": "Additional interest subsidy narrative for women-led dairy micro-units",
  "disclosure": "AI-generated illustrative match — verify with your nearest SCA/bank before applying"
}
```

Author 8-12 such archetypes spanning the business categories already in `business_build_plan.csv`, crossed with a few household variations (gender, social category, disability). Vertex AI is prompted to select/adapt from these archetypes rather than inventing scheme names from nothing — this is what makes the mock "structured" rather than "hallucinated."

---

## 5. Information Architecture — Screen-to-Data Map

| Screen | Reads from | Writes to |
|---|---|---|
| `/login` | `users` | `users` (on first login) |
| `/assess` | Layer 2 DB (LGD autocomplete) | — |
| Processing overlay | Layer 1 (live) + Layer 2 (static) + `scheme_rules`/`working_capital_ratios` (config) | `assessments` |
| `/report` | `assessments` | `chat_messages` |
| Search for Schemes | `assessments`, mock archetype catalog | `scheme_search_sessions` |
| `/settings` | `users`, `llm_usage_log` | `users` |
