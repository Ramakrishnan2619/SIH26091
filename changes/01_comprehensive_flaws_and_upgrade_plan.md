# 🛠️ VyapaarSathi: Flaw Audit & Master Upgrade Plan
**Directory:** `changes/`  
**Document:** `01_comprehensive_flaws_and_upgrade_plan.md`  
**Target:** SIH 26091 (MoSJE / Government of India)

---

## 🎯 Executive Summary & Guiding Constraints

1. **Zero Architecture Breakage:** We do NOT alter existing Spring Boot package names (`com.sih26.vyapaarsathi`), controller endpoints (`/api/assess`, `/api/finance`, `/api/schemes`, `/api/chat`, `/api/user`), or database schemas.
2. **Deterministic Data Grounding:** Financial math, quarterly amortization, and scheme routing remain 100% deterministic (no LLM hallucination of loan rules).
3. **Hyper-Local Realism:** Eliminates hardcoded fallbacks (e.g. Kallakkurichi) and adapts catchment radii dynamically (1–2 km for urban wards like Kolathur vs. 5–10 km for rural Gram Panchayats).

---

## 🚨 Detailed Audit of Identified Flaws & Concrete Fixes

### 1. 📍 Flaw 1: State Management & Location Desynchronization
*   **The Problem:** When an urban location like Kolathur (Chennai) is selected, the report header still displays "Village: Kallakkurichi, Pudukkottai" with a static population of 238.
*   **Root Cause:** Frontend state in `AssessmentForm.jsx` and `TabFeasibility.jsx` relied on default fallback values when LGD lookup was empty or not matched to an urban municipality.
*   **The Fix:**
    1. Update `AssessmentForm.jsx` to pass the exact selected location (`villageName`, `districtName`, `stateName`, `lat`, `lng`, `isUrbanFlag`) directly into `module1Report.village_context` and `dashboardKpis`.
    2. Update `TabFeasibility.jsx` to prioritize user-selected coordinates and dynamically display Urban Ward vs. Gram Panchayat badge.

---

### 2. 💰 Flaw 2: Financial Logic — Quarterly Schedule & CAPEX/OPEX Split
*   **The Problem:** The summary displays "84 Months" (flat monthly model) instead of the mandatory **Quarterly Amortization Schedule (28 quarters / 11 quarters)** required by MoSJE/SCA guidelines, and lacks a CAPEX vs OPEX breakdown.
*   **Root Cause:** UI labels in `TabFinancial.jsx` displayed tenure in months and omitted the `capex_amount` (75%) vs `working_capital_amount` (25%) fields already defined in the Master API Contract.
*   **The Fix:**
    1. Update `TabFinancial.jsx` to explicitly display:
       - **Quarterly Repayment Structure:** 12 Quarters (Micro Finance, 1Q Moratorium + 11Q Repayment) or 28 Quarters (Term Loan, 2Q Moratorium + 26Q Repayment).
       - **Capital Outlay Breakdown Card:**
         - 🏗️ **CAPEX (Capital Expenditure - 75%):** Machinery, tools, shop fixtures.
         - 📦 **OPEX / Working Capital (25%):** Raw materials, initial inventory, operational float.
    2. Ensure full quarterly amortization table displays `Quarter 1` to `Quarter 28` with closing balance converging to **₹0.00**.

---

### 3. 🌐 Flaw 3: Rural Accessibility & Full Multilingual Localization
*   **The Problem:** Language switcher in navbar only translates top navigation buttons; report dossier headers and financial metrics remain in English.
*   **Root Cause:** Component text in `TabFeasibility.jsx`, `TabFinancial.jsx`, and `TabRisk.jsx` used hardcoded English strings instead of `getTranslation(selectedLang)`.
*   **The Fix:**
    1. Expand `frontend/src/utils/translations.js` to include complete Hindi (हिन्दी), Tamil (தமிழ்), and Telugu (తెలుగు) dictionaries for:
       - Financial terms (Margin, Loan, Interest, Quarterly EQI, Moratorium).
       - 6-Point SWOT and Feasibility headers.
       - Risk Matrix dimensions (Market, Seasonal, Operational, Regulatory).
    2. Connect `selectedLang` prop dynamically across all dashboard tabs.

---

### 4. 🗺️ Flaw 4: Dynamic Catchment Radius, Threat Weighting & Supplier Mapping
*   **The Problem:** Fixed 10km radius in dense urban areas like Kolathur lists only 6 shops and lacks threat classification or supplier sourcing.
*   **Root Cause:** Map radius was hardcoded to 10 km regardless of urban/rural density, and shop pins were unweighted.
*   **The Fix:**
    1. **Dynamic Catchment Scaling:**
       - Urban / High Density (e.g. Kolathur): **1.5 km Walkability Catchment**.
       - Rural / Gram Panchayat (e.g. Sampla): **5–10 km Regional Cluster**.
    2. **Competitor Threat Weighting:** Categorize competitors into:
       - 🏪 *Micro/Kirana Competitor* (Low Threat)
       - 🏬 *Large Supermarket / D-Mart / Wholesale* (High Threat)
    3. **Wholesale Supplier / Mandi Layer:** Add a toggle in `TabFeasibility.jsx` to switch between *"Competitor Shops"* and *"Raw Material Suppliers / Mandis"*.
    4. **Bank-Ready DPR PDF Generator:** Connect the "Download Report" CTA to export a structured Detailed Project Report (DPR) matching NSFDC/NBCFDC sanction templates.

---

## 📋 Execution Checklist for `changes/`

- [ ] **Step 1: Financial Tab Upgrade (`TabFinancial.jsx` + `financialMath.js`)**
  - Add Quarterly Amortization display (12Q / 28Q).
  - Add CAPEX (75%) vs OPEX (25%) breakdown cards.
  - Fix ₹0.00 terminal balance display.
- [ ] **Step 2: Feasibility & Map Upgrade (`TabFeasibility.jsx` + `GoogleMapView.jsx`)**
  - Synchronize dynamic location header with exact user coordinates.
  - Implement dynamic radius (1.5km urban vs 10km rural).
  - Add Supplier / Mandi toggle to the map view.
- [ ] **Step 3: Multilingual Dictionary Expansion (`translations.js`)**
  - Add complete Hindi, Tamil, Telugu translations for all 4 dashboard tabs.
- [ ] **Step 4: Bank-Ready DPR PDF Export (`exportDpr.js`)**
  - Client-side printable PDF generation matching MoSJE loan guidelines.
