# PRD-03: Module 2 — Financial Calculator & Scheme Router

---

## 1. Module Overview & Goal
Module 2 is a high-precision, deterministic financial engineering engine that transforms a rural entrepreneur's available margin capital into a complete, bank-ready credit structuring plan. It automatically computes total feasible project cost and loan eligibility, routes to the exact concessional loan tier (Micro Finance vs. Term Loan), generates reducing-balance quarterly amortization schedules factoring in scheme-mandated moratoriums, executes a Dynamic Eligibility Matrix lookup, and establishes an Integration Bridge with Module 1 to produce break-even metrics, Fixed Obligation to Income Ratio (FOIR) affordability verdicts, and seasonal stress-tests.  
**Traceability:** Sourced from `Docs/Problem statement.txt` (Lines 4–11, 38–55: Module 2 mandate), `Docs/01_PRODUCT_VISION.md` (Sections 3, 4, 7), `Docs/03_USER_JOURNEY_MAPS.md` (Stages 6, 7; Journey B Scenarios 31, 32), and `Docs/04_DATA_DICTIONARY_IA.md` (Section 3: `scheme_rules`, `eligibility_matrix`, `working_capital_ratios`).

---

## 2. In Scope / Out of Scope

### In Scope
- **Project Cost & Loan Eligibility Derivation:** Deterministic calculation:
  $$\text{Feasible Project Cost} = \frac{\text{Available Margin Capital}}{0.10} = \text{Available Margin Capital} \times 10$$
  $$\text{Feasible Loan Amount} = \min(0.90 \times \text{Project Cost}, \text{Scheme Max Loan Cap})$$
- **Scheme Auto-Selection Logic:**
  - $\text{Project Cost} \le ₹1,40,000 \implies$ **Micro Finance Scheme**
  - $₹1,40,000 < \text{Project Cost} \le ₹50,00,000 \implies$ **Term Loan Scheme**
  - $\text{Project Cost} > ₹50,00,000 \implies$ Explicit Out-of-Scheme advisory warning
- **Quarterly Reducing-Balance Amortization Schedule:** Exact quarterly installment generator modeling interest accrual during the moratorium followed by equal quarterly principal/interest payments over the post-moratorium term.
- **Dynamic Eligibility Matrix:** Static multi-attribute rule engine mapping `{social_category, gender, disability_status, ex_servicemen_status, income_band}` to corporation routing (e.g. NSFDC, NSKFDC, NBCFDC, NMDFC) and special concessions.
- **Working Capital Allocation:** Splitting project cost into Capital Expenditure (CapEx) and Working Capital based on curated sectoral ratios (`working_capital_ratios`).
- **Integration Bridge (M1 ⇄ M2):**
  - Monthly net revenue estimate derived from Module 1 pricing and sales volume,
  - Monthly debt obligation ($E_{\text{monthly}} = \text{Quarterly Installment} / 3$),
  - FOIR affordability score and color verdict: 🟢 Safe ($\le 35\%$), 🟡 Caution ($35.01\% - 50\%$), 🔴 High Risk ($> 50\%$),
  - Break-even sales units per month calculation.
- **Stress-Test Scenario:** Automated re-evaluation of FOIR and debt sustainability under a simulated 30% revenue drop (70% lean-season baseline).
- **Interactive What-If Capital Slider:** Pure client-side reactive function recomputing all financial metrics instantly as the user drags their margin capital input.

### Out of Scope
- **Credit Score Ingestion / CIBIL Underwriting:** No bureau credit pull or algorithmic credit scoring (explicitly excluded in `01_PRODUCT_VISION.md` Section 6).
- **Direct Core Banking System (CBS) Loan Disbursal:** No live banking API integration or NEFT/RTGS transaction processing.
- **Compound Daily Interest / Variable Rate Modeling:** Scheme terms specify fixed simple annual concessional rates compounded quarterly on reducing balance.

---

## 3. User Stories
- **US-3.1 (Instant Margin-to-Loan Math):** As Meena, I want to enter my saved savings (e.g. ₹1,00,000) and immediately see how large a business I can set up (₹10,00,000) and how much the government will lend me (₹9,00,000) without confusing percentage calculations (`Docs/Problem statement.txt` Line 44, `Docs/02_USER_PERSONAS.md`).
- **US-3.2 (Exact Moratorium Clarity):** As Meena, I want to see an exact quarterly repayment schedule showing that I pay only accrued interest during my initial setup months (moratorium) before full principal repayments begin (`Docs/Problem statement.txt` Line 54, `Docs/02_USER_PERSONAS.md`).
- **US-3.3 (Clear Affordability Verdict):** As Meena, I want a simple green/yellow/red badge showing whether my expected shop income easily covers my loan repayments so that I don't fall into a debt trap (`Docs/01_PRODUCT_VISION.md` Section 4, `Docs/02_USER_PERSONAS.md`).
- **US-3.4 (Lean-Season Stress Check):** As Meena, I want to see if my business can still pay its loan during the monsoon or lean season when sales drop by 30% (`Docs/01_PRODUCT_VISION.md` Section 4).
- **US-3.5 (What-If Experimentation):** As Meena, I want to slide my capital amount up and down to see how my EMI and required sales units change in real-time (`Docs/01_PRODUCT_VISION.md` Section 4).

---

## 4. Functional Requirements

### Financial Structuring & Scheme Auto-Selection
- **FR-3.1:** The system shall accept `margin_capital` as a positive decimal value $\ge ₹1,000$.
- **FR-3.2:** The system shall compute:
  $$\text{Feasible Project Cost} = \frac{\text{margin\_capital}}{0.10}$$
- **FR-3.3 (Scheme Routing Rules):**
  - **Micro Finance Scheme:** Selected if $\text{Project Cost} \le ₹1,40,000.00$.
    - `max_loan_cap` = $\min(0.90 \times \text{Project Cost}, ₹1,25,000.00)$.
    - `interest_rate_pa` = $6.5\%$ fixed per annum.
    - `tenure_months` = $36\text{ months}$ (12 quarters).
    - `moratorium_months` = $3\text{ months}$ (1 quarter).
    - `repayment_frequency` = Quarterly.
  - **Term Loan Scheme:** Selected if $₹1,40,000.00 < \text{Project Cost} \le ₹50,00,000.00$.
    - `max_loan_cap` = $\min(0.90 \times \text{Project Cost}, ₹45,00,000.00)$.
    - `interest_rate_pa` = $8.0\%$ fixed per annum.
    - `tenure_months` = $84\text{ months}$ (28 quarters).
    - `moratorium_months` = $6\text{ months}$ (2 quarters).
    - `repayment_frequency` = Quarterly.
  - **Exceeded Scope State:** If $\text{Project Cost} > ₹50,00,000.00$:
    - The system shall output `is_eligible = false` with explanatory notice: *"Exceeds Term Loan Scheme eligibility (maximum ₹50.00 Lakh project cost). Please consult your State Channelizing Agency for specialized large enterprise schemes."*
- **FR-3.4 (Boundary Condition Enforcement):**
  - For $\text{Project Cost} = \text{exactly } ₹1,40,000.00$ (margin = ₹14,000.00): The system shall strictly route to **Micro Finance Scheme**, producing $\text{Loan Amount} = ₹1,25,000.00$ (capped at ₹1.25L per PS mandate, while user margin covers the remaining ₹15,000.00).
  - For $\text{Project Cost} = \text{exactly } ₹50,00,000.00$ (margin = ₹5,00,000.00): The system shall route to **Term Loan Scheme**, producing $\text{Loan Amount} = ₹45,00,000.00$.

### Quarterly Amortization Engine
- **FR-3.5:** Quarterly interest rate $r = \frac{\text{interest\_rate\_pa}}{4 \times 100}$.
- **FR-3.6 (Moratorium Phase):**
  - During the moratorium period ($M = 1\text{ quarter}$ for Micro Finance, $M = 2\text{ quarters}$ for Term Loan):
    - Principal Repayment = $₹0.00$.
    - Moratorium Interest Due per quarter = $\text{Loan Amount} \times r$.
    - Closing Principal remains equal to Opening Principal.
- **FR-3.7 (Repayment Phase):**
  - Active repayment quarters $N = \frac{\text{tenure\_months} - \text{moratorium\_months}}{3}$.
    - Micro Finance: $N = \frac{36 - 3}{3} = 11\text{ quarters}$.
    - Term Loan: $N = \frac{84 - 6}{3} = 26\text{ quarters}$.
  - Equal Quarterly Installment (EQI) is computed via the reducing-balance formula:
    $$\text{EQI} = P \times \frac{r \times (1 + r)^N}{(1 + r)^N - 1}$$
    where $P = \text{Loan Amount}$.
  - For each quarter $q \in [M+1, M+N]$:
    - Interest Component: $I_q = P_{q-1} \times r$.
    - Principal Component: $Pr_q = \text{EQI} - I_q$.
    - Closing Balance: $P_q = P_{q-1} - Pr_q$ (with final quarter adjusted for rounding to zero).
- **FR-3.8:** The system shall output the complete amortization schedule as a JSON array of quarter records containing: `quarter_number`, `opening_balance`, `principal_paid`, `interest_paid`, `total_installment`, `closing_balance`, `is_moratorium`.

### Working Capital & CapEx Breakdown
- **FR-3.9:** The system shall query `working_capital_ratios` by `business_category`. If not found, default to $25\%$.
- **FR-3.10:** Working capital allocation = $\text{Project Cost} \times \text{working\_capital\_pct}$. CapEx allocation = $\text{Project Cost} \times (1 - \text{working\_capital\_pct})$.

### Dynamic Eligibility Matrix
- **FR-3.11:** The engine shall evaluate user social demographic attributes against `eligibility_matrix`:
  - `social_category == 'SC'` $\implies$ Recommended SCA: **National Scheduled Castes Finance and Development Corporation (NSFDC)**.
  - `social_category == 'Safai Karamchari'` $\implies$ Recommended SCA: **National Safai Karamcharis Finance and Development Corporation (NSKFDC)**.
  - `social_category == 'OBC'` $\implies$ Recommended SCA: **National Backward Classes Finance & Development Corporation (NBCFDC)**.
  - `gender == 'Female'` $\implies$ Flag: *"Eligible for Mahila Samriddhi Yojana (special interest concession / women SHG priority)"*.
  - `disability_status == true` $\implies$ Flag: *"Eligible for NHFDC special concessional credit tier"*.
  - `ex_servicemen_status == true` $\implies$ Flag: *"Eligible for SEMFEX / Directorate General Resettlement scheme linkages"*.

### Integration Bridge: Affordability & Break-Even
- **FR-3.12:** Monthly equivalent loan burden:
  $$E_{\text{monthly}} = \frac{\text{EQI}}{3}$$
- **FR-3.13:** Monthly net revenue is extracted from Module 1 (`module1_report_json -> product_market_value -> estimated_monthly_net_profit`). If absent, it is derived from daily revenue:
  $$\text{Gross Revenue} = \text{daily\_units} \times \text{unit\_price} \times 30$$
  $$\text{Net Revenue} = \text{Gross Revenue} \times \text{operating\_margin\_pct}$$
- **FR-3.14 (FOIR Calculation & Verdict):**
  $$\text{FOIR} = \frac{E_{\text{monthly}}}{\text{Net Revenue}} \times 100$$
  - $\text{FOIR} \le 35.00\% \implies$ **🟢 SAFE AFFORDABILITY** (*"Healthy debt service buffer"*).
  - $35.01\% < \text{FOIR} \le 50.00\% \implies$ **🟡 MODERATE CAUTION** (*"Manageable burden; tight margin for error"*).
  - $\text{FOIR} > 50.00\% \implies$ **🔴 HIGH FINANCIAL BURDEN** (*"Unviable debt burden; high risk of default"*).
- **FR-3.15 (Break-Even Units):**
  $$\text{Break-Even Units / Month} = \frac{\text{Monthly Fixed Costs} + E_{\text{monthly}}}{\text{Unit Selling Price} - \text{Unit Variable Cost}}$$

### Stress-Test Scenario
- **FR-3.16:** The engine shall recompute FOIR under a stress condition where monthly net revenue drops by $30\%$ ($\text{Stressed Net Revenue} = 0.70 \times \text{Net Revenue}$).
- **FR-3.17:** The system shall output the stress FOIR and assign a resilience rating:
  - Stressed $\text{FOIR} \le 50.00\% \implies$ **Resilient** (*"Survives seasonal dips"*).
  - Stressed $\text{FOIR} > 50.00\% \implies$ **Vulnerable** (*"Requires 3-month working capital buffer"*).

### Interactive What-If Functionality
- **FR-3.18:** The frontend shall expose an interactive slider modifying `margin_capital` in real-time. Moving the slider shall trigger client-side re-execution of FR-3.2 through FR-3.17 within $< 16\text{ ms}$ (60 FPS) without dispatching external network calls.

---

## 5. Data Requirements

### Tables & Static Config Read
- **`scheme_rules` Config (`Docs/04_DATA_DICTIONARY_IA.md` Section 3):**
  - Exact parameters for `Micro Finance` and `Term Loan`.
- **`eligibility_matrix` Config:**
  - Multi-attribute mapping table for social category, gender, disability, ex-servicemen concessions.
- **`working_capital_ratios` Config:**
  - Curated category-to-percentage ratios from `business_risk_patterns.csv` / domain seed catalog.
- **`assessments.module1_report_json`:**
  - Reads `product_market_value` fields for revenue, unit price, and variable cost benchmarks.

### Tables Written
- **`assessments.module2_result_json` (`Docs/04_DATA_DICTIONARY_IA.md` Section 2):**
  - Persists JSON structure containing:
    - `margin_capital`, `project_cost`, `loan_amount`,
    - `scheme_name`, `interest_rate_pa`, `tenure_months`, `moratorium_months`,
    - `quarterly_installment`, `monthly_equivalent_installment`,
    - `working_capital_amount`, `capex_amount`,
    - `applicable_corporation`, `eligibility_flags`,
    - `foir_percentage`, `foir_verdict`,
    - `break_even_units_per_month`,
    - `stress_test`: `{stressed_revenue, stressed_foir, resilience_rating}`,
    - `amortization_schedule` (Quarter 1 to Quarters 12 or 28).

---

## 6. API / Integration Requirements
- **No External GCP / AI API Calls:** Module 2 is 100% deterministic, executing entirely in backend Java 21 / Spring Boot services and client-side JavaScript.
- **REST Endpoints Exposed:**
  - `POST /api/finance/calculate`: Accepts `{margin_capital, business_category, social_category, gender, disability, ex_servicemen, module1_metrics?}` and returns the complete `module2_result_json` payload.
  - `POST /api/finance/amortization-table`: Generates standalone printable amortization schedule.
- **Execution Latency:** Total calculation and schedule generation execution must complete in $< 5\text{ ms}$.

---

## 7. Edge Cases & Error States
- **EC-3.1 (Project Cost Exactly ₹1.40 Lakh):** When `margin_capital == 14000`, `project_cost = 140000`. The engine must strictly assign **Micro Finance Scheme** (rate: $6.5\%$, tenure: 36m, moratorium: 3m, loan cap: ₹1,25,000). Must NOT assign Term Loan.
- **EC-3.2 (Project Cost ₹1,40,001):** When `margin_capital == 14000.10`, `project_cost = 140001`. The engine must assign **Term Loan Scheme** (rate: $8.0\%$, tenure: 84m, moratorium: 6m).
- **EC-3.3 (Project Cost Exactly ₹50.00 Lakh):** When `margin_capital == 500000`, `project_cost = 5000000`. The engine must assign **Term Loan Scheme** with max loan cap ₹45,00,000.
- **EC-3.4 (Project Cost Exceeds ₹50 Lakh):** When `margin_capital > 500000`, the engine does not throw a 500 error; it returns a gracefully formatted payload with `is_eligible: false` and a clear advisory message directing the entrepreneur to standard commercial or MSME schemes.
- **EC-3.5 (Negative or Zero Margin Input):** Input validation rejects $\le 0$ values with `HTTP 400 Bad Request` (*"Available margin capital must be greater than ₹1,000"*).
- **EC-3.6 (Zero Revenue / Negative Margins from M1):** If Module 1 reports net profit $\le 0$, FOIR is flagged as `UNDEFINED_HIGH_RISK` and the verdict is forced to 🔴 HIGH RISK.

---

## 8. Acceptance Criteria
- [ ] For `margin_capital = 100000` (₹1 Lakh), system generates:
  - `project_cost = 1000000.00` (₹10 Lakh),
  - `loan_amount = 900000.00` (₹9 Lakh),
  - `scheme_name = "Term Loan Scheme"`,
  - `interest_rate_pa = 8.0`,
  - `tenure_months = 84`,
  - `moratorium_months = 6`,
  - Exactly 28 quarterly amortization rows.
- [ ] For `margin_capital = 14000` (boundary test), system assigns `Micro Finance Scheme` with `loan_amount = 125000.00` and $6.5\%$ interest rate.
- [ ] For `margin_capital = 14001`, system assigns `Term Loan Scheme` with $8.0\%$ interest rate.
- [ ] For `margin_capital = 600000` (₹60 Lakh PC), system returns `is_eligible: false` with the explicit ₹50L cap advisory message.
- [ ] Moratorium verification: For Micro Finance, Quarter 1 principal paid is $₹0.00$ and interest paid is exactly $125000 \times \frac{0.065}{4} = ₹2,031.25$.
- [ ] Dynamic Eligibility Matrix correctly assigns NSFDC for SC, NSKFDC for Safai Karamchari, and adds Mahila Samriddhi note for female entrepreneurs.
- [ ] FOIR correctly renders 🟢 when $\le 35\%$, 🟡 when $35.01\% - 50\%$, and 🔴 when $> 50\%$.
- [ ] Stress-test correctly computes 70% revenue scenario and flags resilience rating.
- [ ] Moving the what-if slider updates all numbers client-side with zero network calls and zero UI lag.
- [ ] Standalone test script / assertions execute successfully against boundary cases before build sign-off.

---

## 9. Dependencies on Other Modules
- **Depends on PRD-01:** Authenticated user context.
- **Receives Inputs from PRD-02:** Unit price, operating margin, and sales volume from `module1_report_json`.
- **Feeds into PRD-04:** Complete `module2_result_json` powers the Financial Summary KPI cards, Amortization Table, Apple Activity Rings, and Break-Even charts in the Unified Dashboard.

---

## 10. Open Questions / Assumptions
- **Quarterly Cadence Confirmation:** Sourced from `04_DATA_DICTIONARY_IA.md` Section 3, repayment cadence is strictly quarterly reducing-balance for both schemes. Monthly burden is derived as $\text{EQI} / 3$ for FOIR comparability.
- **Moratorium Interest Capitalization vs. Servicing:** The PS specifies a moratorium period; the amortization formula models simple quarterly interest servicing during moratorium quarters (beneficiary pays interest only, principal is deferred), matching NSFDC standard practice.
