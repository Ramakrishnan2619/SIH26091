# PRD-02: Module 1 — Hyper-Local Feasibility Report

---

## 1. Module Overview & Goal
Module 1 delivers an institutional-grade, hyper-local business feasibility study tailored for rural micro-entrepreneurs before they commit capital or apply for government loans. It synthesizes real-time local supply data (Google Places API New & Places Aggregate API) with pre-cleaned, verified government demand and economic baselines (LGD, Census 2011, NSSO HCES 2023-24, Tamil Nadu DES DDP) through Vertex AI Gemini 2.5 Flash to generate a 6-point strategic advisory report with strict data source citations.  
**Traceability:** Sourced from `Docs/Problem statement.txt` (Lines 22–37: Module 1 6-point mandate), `Docs/01_PRODUCT_VISION.md` (Section 3), `Docs/03_USER_JOURNEY_MAPS.md` (Stages 3–6), `Docs/04_DATA_DICTIONARY_IA.md` (Section 1: Three-Layer Data Architecture; Section 2: `assessments`), `Docs/05_TECH_STACK_CONSTRAINTS.md` (Section 4, 5), and `Optimized DB for Layer 2/DATA_DICTIONARY.md`.

---

## 2. In Scope / Out of Scope

### In Scope
- **Intake Form Interface (`/assess`):** Capturing Enterprise Owner Name, Age, Available Margin Capital (₹), Proposed Business Category (from pre-curated catalog), and Business Idea Description.
- **Location Ingestion & Autocomplete:** Browser Geolocation API integration with reverse geocoding via Google Maps Geocoding API, accompanied by a fallback LGD Village/Block/District search autocomplete backed by Layer 2 database.
- **Rapido-Style Interactive Top-Corner Map:** Visualizing the user's selected village coordinates, drawing a 5 km to 10 km inspection radius circle, and plotting nearby business competitor pins.
- **Layer 1 Live Supply Query:** Live querying of Google Places Aggregate API for competitor density and Google Places API (New) for POI distribution channels within a 5–10 km radial buffer.
- **Layer 2 Static Demand Lookup:** Instant SQLite/in-memory query into `layer2_demand_economics.db` matching on canonical `village_lgd_code` to retrieve village population, households, literacy rate, parent district per-capita NDP, income band, and state rural monthly per-capita spend.
- **Vertex AI Grounded Synthesis (`gemini-2.5-flash`):** Strict RAG orchestration generating all 6 mandatory report sections:
  1. Market Reach (5–10 km consumer base, primary distribution channels),
  2. Opportunity Analysis (underserved niches in the specific local economy),
  3. General Business Analysis / SWOT (budget-tailored strengths, weaknesses, opportunities, threats),
  4. Threats Identification (supply bottlenecks, seasonal dips, single-buyer dependencies),
  5. Competitor Mapping (density of similar businesses, direct vs indirect),
  6. Product Market Value (pricing recommendation and local purchasing power benchmarks).
- **Mandatory Source Tagging:** Every quantitative metric in the generated report must include explicit data attribution (e.g. `[Source: Google Places (Live)]`, `[Source: Census 2011 PCA]`, `[Source: NSSO HCES 2023-24]`, or `[Modeled Estimate]`).
- **Live Progress Loader:** Multi-stage transparent loading overlay displaying real-time task status text while orchestrating APIs.

### Out of Scope
- **Direct Web Scraping / Unverified Social Sentiment:** No scraping of Google reviews, Justdial, IndiaMART, or Instagram.
- **Automated Credit Bureau Integration:** No CIBIL / Experian pull or bank statement analysis.
- **Real-Time Traffic/Footfall Tracking:** No live cellular or GPS mobility tracking data; footfall is approximated using Census population and Places POI clustering.
- **Nationwide Coverage Outside Tamil Nadu:** Layer 2 static data is explicitly scoped to Tamil Nadu (State LGD Code `33`) as documented in `Optimized DB for Layer 2/DATA_DICTIONARY.md`.

---

## 3. User Stories
- **US-2.1 (One-Tap Geolocation):** As Meena, I want to tap "Share Location" on my smartphone so that the app instantly identifies my village and sets up a 10 km inspection area without me typing complex coordinates (`Docs/02_USER_PERSONAS.md`, `Docs/03_USER_JOURNEY_MAPS.md` Stage 4).
- **US-2.2 (Manual Fallback Search):** As Meena, I want to search for my village name from a dropdown if my phone's GPS is turned off or inaccurate, so that I can still complete my assessment (`Docs/03_USER_JOURNEY_MAPS.md` Journey B Scenario 34).
- **US-2.3 (Transparent Loading Feedback):** As Meena, I want to see step-by-step progress status while the report is generating so that I know the system is actively analyzing real maps and government records rather than freezing (`Docs/03_USER_JOURNEY_MAPS.md` Stage 6).
- **US-2.4 (Grounded Feasibility Insights):** As Meena, I want a localized SWOT and competitor count for my specific village so that I can make a data-backed choice instead of blindly copying a neighbor's shop (`Docs/Problem statement.txt` Line 14, `Docs/01_PRODUCT_VISION.md` Section 1).
- **US-2.5 (Data Source Verifiability):** As an SCA Officer or Evaluator reviewing Meena's report, I want to see the exact provenance tag for every demographic and competitor figure so that I can trust the analysis is not pure LLM hallucination (`Docs/01_PRODUCT_VISION.md` Section 7, `Docs/SIH26091 Deep Dive Analysis.md` Section 6, 10).

---

## 4. Functional Requirements

### Intake & Geolocation
- **FR-2.1:** The intake page `/assess` shall capture mandatory fields:
  - `owner_name` (Text, 2–100 chars),
  - `age` (Integer, 18–100, selectable via calendar or slider),
  - `margin_capital` (Decimal, ₹1,000 to ₹10,00,000),
  - `business_category` (Dropdown from curated list: *Retail / Kirana Store*, *Food & Beverage (Tea Stall/Tiffin)*, *Dairy / Agri-based*, *Textiles / Tailoring*, *Handicrafts*, *Repair Services*, *Beauty / Salon*, *Transport Services*, *Education / Coaching*, *Small-scale Manufacturing*, *Stationery / Printing*, *Agri-input / Equipment Rental*),
  - `business_idea_description` (Textarea, 10–1000 chars).
- **FR-2.2:** Tapping "Share Location" shall trigger the Browser Geolocation API (`navigator.geolocation.getCurrentPosition`). Upon receiving `latitude` and `longitude`, the client shall pass them to the backend reverse-geocoding service.
- **FR-2.3:** The backend shall call Google Maps Geocoding API with `latlng` to resolve the village, taluk/subdistrict, district, and postal code. The resolved location shall be mapped to the nearest canonical `village_lgd_code` in Layer 2.
- **FR-2.4:** If geolocation is denied, the UI shall render a searchable autocomplete input querying Layer 2 SQLite database (`village_name`, `subdistrict_name`, `district_name`) and resolving the user's selection to `village_lgd_code`.
- **FR-2.5:** Upon location resolution, the UI shall render an interactive top-corner map component dropping a pin at the resolved coordinates and rendering a translucent circular overlay with radius $R = 10\text{ km}$ (toggleable to 5 km).

### Live Supply Data Aggregation (Layer 1)
- **FR-2.6:** The backend shall query the **Places Aggregate API** for the resolved circle (center: `latitude, longitude`, radius: 10,000 meters) filtered by place type corresponding to `business_category` to obtain `competitor_density_count`.
- **FR-2.7:** The backend shall query the **Places API (New)** (Text Search or Nearby Search) to retrieve up to 20 place records within the radius, extracting: `displayName`, `formattedAddress`, `location` (`latitude`, `longitude`), `businessStatus`, and `types`.
- **FR-2.8 (Sparse Data Fallback):** If Places Aggregate API returns $< 2$ competitors for rural coordinates:
  - The system shall NOT declare zero competition.
  - The system shall invoke the Layer 2 population-ratio estimator:
    $$\text{Estimated Competitors} = \left\lceil \frac{\text{Village Population}}{250} \times \text{Sector Density Ratio} \right\rceil$$
  - The metric shall be labeled with `confidence: "modeled estimate"` and source tagged: `[Source: Modeled Estimate based on Census Demographics & NSS Enterprise Ratios]`.

### Static Demand Data Extraction (Layer 2)
- **FR-2.9:** The system shall execute a single-row indexed lookup against `layer2_demand_economics.db` using `village_lgd_code` (PK), extracting:
  - `village_name`, `district_name`, `subdistrict_name`,
  - `population`, `households`, `literacy_rate`,
  - `district_income_band` (`High`, `Upper-Middle`, `Middle`, `Low-Middle`),
  - `district_ndp_per_capita` (e.g. ₹325,874),
  - `state_avg_household_spend` (₹5,701.00),
  - `source` JSON object,
  - `confidence` flag (`"village-level"` or `"no village data"`).
- **FR-2.10:** If `confidence == "no village data"`, demographic fields shall inherit parent subdistrict/district benchmarks, with output labels clearly marked as `[Source: District Benchmark (Census 2011)]`.

### Reasoning & Synthesis (Layer 3 — Vertex AI)
- **FR-2.11:** The backend shall construct a structured, strictly grounded prompt to Vertex AI `gemini-2.5-flash` containing:
  - User intake inputs (`business_category`, `margin_capital`, `business_idea_description`),
  - Layer 1 live supply metrics (POI count, competitor list, density flag),
  - Layer 2 static demand metrics (population, literacy, district per capita NDP, MPCE spend),
  - Seed risk indicators from `business_risk_patterns.csv` for the chosen sector.
- **FR-2.12:** The model instructions shall strictly mandate JSON output conforming to the 6 mandatory report points:
  1. `market_reach`: Consumer base estimate (persons & households within 5–10 km), primary distribution channels (local haats, weekly markets, doorstep, retail counter).
  2. `opportunity_analysis`: Specific unserved/underserved product or service niches in this local economy.
  3. `swot_analysis`: Strengths, Weaknesses, Opportunities, Threats tailored to the specified budget and village context.
  4. `threats_identification`: Supply bottlenecks, raw material price swings, seasonal demand dips (e.g. monsoon/harvest cycles), single-buyer dependency.
  5. `competitor_mapping`: Total nearby shops, direct competitors, saturation index (`Low`, `Moderate`, `High`).
  6. `product_market_value`: Recommended product pricing range, expected average daily sales volume, and local purchasing power commentary.
- **FR-2.13:** Every individual section in the generated JSON must include a dedicated `data_attribution` field listing which inputs were used.

### Multi-Stage Progress Loader
- **FR-2.14:** During report generation, the backend/frontend shall communicate status updates sequentially:
  1. *"Resolving village coordinates & census boundaries..."*
  2. *"Querying Google Places for competitor density & distribution channels..."*
  3. *"Extracting consumption spend & income estimates from Layer 2 DB..."*
  4. *"Synthesizing 6-Point Hyper-Local Feasibility Report via Gemini 2.5 Flash..."*

### Persistence
- **FR-2.15:** The complete synthesized output, raw Layer 1 metrics, and Layer 2 demographics shall be serialized as JSON and stored in `assessments.module1_report_json` linked to the generated `assessment_id`.

---

## 5. Data Requirements

### Tables Read
- **`layer2_demand_economics.db` (SQLite Layer 2 DB):**
  - Table `villages`: `village_lgd_code`, `village_name`, `subdistrict_name`, `district_name`, `population`, `literacy_rate`, `households`, `district_income_band`, `district_ndp_per_capita`, `state_avg_household_spend`, `source`, `confidence`.
- **`business_risk_patterns.csv`:** Static lookup by `business_category` extracting baseline `market_risk`, `seasonal_risk`, `financial_risk`, `operational_risk`, and `regulatory_risk`.

### Tables Written
- **`assessments` Table (`Docs/04_DATA_DICTIONARY_IA.md` Section 2):**
  - Insert row with `user_id`, `village_lgd_code`, `latitude`, `longitude`, `business_category`, `margin_capital`, `business_idea_description`, `module1_report_json`, `created_at`.
- **`llm_usage_log` Table:**
  - Insert log row with `user_id`, `model = 'gemini-2.5-flash'`, `tokens_used`, `created_at`.

---

## 6. API / Integration Requirements
- **Google Maps Geocoding API (`geocoding-backend.googleapis.com`):** Reverse geocode `(lat, lng)` to postal address and administrative components.
- **Google Places Aggregate API (`places.googleapis.com`):** Bounded circle search returning aggregate count of matching place types.
- **Google Places API (New) (`places.googleapis.com`):** Nearby text search returning top 20 POIs with names, coordinates, and types.
- **Vertex AI Generative API (`aiplatform.googleapis.com`):** Calling `gemini-2.5-flash` with service account credentials (`roles/aiplatform.user`). Temperature set to $0.2$ for deterministic, grounded reasoning.
- **Execution Order:**
  ```
  [Intake / Geolocation] 
       ↓
  [Geocoding API -> LGD Code]
       ↓ (Parallel)
  ├── [Places Aggregate API & Places API (New)] (Layer 1)
  └── [SQLite Layer 2 DB Lookup] (Layer 2)
       ↓
  [Vertex AI Gemini 2.5 Flash Grounded Synthesis] (Layer 3)
       ↓
  [Persist to Cloud SQL assessments table]
  ```
- **Fallback Behavior:**
  - If Places Aggregate API fails or is un-provisioned: System falls back immediately to Places API (New) text search count. If both fail or return 0 results, system activates the FR-2.8 population-ratio model.
  - If Vertex AI times out (> 15 seconds): System returns `HTTP 504 Gateway Timeout` with a retry option without clearing user inputs.

---

## 7. Edge Cases & Error States
- **EC-2.1 (Sparse Places API Coverage in Remote Hamlets):** When Places API returns 0 competitors in a rural village, the system shall NOT report "0 competitors — no competition". It shall trigger FR-2.8, display the modeled estimate, and show a disclaimer badge: `⚠️ Modeled Estimate (Rural Sparse Data Zone)`.
- **EC-2.2 (User Denies Geolocation Permission):** System seamlessly switches to the manual Village/Block/District search autocomplete without blocking user progress.
- **EC-2.3 (Post-2011 Unmapped Village):** For newly bifurcated villages where Census 2011 `population` is NULL (`confidence = "no village data"`), the system inherits parent subdistrict census figures and tags `confidence: "subdistrict-inferred"`.
- **EC-2.4 (Flaky 2G/3G Mobile Connection):** Form inputs are preserved in client-side `sessionStorage` until the report generation succeeds. If network drops mid-synthesis, user sees "Network reconnection failed. Tap to retry report generation" with all fields intact.

---

## 8. Acceptance Criteria
- [ ] Submitting the intake form with valid inputs and permitted location coordinates triggers reverse-geocoding and resolves to a valid Tamil Nadu `village_lgd_code`.
- [ ] Top-corner map renders correctly with user pin and 5–10 km circle.
- [ ] Layer 2 SQLite database returns demographic records within $< 50\text{ ms}$ for any valid `village_lgd_code`.
- [ ] Report generation overlay displays all 4 sequential status messages in real time.
- [ ] Generated report contains all 6 required sections: Market Reach, Opportunity Analysis, SWOT Analysis, Threats Identification, Competitor Mapping, and Product Market Value.
- [ ] Boundary verification for sparse rural area: In a test hamlet with 0 Google Places results, the report displays the modeled competitor estimate with explicit `[Source: Modeled Estimate]` label instead of reporting zero competition.
- [ ] Every single demographic, spending, and competitor number in the output JSON contains an explicit `source` or `data_attribution` field.
- [ ] Generated feasibility report payload is successfully written to `assessments.module1_report_json` in Cloud SQL.
- [ ] Vertex AI call logs a new entry in `llm_usage_log`.

---

## 9. Dependencies on Other Modules
- **Depends on PRD-01:** Authenticated user session and JWT context (`user_id`).
- **Feeds into PRD-03:** Module 1 pricing and daily volume estimates feed into the Module 2 Integration Bridge (FOIR affordability and break-even calculations).
- **Feeds into PRD-04:** Complete `module1_report_json` is rendered in the Feasibility and Risk tabs of the Unified Dashboard.

---

## 10. Open Questions / Assumptions
- **Assumption (Places Aggregate API Availability):** `Docs/05_TECH_STACK_CONSTRAINTS.md` Section 5 flags that Places Aggregate API may require allowlisting. If unavailable in the GCP project during deployment, the fallback to Places API (New) text search count + Layer 2 modeled ratio is tested and ready.
- **Assumption (Fixed Radius):** Default inspection buffer is set to 10 km (matching PS specification of 5–10 km radius), with a client-side toggle to switch between 5 km and 10 km.
