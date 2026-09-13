# VyapaarSathi (SIH 26091) — Master API Contract

**Version:** 1.1.0 (Post-Review Revision: Unified Canonical Schemas & Verified Amortization)  
**Status:** REVISED PROPOSAL (Awaiting User Sign-Off — Step 3 Checkpoint)  
**Base URL (Cloud Run / Local):** `http://localhost:8080` (Local) / `https://<service-name>.a.run.app` (Production)  
**Security Scheme:**  
- Stateless JWT in `Authorization: Bearer <token>` header (or `vyapaarsathi_token` HTTP-only cookie).
- Token lifetime: Exactly 1 hour (3600 seconds) from issuance (`Docs/PRDs/PRD-01-platform-auth.md`).
- Unauthenticated requests to protected endpoints return `HTTP 401 Unauthorized`.
- Daily rate limit: 100 Vertex AI queries per user per rolling 24-hour window (`HTTP 429 Too Many Requests`).

---

## 🏛️ Shared Canonical JSON Schemas

To prevent schema drift across endpoints, the following canonical schemas are defined once and referenced across all modules.

### Schema A: Canonical Financial Structuring & Affordability (`module2_result_json`)

Used in:
- `GET /api/user/history` (Section 1.7 - summary fields)
- `POST /api/finance/calculate` (Section 3.1 - full payload)
- `POST /api/assess/complete` (Section 4.1 - full payload + dashboard KPIs)
- `GET /api/reports/{id}` (Section 4.2 - persisted assessment)

```typescript
interface CanonicalModule2Result {
  margin_capital: number;                   // Decimal (e.g. 100000.00)
  project_cost: number;                     // Decimal (margin_capital / 0.10)
  loan_amount: number;                      // Decimal (min(0.90 * project_cost, scheme_cap))
  scheme_name: string;                      // "Micro Finance Scheme" | "Term Loan Scheme"
  scheme_type: "MICRO_FINANCE" | "TERM_LOAN"; // Machine enum code
  interest_rate_pa: number;                 // Fixed annual rate: 6.5 or 8.0
  tenure_months: number;                    // 36 or 84
  moratorium_months: number;                // 3 or 6
  total_quarters: number;                   // 12 or 28
  moratorium_quarters: number;              // 1 or 2
  repayment_quarters: number;               // 11 or 26 (total_quarters - moratorium_quarters)
  quarterly_installment: number;            // Post-moratorium EQI (e.g. 44729.31)
  monthly_equivalent_installment: number;   // quarterly_installment / 3 (e.g. 14909.77)
  working_capital_allocation_pct: number;   // e.g. 25.0
  working_capital_amount: number;           // e.g. 250000.00
  capex_amount: number;                     // e.g. 750000.00

  // Canonical Affordability & FOIR Fields
  foir_percentage: number;                  // (monthly_equivalent_installment / net_profit) * 100
  foir_verdict_code: "SAFE" | "TIGHT" | "HIGH_FINANCIAL_BURDEN"; // Strict enum code
  foir_verdict_label: string;               // "Safe Affordability" | "Moderate Caution" | "High Financial Burden"
  foir_badge_color: "GREEN" | "YELLOW" | "RED"; // UI semantic token
  break_even_units_per_month: number;       // Required unit volume to service debt + fixed costs

  // Corporation Routing & Demographics
  applicable_corporation: string;          // e.g. "National Scheduled Castes Finance and Development Corporation (NSFDC)"
  special_flags: string[];                 // e.g. ["Eligible for Mahila Samriddhi Yojana (interest rebate)"]

  // Stress-Test Scenario (Simulated 30% revenue drop)
  stress_test: {
    stressed_monthly_revenue: number;      // 0.70 * normal net profit
    stressed_foir_percentage: number;
    resilience_rating: "Resilient" | "Vulnerable";
    resilience_recommendation: string;
  };

  // Amortization Schedule (Full array of QuarterRecord)
  amortization_schedule: QuarterRecord[];
}

interface QuarterRecord {
  quarter_number: number;                  // 1 to 12 (Micro) or 1 to 28 (Term)
  opening_balance: number;                 // Principal outstanding at start of quarter
  principal_paid: number;                  // 0.00 during moratorium; calculated post-moratorium
  interest_paid: number;                   // opening_balance * (interest_rate_pa / 4 / 100)
  total_installment: number;               // principal_paid + interest_paid
  closing_balance: number;                 // opening_balance - principal_paid (0.00 at final quarter)
  is_moratorium: boolean;                  // true during moratorium quarters
}
```

---

## 📌 Moratorium Interest Policy (OPTION B — Serviced Interest)

In strict accordance with Ministry of Social Justice and Empowerment (MoSJE), NSFDC, and State Channelizing Agency (SCA) concessional credit practice:
1. **Zero Principal Drawdown during Moratorium:** During moratorium quarters (Quarter 1 for Micro Finance; Quarters 1–2 for Term Loan), principal repayment is deferred (`principal_paid = 0.00`).
2. **Quarterly Simple Interest Servicing:** The beneficiary pays quarterly simple accrued interest ($Interest = P \times r$).
3. **No Capitalization:** Interest is **serviced directly**, NOT capitalized into principal balance. The principal remains constant at the original sanctioned amount ($P$).
4. **Post-Moratorium Annuity Amortization:** Starting in Quarter $M+1$, equal quarterly installments (EQI) commence using the standard reducing-balance formula:
   $$\text{EQI} = P \times \frac{r \times (1 + r)^n}{(1 + r)^n - 1}$$
   where $P = \text{Loan Amount}$, $r = \frac{\text{interest\_rate\_pa}}{4 \times 100}$, and $n = \text{total\_quarters} - \text{moratorium\_quarters}$.
5. **Exact Terminal Convergence:** The final quarter's installment is adjusted by fractional paise rounding so that `closing_balance` reaches **exactly ₹0.00**.

---

## 📑 Endpoint Summary & PRD Traceability

| Method | Endpoint Path | Module | PRD Requirements Satisfied |
|---|---|---|---|
| `GET` | `/login/oauth2/code/google` | Platform & Auth | FR-1.1, FR-1.2, FR-1.4 |
| `POST` | `/api/auth/register` | Platform & Auth | FR-1.3, FR-1.4 |
| `POST` | `/api/auth/login` | Platform & Auth | FR-1.3, FR-1.4 |
| `POST` | `/api/auth/logout` | Platform & Auth | FR-1.8 |
| `GET` | `/api/user/profile` | Platform & Auth | FR-1.6 |
| `PUT` | `/api/user/profile` | Platform & Auth | FR-1.7 |
| `GET` | `/api/user/history` | Platform & Auth | FR-1.9, FR-1.10 (Uses Canonical Schema A) |
| `GET` | `/api/user/usage` | Platform & Auth | FR-1.11, FR-1.12, FR-1.13, FR-1.14 |
| `GET` | `/api/assess/location/autocomplete` | Module 1 — Feasibility | FR-2.4 |
| `POST` | `/api/assess/location/reverse-geocode` | Module 1 — Feasibility | FR-2.2, FR-2.3 |
| `POST` | `/api/assess/feasibility` | Module 1 — Feasibility | FR-2.1, FR-2.6–FR-2.13, FR-2.15 |
| `POST` | `/api/finance/calculate` | Module 2 — Calculator | FR-3.1–FR-3.17 (Uses Canonical Schema A) |
| `POST` | `/api/finance/amortization-table` | Module 2 — Calculator | FR-3.8 (Full Schedule to ₹0.00) |
| `POST` | `/api/assess/complete` | Unified Pipeline | FR-2.15, FR-3.1–FR-3.17, FR-4.1 (Uses Canonical Schema A) |
| `GET` | `/api/reports/{assessment_id}` | Unified Dashboard | FR-4.1, FR-4.3 (Uses Canonical Schema A) |
| `GET` | `/api/reports/latest` | Unified Dashboard | FR-4.3 (Uses Canonical Schema A) |
| `GET` | `/api/chat/history/{assessment_id}` | AI Chat & Live Voice | FR-5.4 |
| `POST` | `/api/chat/message` | AI Chat & Live Voice | FR-5.5, FR-5.6, FR-5.7, FR-5.8, FR-5.15 |
| `WS` | `/ws/live-voice` | AI Chat & Live Voice | FR-5.9, FR-5.10, FR-5.11, FR-5.12, FR-5.13 |
| `GET` | `/api/schemes/archetypes` | Search for Schemes | FR-6.4 |
| `POST` | `/api/schemes/search` | Search for Schemes | FR-6.5, FR-6.6 |
| `GET` | `/api/schemes/session/{session_id}` | Search for Schemes | FR-6.6 |

---

## 🔒 Standard Error Responses

```json
{
  "timestamp": "2026-09-13T10:15:30Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Available margin capital must be greater than ₹1,000",
  "path": "/api/finance/calculate",
  "details": null
}
```

- `400 Bad Request`: Input validation failure.
- `401 Unauthorized`: Missing or expired JWT token.
- `403 Forbidden`: Authenticated user attempting cross-tenant access.
- `404 Not Found`: Resource ID not found.
- `409 Conflict`: Duplicate email registration.
- `429 Too Many Requests`: Exceeded 100 AI queries in rolling 24 hours.
- `500 Internal Server Error`: Unhandled server exception.

---

## 1. Platform & Authentication Endpoints (PRD-01)

### 1.1 Google OAuth 2.0 Callback
- **Path:** `GET /login/oauth2/code/google`
- **Handled by:** Spring Security OAuth 2.0 Client.
- **Description:** Exchanges code for user info (`sub`, `email`, `name`, `picture`), upserts `users` record, generates signed 1-hour JWT.
- **Response (302 Redirect):** Redirects to frontend with JWT token.

### 1.2 Local Registration
- **Path:** `POST /api/auth/register`
- **Auth Required:** No
- **Request Body:**
```json
{
  "email": "meena.devi@example.com",
  "password": "Password123!",
  "name": "Meena Devi",
  "role": "beneficiary",
  "preferred_language": "ta"
}
```
- **Response (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "token_type": "Bearer",
  "expires_in_seconds": 3600,
  "user": {
    "user_id": 1,
    "email": "meena.devi@example.com",
    "name": "Meena Devi",
    "role": "beneficiary",
    "preferred_language": "ta",
    "profile_pic_url": null,
    "created_at": "2026-09-13T09:30:00Z"
  }
}
```

### 1.3 Local Login
- **Path:** `POST /api/auth/login`
- **Auth Required:** No
- **Request Body:**
```json
{
  "email": "meena.devi@example.com",
  "password": "Password123!"
}
```
- **Response (200 OK):** Identical to 1.2.

### 1.4 Logout
- **Path:** `POST /api/auth/logout`
- **Auth Required:** Optional
- **Response (200 OK):** `{"message": "Successfully logged out"}`

### 1.5 Get User Profile
- **Path:** `GET /api/user/profile`
- **Auth Required:** Yes
- **Response (200 OK):** User object with `preferred_language`, `role`, etc.

### 1.6 Update User Profile
- **Path:** `PUT /api/user/profile`
- **Auth Required:** Yes
- **Request Body:**
```json
{
  "name": "Meena Devi",
  "preferred_language": "ta",
  "role": "sca_officer"
}
```
- **Response (200 OK):** Updated user profile.

### 1.7 User Assessment History (Aligned to Canonical Schema A)
- **Path:** `GET /api/user/history`
- **Auth Required:** Yes
- **Response (200 OK):**
```json
[
  {
    "assessment_id": 1024,
    "village_lgd_code": 639842,
    "village_name": "Melavalavu",
    "district_name": "Madurai",
    "business_category": "Dairy",
    "margin_capital": 100000.00,
    "project_cost": 1000000.00,
    "loan_amount": 900000.00,
    "scheme_name": "Term Loan Scheme",
    "scheme_type": "TERM_LOAN",
    "foir_percentage": 52.31,
    "foir_verdict_code": "HIGH_FINANCIAL_BURDEN",
    "foir_verdict_label": "High Financial Burden",
    "foir_badge_color": "RED",
    "created_at": "2026-09-12T10:15:30Z"
  }
]
```

### 1.8 User Quota & Usage Tracker
- **Path:** `GET /api/user/usage`
- **Auth Required:** Yes
- **Response (200 OK):**
```json
{
  "total_queries_today": 12,
  "daily_limit": 100,
  "remaining_queries": 88,
  "total_tokens_consumed": 24500,
  "reset_window": "Rolling 24-Hour Window"
}
```

---

## 2. Module 1: Hyper-Local Feasibility Report Endpoints (PRD-02)

### 2.1 Village LGD Autocomplete Search
- **Path:** `GET /api/assess/location/autocomplete?q=mela&limit=10`
- **Auth Required:** No
- **Response (200 OK):** List of matching Tamil Nadu villages from SQLite Layer 2 DB.

### 2.2 Reverse Geocode Coordinates
- **Path:** `POST /api/assess/location/reverse-geocode`
- **Request Body:** `{"latitude": 10.0245, "longitude": 78.3412}`
- **Response (200 OK):** Geocoded address + resolved nearest `village_lgd_code`.

### 2.3 Synthesize Hyper-Local Feasibility Report
- **Path:** `POST /api/assess/feasibility`
- **Auth Required:** Yes
- **Request Body:**
```json
{
  "owner_name": "Meena Devi",
  "age": 34,
  "margin_capital": 100000.00,
  "business_category": "Dairy",
  "business_idea_description": "Small dairy farm with 5 cross-breed cows selling milk to local tea shops and Aavin cooperative society.",
  "village_lgd_code": 639842,
  "latitude": 10.0245,
  "longitude": 78.3412,
  "radius_km": 10
}
```
- **Response (200 OK):**
```json
{
  "assessment_id": 1025,
  "village_context": {
    "village_lgd_code": 639842,
    "village_name": "Melavalavu",
    "district_name": "Madurai",
    "population": 5420,
    "households": 1340,
    "literacy_rate": 74.2,
    "district_income_band": "Upper-Middle",
    "district_ndp_per_capita": 284500.00,
    "state_avg_household_spend": 5701.00,
    "confidence": "village-level"
  },
  "supply_metrics": {
    "competitor_density_count": 4,
    "data_source": "Google Places Aggregate API (areainsights.googleapis.com)",
    "nearby_places": [
      {
        "name": "Sri Krishna Milk Centre",
        "address": "Main Road, Melavalavu",
        "latitude": 10.0251,
        "longitude": 78.3420,
        "types": ["dairy_store", "food_store"]
      }
    ]
  },
  "module1_report": {
    "market_reach": {
      "consumer_base_population": 28500,
      "consumer_base_households": 7100,
      "primary_distribution_channels": [
        "Local tea stalls and bakeries (B2B daily delivery)",
        "Aavin primary milk collection center (Assured government MSP)",
        "Weekly haat market counter sales"
      ],
      "data_attribution": "[Source: Census 2011 PCA + Layer 2 DB]"
    },
    "opportunity_analysis": {
      "underserved_niches": [
        "A2 desi cow milk packaging for township consumers",
        "Value-added fresh curd, paneer, and butter supply during festive seasons"
      ],
      "opportunity_score": "High",
      "data_attribution": "[Source: NSSO HCES 2023-24 Rural Consumption Data]"
    },
    "swot_analysis": {
      "strengths": [
        "Consistent daily cash flow from perishable commodity sales",
        "Existing Aavin cooperative network ensures zero inventory spoilage"
      ],
      "weaknesses": [
        "Green fodder availability fluctuates during summer months",
        "Initial livestock mortality and veterinary medication costs"
      ],
      "opportunities": [
        "Government interest subsidy via NSFDC Mahila Samriddhi Yojana",
        "Biogas slurry monetization as organic manure for local farms"
      ],
      "threats": [
        "Fodder inflation risk during dry spells",
        "Cattle viral outbreaks requiring mandatory vaccination protocols"
      ],
      "data_attribution": "[Source: Domain Risk Patterns & Budget Synthesis]"
    },
    "threats_identification": {
      "supply_bottlenecks": "Concentrate feed prices rising 8-12% annually in dry season.",
      "seasonal_dips": "Calving cycles cause temporary dry periods with 25% lower milk yield.",
      "single_buyer_dependency": "Low risk; dual revenue split between cooperative and private tea stalls.",
      "data_attribution": "[Source: business_risk_patterns.csv & Field Domain Seed]"
    },
    "competitor_mapping": {
      "total_nearby_shops": 4,
      "direct_competitors": 2,
      "saturation_index": "Moderate",
      "is_modeled_estimate": false,
      "saturation_commentary": "Village has 2 private milk booths and 2 informal herd owners; sufficient surplus market demand within 10 km.",
      "data_attribution": "[Source: Live Google Places / Area Insights API]"
    },
    "product_market_value": {
      "recommended_selling_price": "₹38 - ₹42 per Litre",
      "estimated_daily_sales_volume_units": 65,
      "estimated_monthly_gross_revenue": 78000.00,
      "estimated_monthly_net_profit": 28500.00,
      "unit_variable_cost": 22.00,
      "monthly_fixed_costs": 6500.00,
      "purchasing_power_tier": "Upper-Middle Rural",
      "data_attribution": "[Source: Tamil Nadu DES DDP & NSSO Spend Benchmark]"
    }
  }
}
```

*(Note: `is_modeled_estimate` is now cleanly nested inside `module1_report.competitor_mapping` as requested).*

---

## 3. Module 2: Financial Calculator & Scheme Router Endpoints (PRD-03)

### 3.1 Financial Structuring Calculation (Aligned to Canonical Schema A)
- **Path:** `POST /api/finance/calculate`
- **Auth Required:** Optional
- **Request Body:**
```json
{
  "margin_capital": 100000.00,
  "business_category": "Dairy",
  "social_category": "SC",
  "gender": "Female",
  "disability_status": false,
  "ex_servicemen_status": false,
  "annual_household_income": 180000.00,
  "module1_metrics": {
    "estimated_monthly_net_profit": 28500.00,
    "unit_selling_price": 40.00,
    "unit_variable_cost": 22.00,
    "monthly_fixed_costs": 6500.00
  }
}
```

#### Exact Mathematical Derivation (Verified Java 21 / Standard Reducing-Balance Annuity)
1. **Inputs:**
   - $\text{Margin Capital} = ₹1,00,000.00$
   - $\text{Project Cost} = \frac{100000}{0.10} = ₹10,00,000.00$
   - Scheme: Term Loan Scheme (Rate: $8.0\%$ p.a., Tenure: $84\text{ months} = 28\text{ quarters}$, Moratorium: $6\text{ months} = 2\text{ quarters}$)
   - $\text{Loan Amount } P = \min(0.90 \times 1000000, 4500000) = ₹9,00,000.00$
   - Quarterly Interest Rate: $r = \frac{8.0\%}{4} = 0.02$
   - Repayment Quarters: $n = 28 - 2 = 26$
2. **Equal Quarterly Installment (EQI) Formula:**
   $$\text{EQI} = P \times \frac{r \times (1+r)^n}{(1+r)^n - 1} = 900000 \times \frac{0.02 \times (1.02)^{26}}{(1.02)^{26} - 1} = 44,729.307716 \implies \mathbf{₹44,729.31}$$
3. **Monthly Debt Obligation:**
   $$E_{\text{monthly}} = \frac{44729.31}{3} = \mathbf{₹14,909.77}$$
4. **FOIR & Affordability Verdict:**
   $$\text{FOIR} = \frac{14909.77}{28500.00} \times 100 = \mathbf{52.31\%}$$
   - Since $\text{FOIR} > 50.0\%$, the canonical verdict is:
     `foir_verdict_code: "HIGH_FINANCIAL_BURDEN"`, `foir_badge_color: "RED"`, `foir_verdict_label: "High Financial Burden"`
5. **Break-Even Units:**
   $$\text{Break-Even Units / Month} = \frac{\text{Fixed Costs} + E_{\text{monthly}}}{\text{Price} - \text{VarCost}} = \frac{6500 + 14909.77}{40 - 22} = \frac{21409.77}{18} = \mathbf{1190\text{ units}}$$

- **Response (200 OK):**
```json
{
  "is_eligible": true,
  "advisory_message": null,
  "financial_summary": {
    "margin_capital": 100000.00,
    "project_cost": 1000000.00,
    "loan_amount": 900000.00,
    "scheme_name": "Term Loan Scheme",
    "scheme_type": "TERM_LOAN",
    "interest_rate_pa": 8.0,
    "tenure_months": 84,
    "moratorium_months": 6,
    "total_quarters": 28,
    "moratorium_quarters": 2,
    "repayment_quarters": 26,
    "quarterly_installment": 44729.31,
    "monthly_equivalent_installment": 14909.77,
    "working_capital_allocation_pct": 25.0,
    "working_capital_amount": 250000.00,
    "capex_amount": 750000.00,
    "foir_percentage": 52.31,
    "foir_verdict_code": "HIGH_FINANCIAL_BURDEN",
    "foir_verdict_label": "High Financial Burden",
    "foir_badge_color": "RED",
    "break_even_units_per_month": 1190,
    "applicable_corporation": "National Scheduled Castes Finance and Development Corporation (NSFDC)",
    "special_flags": [
      "Eligible for Mahila Samriddhi Yojana (special interest concession / women SHG priority)"
    ],
    "stress_test": {
      "stressed_monthly_revenue": 19950.00,
      "stressed_foir_percentage": 74.74,
      "resilience_rating": "Vulnerable",
      "resilience_recommendation": "Maintain a minimum 3-month operating cash buffer (₹45,000) before loan drawdown."
    }
  },
  "amortization_schedule": [ /* Full 28-row table detailed below */ ]
}
```

---

### 3.2 Full 28-Row Amortization Table (Term Loan Worked Example)
$P = 900,000.00$, $r = 2.0\%$ quarterly ($8.0\%$ p.a.), Tenure = 28 quarters, Moratorium = 2 quarters (Option B: Serviced Interest).

| Quarter | Opening Principal (₹) | Principal Paid (₹) | Interest Paid (₹) | Total Installment (₹) | Closing Balance (₹) | Moratorium? |
|---|---|---|---|---|---|---|
| **Q1** | 900,000.00 | 0.00 | 18,000.00 | 18,000.00 | 900,000.00 | `true` |
| **Q2** | 900,000.00 | 0.00 | 18,000.00 | 18,000.00 | 900,000.00 | `true` |
| **Q3** | 900,000.00 | 26,729.31 | 18,000.00 | 44,729.31 | 873,270.69 | `false` |
| **Q4** | 873,270.69 | 27,263.90 | 17,465.41 | 44,729.31 | 846,006.79 | `false` |
| **Q5** | 846,006.79 | 27,809.17 | 16,920.14 | 44,729.31 | 818,197.62 | `false` |
| **Q6** | 818,197.62 | 28,365.36 | 16,363.95 | 44,729.31 | 789,832.26 | `false` |
| **Q7** | 789,832.26 | 28,932.66 | 15,796.65 | 44,729.31 | 760,899.60 | `false` |
| **Q8** | 760,899.60 | 29,511.32 | 15,217.99 | 44,729.31 | 731,388.28 | `false` |
| **Q9** | 731,388.28 | 30,101.54 | 14,627.77 | 44,729.31 | 701,286.73 | `false` |
| **Q10** | 701,286.73 | 30,703.58 | 14,025.73 | 44,729.31 | 670,583.16 | `false` |
| **Q11** | 670,583.16 | 31,317.65 | 13,411.66 | 44,729.31 | 639,265.51 | `false` |
| **Q12** | 639,265.51 | 31,944.00 | 12,785.31 | 44,729.31 | 607,321.51 | `false` |
| **Q13** | 607,321.51 | 32,582.88 | 12,146.43 | 44,729.31 | 574,738.63 | `false` |
| **Q14** | 574,738.63 | 33,234.54 | 11,494.77 | 44,729.31 | 541,504.10 | `false` |
| **Q15** | 541,504.10 | 33,899.23 | 10,830.08 | 44,729.31 | 507,604.87 | `false` |
| **Q16** | 507,604.87 | 34,577.21 | 10,152.10 | 44,729.31 | 473,027.66 | `false` |
| **Q17** | 473,027.66 | 35,268.76 | 9,460.55 | 44,729.31 | 437,758.90 | `false` |
| **Q18** | 437,758.90 | 35,974.13 | 8,755.18 | 44,729.31 | 401,784.77 | `false` |
| **Q19** | 401,784.77 | 36,693.61 | 8,035.70 | 44,729.31 | 365,091.15 | `false` |
| **Q20** | 365,091.15 | 37,427.49 | 7,301.82 | 44,729.31 | 327,663.66 | `false` |
| **Q21** | 327,663.66 | 38,176.04 | 6,553.27 | 44,729.31 | 289,487.63 | `false` |
| **Q22** | 289,487.63 | 38,939.56 | 5,789.75 | 44,729.31 | 250,548.07 | `false` |
| **Q23** | 250,548.07 | 39,718.35 | 5,010.96 | 44,729.31 | 210,829.72 | `false` |
| **Q24** | 210,829.72 | 40,512.72 | 4,216.59 | 44,729.31 | 170,317.01 | `false` |
| **Q25** | 170,317.01 | 41,322.97 | 3,406.34 | 44,729.31 | 128,994.04 | `false` |
| **Q26** | 128,994.04 | 42,149.43 | 2,579.88 | 44,729.31 | 86,844.61 | `false` |
| **Q27** | 86,844.61 | 42,992.42 | 1,736.89 | 44,729.31 | 43,852.19 | `false` |
| **Q28** | 43,852.19 | **43,852.19** | 877.04 | 44,729.23 | **0.00** | `false` |

> **Acceptance Verification:** In Quarter 28, full remaining principal of ₹43,852.19 is cleared with final installment ₹44,729.23 (8-paise adjustment). Closing balance reaches **exactly ₹0.00**.

---

### 3.3 Full 12-Row Amortization Table (Micro Finance Boundary Case)
$P = 125,000.00$ (Margin = ₹14,000.00, Project Cost = ₹1,40,000.00), $r = 1.625\%$ quarterly ($6.5\%$ p.a.), Tenure = 12 quarters (36m), Moratorium = 1 quarter (3m).  
$\text{EQI} = 125000 \times \frac{0.01625 \times (1.01625)^{11}}{(1.01625)^{11} - 1} = \mathbf{₹12,501.34}$.

| Quarter | Opening Principal (₹) | Principal Paid (₹) | Interest Paid (₹) | Total Installment (₹) | Closing Balance (₹) | Moratorium? |
|---|---|---|---|---|---|---|
| **Q1** | 125,000.00 | 0.00 | 2,031.25 | 2,031.25 | 125,000.00 | `true` |
| **Q2** | 125,000.00 | 10,470.09 | 2,031.25 | 12,501.34 | 114,529.91 | `false` |
| **Q3** | 114,529.91 | 10,640.23 | 1,861.11 | 12,501.34 | 103,889.68 | `false` |
| **Q4** | 103,889.68 | 10,813.13 | 1,688.21 | 12,501.34 | 93,076.55 | `false` |
| **Q5** | 93,076.55 | 10,988.85 | 1,512.49 | 12,501.34 | 82,087.70 | `false` |
| **Q6** | 82,087.70 | 11,167.41 | 1,333.93 | 12,501.34 | 70,920.29 | `false` |
| **Q7** | 70,920.29 | 11,348.89 | 1,152.45 | 12,501.34 | 59,571.40 | `false` |
| **Q8** | 59,571.40 | 11,533.30 | 968.04 | 12,501.34 | 48,038.10 | `false` |
| **Q9** | 48,038.10 | 11,720.72 | 780.62 | 12,501.34 | 36,317.38 | `false` |
| **Q10** | 36,317.38 | 11,911.18 | 590.16 | 12,501.34 | 24,406.19 | `false` |
| **Q11** | 24,406.19 | 12,104.74 | 396.60 | 12,501.34 | 12,301.45 | `false` |
| **Q12** | 12,301.45 | **12,301.45** | 199.90 | 12,501.35 | **0.00** | `false` |

> **Acceptance Verification:** In Quarter 1, interest is exactly ₹2,031.25 (matching PRD-05 US-5.1). In Quarter 12, closing balance reaches **exactly ₹0.00**.

---

## 4. Unified Report Dashboard Endpoints (PRD-04)

### 4.1 Execute Unified Assessment Pipeline (Uses Canonical Schema A)
- **Path:** `POST /api/assess/complete`
- **Auth Required:** Yes
- **Response (200 OK):**
```json
{
  "assessment_id": 1025,
  "created_at": "2026-09-13T10:00:00Z",
  "owner_name": "Meena Devi",
  "business_category": "Dairy",
  "village_context": {
    "village_lgd_code": 639842,
    "village_name": "Melavalavu",
    "district_name": "Madurai"
  },
  "module1_report": { /* Full 6-point report from Section 2.3 */ },
  "module2_result": { /* Canonical Module2Result from Section 3.1 */ },
  "dashboard_kpis": {
    "total_project_cost": 1000000.00,
    "margin_money": 100000.00,
    "concessional_loan": 900000.00,
    "scheme_name": "Term Loan Scheme",
    "scheme_type": "TERM_LOAN",
    "interest_rate_pa": 8.0,
    "foir_percentage": 52.31,
    "foir_verdict_code": "HIGH_FINANCIAL_BURDEN",
    "foir_verdict_label": "High Financial Burden",
    "foir_badge_color": "RED",
    "readiness_rings": {
      "composite_score_pct": 85,
      "document_completeness_pct": 90,
      "permit_readiness_pct": 80,
      "operating_margin_pct": 22
    }
  }
}
```

### 4.2 Get Report by Assessment ID
- **Path:** `GET /api/reports/{assessment_id}`
- **Auth Required:** Yes
- **Response (200 OK):** Matches 4.1 payload.

### 4.3 Get Latest Report
- **Path:** `GET /api/reports/latest`
- **Auth Required:** Yes
- **Response (200 OK):** Matches 4.1 payload for user's most recent assessment.

---

## 5. AI Chat & Live Voice Assistant Endpoints (PRD-05)

### 5.1 Get Chat History
- **Path:** `GET /api/chat/history/{assessment_id}`
- **Auth Required:** Yes
- **Response (200 OK):**
```json
[
  {
    "message_id": 501,
    "assessment_id": 1025,
    "sender": "user",
    "content": "Why is my first quarter payment only ₹2,031?",
    "is_voice": false,
    "created_at": "2026-09-13T10:05:00Z"
  },
  {
    "message_id": 502,
    "assessment_id": 1025,
    "sender": "assistant",
    "content": "Vanakkam Meena! During your first 3 months (Quarter 1), you are under a scheme moratorium...",
    "is_voice": false,
    "created_at": "2026-09-13T10:05:03Z"
  }
]
```

### 5.2 Send Text Chat Query
- **Path:** `POST /api/chat/message`
- **Auth Required:** Yes
- **Request Body:**
```json
{
  "assessment_id": 1025,
  "content": "Can I repay my loan early without penalty?"
}
```
- **Response (200 OK):**
```json
{
  "message_id": 503,
  "sender": "assistant",
  "content": "Yes, Meena! Concessional loans through NSFDC allow early repayment without any foreclosure penalty...",
  "tokens_used": 340,
  "created_at": "2026-09-13T10:06:12Z"
}
```

### 5.3 Live Voice Assistant WebSocket
- **Protocol:** `WS` / `WSS`
- **Path:** `/ws/live-voice?assessment_id={assessment_id}&token={jwt}`
- **Client $\to$ Server:** Binary PCM 16-bit 16kHz audio chunks.
- **Server $\to$ Client:** Binary PCM chunks from Gemini Live + JSON transcript events (`{"type": "transcript", "sender": "user" | "assistant", "text": "..."}`).

---

## 6. Search for Schemes (Simulated) Endpoints (PRD-06)

### 6.1 Get Static Archetype Catalog
- **Path:** `GET /api/schemes/archetypes`
- **Auth Required:** No
- **Response (200 OK):** Pre-curated list of 8–12 scheme archetypes.

### 6.2 Execute Progressive Scheme Search (Simulated)
- **Path:** `POST /api/schemes/search`
- **Auth Required:** Yes
- **Pre-Fill Behavior:** The `primary_applicant` fields (`age`, `gender`, `social_category`, `disability_status`, `ex_servicemen_status`) are automatically pre-filled from the active `assessments` record (captured during /assess Step 3) so the user is never asked to re-enter demographic data. The questionnaire modal only prompts fresh for novel parameters (`annual_household_income_band`, `education_level`, `existing_business`, `previous_subsidies`, `co_applicant`).
- **Request Body:**
```json
{
  "assessment_id": 1025,
  "questionnaire": {
    "ownership": "Me (Primary Applicant)",
    "primary_applicant": {
      "age": 34,
      "gender": "Female",
      "social_category": "SC",
      "annual_household_income_band": "< ₹1.5 Lakh",
      "education_level": "10th Pass",
      "disability_status": false,
      "ex_servicemen_status": false
    },
    "household_history": {
      "has_existing_business": false,
      "previous_subsidies": "None",
      "co_applicant": {
        "relationship": "Spouse",
        "gender": "Male",
        "disability_status": false
      }
    }
  }
}
```
- **Response (200 OK):**
```json
{
  "session_id": 801,
  "assessment_id": 1025,
  "is_illustrative": true,
  "mandatory_global_disclosure": "AI-generated illustrative match — verify with your nearest SCA or bank before applying. These matches do NOT constitute statutory sanction.",
  "household_strategy_insight": "Registering the enterprise under Meena Devi (Primary Applicant) unlocks an additional 1.5% interest rebate under Mahila Samriddhi Yojana compared to registering under spouse.",
  "recommended_schemes": [
    {
      "scheme_id": "NSFDC_MAHILA_SAMRIDDHI",
      "scheme_name": "NSFDC Mahila Samriddhi Yojana (Illustrative)",
      "category": "loan_type_specific",
      "target_beneficiary_match": "Recommended under Meena's name as a female SC entrepreneur",
      "illustrative_benefit": "Up to ₹1,40,000 credit limit with special interest subvention for women SHG members",
      "indicative_interest_rate": "4.0% - 6.5% p.a.",
      "participating_institutions": "Tamil Nadu Adi Dravidar Housing and Development Corporation (TAHDCO) / NSFDC",
      "is_illustrative": true,
      "mandatory_disclosure": "AI-generated illustrative match — verify with your nearest SCA/bank before applying"
    }
  ]
}
```

### 6.3 Get Saved Scheme Search Session
- **Path:** `GET /api/schemes/session/{session_id}`
- **Auth Required:** Yes
- **Response (200 OK):** Stored session object matching Section 6.2.
