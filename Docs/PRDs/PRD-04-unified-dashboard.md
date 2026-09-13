# PRD-04: Unified Report Dashboard

---

## 1. Module Overview & Goal
The Unified Report Dashboard (`/report`) is the central decision-making interface of VyapaarSathi, presenting a coherent, synthesized fusion of Module 1 (Hyper-Local Feasibility) and Module 2 (Financial Structuring). Designed with UX4G Aqua Blue design tokens, mobile-first 2G/3G optimizations, and low-literacy clarity, it translates complex demographic and credit engineering data into an authoritative 4-tab dashboard featuring 3-KPI financial cards, an interactive break-even curve graph, an Apple Activity Ring readiness and affordability verdict widget (🟢🟡🔴), an interactive competitor density map, and a 6-point risk matrix with explicit data source citations.  
**Traceability:** Sourced from `Docs/Problem statement.txt` (Expected Solution & Impact Goals), `Docs/01_PRODUCT_VISION.md` (Sections 3, 4, 7), `Docs/02_USER_PERSONAS.md` (Meena's goals and success definition), `Docs/03_USER_JOURNEY_MAPS.md` (Stage 7: `/report`), `Docs/04_DATA_DICTIONARY_IA.md` (Section 2: `assessments`), and `Docs/Rough Plan/frontend_spec_master.md` (Section 2, 4: Page 4).

---

## 2. In Scope / Out of Scope

### In Scope
- **Top Header Bar & Actions:** MoSJE emblem, personalized user greeting (*"Good Morning, Meena"*), Download PDF action, Live AI Support launch toggle, Accessibility modal trigger (`Ctrl+F2`), and Language Selector.
- **Smooth 4-Tab Navigation (Motion Animated Tabs):**
  1. *General Feasibility Report* (Market reach, SWOT, opportunity niches, pricing recommendations).
  2. *Financial & EMI Plan* (3-KPI summary, interactive what-if capital slider, quarterly amortization schedule table, working capital vs CapEx split).
  3. *Risk & Saturation* (6-point risk matrix, seasonal sensitivity, direct vs indirect competitor breakdown).
  4. *Scheme Eligibility* (Dynamic Eligibility Matrix findings, selected scheme details, and CTA to launch Search for Schemes).
- **3-KPI Enterprise Financial Cards:** Total Project Cost, Margin Money (10%), and Concessional Loan (90% at $6.5\%$ or $8.0\%$).
- **Break-Even & Revenue Projection Graph (Recharts):** Visual trajectory curve plotting monthly cumulative revenue vs. cumulative costs with an explicit break-even intersection indicator (e.g. *"Month 3.5"*).
- **Bank Readiness & Affordability Widget:** Animated SVG multi-ring component (Apple Activity Ring style) showing composite readiness percentage, document completeness, permit readiness, and the definitive FOIR badge:
  - 🟢 **SAFE AFFORDABILITY** ($\text{FOIR} \le 35\%$)
  - 🟡 **MODERATE CAUTION** ($35\% < \text{FOIR} \le 50\%$)
  - 🔴 **HIGH FINANCIAL BURDEN** ($\text{FOIR} > 50\%$)
- **Hyper-Local Competitor Density Map & Cards:** Embedded interactive map (Leaflet or Mapbox) plotting the user's village, 10 km inspection radius, and pins for identified competitors and local raw material suppliers.
- **Nearby Supplier Carousel:** Horizontally scrolling cards of local wholesale markets and SCAs.
- **Data Source Citation Badges:** Every card and chart displays its source tag (e.g. `[Live Google Places]`, `[Census 2011 PCA]`, `[NSSO HCES]`, `[Modeled Estimate]`).
- **PDF Export Generation:** Client-side printable/downloadable summary formatted for bank officers.

### Out of Scope
- **Officer Case Review Workflow:** No officer approval buttons, loan sanctioning workflows, or credit manager comment queues in this build (per `01_PRODUCT_VISION.md` Section 6 and `02_USER_PERSONAS.md` Section 2).
- **Direct Telephony / Toll-Free VoIP:** The "Helpline" in the footer is a clickable `tel:` link, not an integrated VoIP client.
- **Heavy Raster Media:** No high-resolution photo banners; styling is SVG vector-driven to preserve fast loading under 2G/3G networks.

---

## 3. User Stories
- **US-4.1 (Instant Visual Verdict):** As Meena, I want to look at a single clear badge on my screen and know immediately if my business loan is safe (🟢) or dangerous (🔴) so that I don't need a finance degree to understand my situation (`Docs/02_USER_PERSONAS.md`, `Docs/03_USER_JOURNEY_MAPS.md` Stage 7).
- **US-4.2 (Visual Break-Even Target):** As Meena, I want to see a simple graph showing when my shop starts making real profit so that I can plan my family's survival budget during the early months (`Docs/02_USER_PERSONAS.md`, `Docs/Rough Plan/frontend_spec_master.md` Page 4).
- **US-4.3 (Competitor Map Exploration):** As Meena, I want to view an interactive map showing where other similar shops are located in my block so that I can choose a better street or market stall (`Docs/Problem statement.txt` Line 34, `Docs/SIH26091 Deep Dive Analysis.md` Section 4).
- **US-4.4 (Printable Bank Dossier):** As Meena, I want to tap "Download PDF" to save a clean 2-page summary that I can physically hand to the Bank or SCA Officer during my loan interview (`Docs/02_USER_PERSONAS.md`, `Docs/03_USER_JOURNEY_MAPS.md` Stage 7).
- **US-4.5 (Source Traceability for Evaluators):** As an Evaluator or Bank Officer examining Meena's dashboard, I want to hover or click on any figure to see its exact provenance so that I know the advice is grounded in real government data (`Docs/01_PRODUCT_VISION.md` Section 7).

---

## 4. Functional Requirements

### Dashboard Header & Session Hydration
- **FR-4.1:** Upon navigating to `/report?id={assessment_id}`, the page shall fetch the assessment record via `GET /api/reports/{assessment_id}`.
- **FR-4.2:** The header shall render the MoSJE Government Portal brand banner, user greeting with dynamic avatar, a "Download PDF" button, and an "AI Support (Live)" action button that expands the bottom drawer.
- **FR-4.3:** If `{assessment_id}` is omitted, the dashboard shall load the user's most recent assessment. If no assessments exist, redirect to `/assess`.

### Tabbed Navigation Architecture
- **FR-4.4:** The dashboard shall provide 4 tabs rendered with Motion layout animations (`LayoutId` sliding pill highlight):
  - Tab 1: **General Feasibility Report**
  - Tab 2: **Financial & EMI Plan**
  - Tab 3: **Risk & Saturation**
  - Tab 4: **Scheme Eligibility**
- **FR-4.5:** Tab state shall synchronize with URL query parameter (`/report?tab=financial`) to enable direct linking and back-button history navigation.

### Tab 1: General Feasibility Report
- **FR-4.6:** Renders all 6 synthesized points from `module1_report_json`:
  - **Market Reach Card:** Estimated consumer base (persons & households within 10 km) + primary distribution channels (weekly haats, retail counter, local delivery) with badge `[Source: Census 2011 + Layer 2 DB]`.
  - **Opportunity Analysis Bento:** Unserved niches in the local economy with confidence score.
  - **SWOT Bento Grid:** Staggered 4-card matrix (Strengths, Weaknesses, Opportunities, Threats) formatted with green, amber, blue, and red accents.
  - **Product Market Value & Pricing:** Recommended selling price, estimated daily sales volume, and local purchasing power tier benchmark (`[Source: Tamil Nadu DES DDP & NSSO HCES]`).

### Tab 2: Financial & EMI Plan
- **FR-4.7:** **3-KPI Summary Cards:**
  - Card 1: Total Project Cost ($₹\text{margin} / 0.10$).
  - Card 2: Margin Money Required ($10\%$).
  - Card 3: Concessional Loan ($90\%$ up to scheme cap at $6.5\%$ or $8.0\%$).
- **FR-4.8:** **Interactive What-If Capital Slider:**
  - A slider control allowing the user to adjust margin capital between ₹5,000 and ₹5,00,000.
  - Dynamically recalculates Project Cost, Loan Amount, Scheme tier, Quarterly Installment, and FOIR verdict on the fly without page reload.
- **FR-4.9:** **Break-Even & Revenue Projection Graph (Recharts):**
  - Plots month-by-month financial projection for Year 1 (Months 1 to 12).
  - Curve 1: Cumulative Revenue line.
  - Curve 2: Cumulative Total Costs line (CapEx + OpEx + Debt Service).
  - Highlights intersection point as `Break-Even Month (e.g. Month 3.5)`.
- **FR-4.10:** **Full Quarterly Amortization Table:**
  - Collapsible data table rendering all quarters (12 for Micro Finance, 28 for Term Loan).
  - Highlights moratorium quarters with badge: `Moratorium (Interest Only)`.
  - Columns: Quarter, Opening Principal, Principal Paid, Interest Paid, Total Installment, Closing Principal.
  - Printable / exportable as CSV.

### Tab 3: Risk & Saturation Matrix
- **FR-4.11:** **Apple Activity Rings Component (Readiness & Affordability):**
  - Three concentric animated SVG rings:
    - Outer Ring (Blue): Document Completeness ($90\%$).
    - Middle Ring (Orange): Permit / License Readiness ($80\%$).
    - Inner Ring (Green): Operating Margin ($10\% - 25\%$).
  - Center Display: Composite Readiness Score (e.g. `85%`).
- **FR-4.12:** **Affordability Verdict Badge:**
  - Renders directly below the rings using semantic tokens:
    - 🟢 `SAFE AFFORDABILITY` ($\text{FOIR} \le 35\%$)
    - 🟡 `MODERATE CAUTION` ($35\% < \text{FOIR} \le 50\%$)
    - 🔴 `HIGH FINANCIAL BURDEN` ($\text{FOIR} > 50\%$)
  - Accompanying plain-language explanation (e.g. *"Your estimated monthly profit of ₹28,500 comfortably covers your quarterly loan obligation of ₹6,500."*).
- **FR-4.13:** **Base vs. Stress-Case Comparison Card:**
  - Side-by-side card comparing normal season FOIR vs. 30% lean-season drop FOIR.
- **FR-4.14:** **6-Point Risk Matrix Bento:**
  - Cards for Market Risk, Seasonal Risk, Financial Risk, Operational Risk, Regulatory Risk, and Overall Risk Level, color-coded based on `business_risk_patterns.csv`.
- **FR-4.15:** **Competitor Density Map & Supplier Carousel:**
  - Interactive map plotting competitor POIs from Layer 1.
  - Horizontally scrolling carousel of recommended raw material suppliers / local SCAs within 10 km.

### Tab 4: Scheme Eligibility
- **FR-4.16:** Displays the auto-routed scheme card (Micro Finance vs. Term Loan) with all parameters (Interest, Tenure, Moratorium).
- **FR-4.17:** Displays corporation routing advice from Dynamic Eligibility Matrix (e.g. *"Recommended Corporation: NSFDC for Scheduled Caste entrepreneurs"*).
- **FR-4.18:** Renders prominent primary CTA: **"Search for More Household Schemes"** which launches the PRD-06 questionnaire modal.

### PDF Dossier Export
- **FR-4.19:** Tapping "Download PDF" generates a structured, 2-page print-optimized document containing the applicant name, village, 3-KPI summary, FOIR verdict, 6-point feasibility highlights, and the first year amortization schedule.

---

## 5. Data Requirements

### Tables Read
- **`assessments` Table (`Docs/04_DATA_DICTIONARY_IA.md` Section 2):**
  - `assessment_id`, `village_lgd_code`, `latitude`, `longitude`, `business_category`, `margin_capital`, `business_idea_description`, `module1_report_json`, `module2_result_json`, `created_at`.
- **`users` Table:**
  - `name`, `preferred_language`, `role`.

### Tables Written
- None directly on dashboard render. Actions on this page trigger writes to `chat_messages` (via PRD-05) or `scheme_search_sessions` (via PRD-06).

---

## 6. API / Integration Requirements
- **Backend Endpoints:**
  - `GET /api/reports/{assessment_id}`: Returns complete JSON payload containing combined `module1_report_json` and `module2_result_json`.
  - `GET /api/reports/latest`: Returns the user's most recent assessment.
- **Map Library Integration:**
  - Client-side Leaflet.js or Mapbox GL JS using standard OpenStreetMap or Google Maps tiles.
  - Requires `latitude`, `longitude`, and POI pins from `module1_report_json`.
- **Chart Library Integration:**
  - Recharts / Chart.js for the Break-Even curve. Lightweight, responsive, zero-external-network requirement.

---

## 7. Edge Cases & Error States
- **EC-4.1 (Assessment ID Not Found / Belongs to Other User):** Backend returns `HTTP 404 Not Found` or `HTTP 403 Forbidden`. Frontend displays a friendly empty state: *"Advisory report not found or private. Return to your history"* with CTA to `/settings`.
- **EC-4.2 (High Financial Risk Warning 🔴):** When FOIR exceeds $50\%$, the dashboard prominently displays an amber/red banner at the top of every tab: *"⚠️ High Financial Risk Detected: Your debt service exceeds 50% of projected earnings. We strongly recommend reducing your project cost or selecting a lower-investment category before applying."*
- **EC-4.3 (Zero Competitor Pins from Places API):** Map centers on village coordinates, displays the 10 km circle, and renders a clean notice on the map canvas: *"No commercial competitors registered on public maps in this 10 km area. Modeled estimate applied."*
- **EC-4.4 (Offline/Spotty Connection on `/report`):** Once fetched, the assessment data is cached in client-side memory (`React Query` / `IndexedDB`) so the user can switch tabs, interact with sliders, and review amortization offline without reloading.

---

## 8. Acceptance Criteria
- [ ] Navigating to `/report` with a valid `assessment_id` renders the 4-tab dashboard within $< 1.5\text{ seconds}$ on simulated 3G network conditions.
- [ ] All 3 KPI cards display numbers matching the exact math from PRD-03 ($10\%$ margin, $90\%$ loan up to scheme cap).
- [ ] Apple Activity Ring component renders with animated progress circles and displays the correct 🟢/🟡/🔴 affordability verdict badge matching PRD-03's FOIR score.
- [ ] Break-Even graph dynamically plots the curve and visually highlights the break-even month.
- [ ] Amortization table displays the exact quarterly schedule with moratorium quarters clearly marked.
- [ ] Interacting with the What-If slider immediately re-renders the 3-KPI cards, break-even target, and FOIR badge with 60 FPS fluidity.
- [ ] Competitor map plots the village center pin and POI pins from Layer 1 data.
- [ ] Every individual card displays a visible provenance badge (`[Live Google Places]`, `[Census 2011 PCA]`, `[NSSO HCES]`, or `[Modeled Estimate]`).
- [ ] Tapping "Download PDF" generates a clean, well-formatted 2-page print preview/PDF download.
- [ ] Tapping "Search for More Household Schemes" initiates the PRD-06 progressive questionnaire modal.

---

## 9. Dependencies on Other Modules
- **Depends on PRD-01:** Authenticated user session.
- **Depends on PRD-02:** Requires `module1_report_json` (SWOT, competitor POIs, pricing, consumer reach).
- **Depends on PRD-03:** Requires `module2_result_json` (project cost, loan amount, scheme tier, EQI, FOIR, amortization table).
- **Feeds into PRD-05:** Chat drawer docks at the bottom of this dashboard and uses this report as conversational context.
- **Feeds into PRD-06:** "Search for Schemes" button on Tab 4 launches the scheme discovery modal.

---

## 10. Open Questions / Assumptions
- **Map Library Selection:** `Docs/05_TECH_STACK_CONSTRAINTS.md` leaves Leaflet vs. Mapbox open. Leaflet is recommended for production because it is lighter, open-source, and has zero per-map-load token costs, aligning with rural 2G/3G performance goals.
- **Client-Side PDF Generation:** Recommended using `html2pdf.js` or React print styles (`@media print`) to generate the loan summary client-side without incurring backend PDF-rendering container overhead.
