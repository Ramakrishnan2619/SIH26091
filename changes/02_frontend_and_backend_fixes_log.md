# VyapaarSathi (SIH 26091) — Audit, Fixes & AI Scheme Engine Log

**Date:** 2026-09-14  
**Scope:** Backend & Frontend Audit, Dynamic Scheme Prompt Engine, Amortization Math, Location Synchronization, and Build Rectification  
**Status:** All Verification Tests Passing (100% Zero-Breakage Verified)

---

## 1. Executive Summary & Document Review

We performed a comprehensive review of all project documentation across `Docs/`:
1. **`Problem statement.txt` (MoSJE Challenge 26091)**:
   - Concessional credit: 10% Margin Money / 90% Loan.
   - **Micro Finance Scheme** (Project cost $\le$ ₹1.40L): 6.5% interest, 3-year tenure (12 quarters), 3-month moratorium (1 quarter), loan cap ₹1.25L.
   - **Term Loan Scheme** (Project cost > ₹1.40L up to ₹50L): 8.0% interest, 7-year tenure (28 quarters), 6-month moratorium (2 quarters), loan cap ₹45L.
   - 6-Point Hyper-Local Feasibility Report & Reducing-Balance Equal Quarterly Installment (EQI) amortization.
2. **`PRD-01` to `PRD-06`**:
   - `PRD-06-search-for-schemes.md`: 3 progressive questionnaire steps, tri-bucket categorization (`loan_type_specific`, `business_linked`, `bank_specific`), Vertex AI Gemini 2.5 Flash grounded prompt, mandatory illustrative disclaimer on all cards, and dual-mode fallback resilience.
3. **`Workflow_Module_1&2.txt`**:
   - Serviced moratorium interest policy (Option B): Moratorium quarters service accrued interest without capitalizing to principal, followed by Equal Quarterly Installments converging to ₹0.00.

---

## 2. Dynamic Scheme Search Prompt & Engine (`SchemeSearchService.java`)

### A. The Core Problem
Previously, scheme retrieval was limited to static Java `if-else` blocks synthesizing 4 archetypes. In real-world India, Central and State government schemes (NSFDC, NBCFDC, NSTFDC, NSKFDC, NHFDC, Stand-Up India, PMEGP, Mudra, TAHDCO, etc.) undergo yearly revisions to interest subventions, subsidy caps, and eligibility rules.

### B. The AI Architecture Implemented
1. **Contextual Grounding Injected into Gemini Prompt**:
   - **Demographic Profile**: Social Category (SC, ST, OBC, Safai Karamchari, PwD, General), Gender, Age, Disability, Ex-Servicemen, Income Band.
   - **Geographic Context**: State, District, Subdistrict/Village, Urban vs. Rural.
   - **Enterprise & Financials**: Business Category (e.g. Dairy, Retail Kirana, Tailoring, Handloom), Margin Capital (10%), Estimated Project Cost (100%), Loan Requirement (90%).
   - **Household Context**: Existing business status, prior government subsidies availed (None, Mudra, PMEGP), ownership choice.
2. **Tri-Bucket Classification Enforced**:
   - `loan_type_specific`: Apex Corporation social category/gender concessional credit (e.g. NSFDC Mahila Samriddhi for SC Women, NBCFDC New Swarnima for OBC Women, Stand-Up India).
   - `business_linked`: Sector-specific credit (Dairy Cooperative & AHIDF, Mudra Shishu/Kishore, PM SVANidhi).
   - `bank_specific`: State Channelizing Agency (SCA like TAHDCO) or bank credit guarantee tie-up.
3. **Strict JSON Schema & Zero-Breakage Contract**:
   Matches `RecommendedSchemeDto` and `SchemeSearchResponse`:
   ```json
   {
     "household_strategy_insight": "string",
     "recommended_schemes": [
       {
         "scheme_id": "STRING_UPPERCASE_SLUG",
         "scheme_name": "Full Name (Illustrative)",
         "category": "loan_type_specific | business_linked | bank_specific",
         "target_beneficiary_match": "string",
         "illustrative_benefit": "string",
         "indicative_interest_rate": "string",
         "participating_institutions": "string",
         "is_illustrative": true,
         "mandatory_disclosure": "AI-generated illustrative match — verify with your nearest SCA/bank before applying"
       }
     ]
   }
   ```
4. **Dual-Mode Fallback Resilience**:
   - If Vertex AI / Gemini API succeeds: Returns dynamic live-matched schemes.
   - If offline / credentials unavailable: Gracefully falls back to the deterministic archetype catalog.
   - Verified via `SchemeSearchVerification.java`: **ALL 5 PRD-06 TESTS PASSED!**

---

## 3. Financial & Feasibility Upgrades Completed

1. **Amortization & CAPEX/OPEX Breakdown (`TabFinancial.jsx` & `financialMath.js`)**:
   - Replaced monthly tenure with statutory **Quarterly Schedule** (`28 Quarters` / `12 Quarters`).
   - Added explicit **CAPEX (75%) vs OPEX (25%)** asset allocation cards.
   - Interactive Quarterly Amortization Table displaying opening balance, quarterly interest, principal paid, EQI, and closing balance converging to ₹0.00.
2. **Dynamic Location & Catchment Scaling (`TabFeasibility.jsx`)**:
   - Dynamic urban vs. rural detection (`isUrban` auto-scales radius: 1.5 km for urban Kolathur vs. 10 km for rural Gram Panchayats).
   - Interactive toggle between **[ 🛒 Competitor Shops ]** and **[ 🚚 Wholesale Suppliers & Mandis ]**.
   - Added `selectedLang` and `getTranslation` support for seamless Tamil, Hindi, Telugu switching.
3. **Backend Location DTOs & Java 17 Compatibility**:
   - Added `stateName` to `VillageContextDto` in `FeasibilityReportResponse.java`.
   - Updated `VertexAiFeasibilityService.java` to use `BigDecimal` for `districtNdpPerCapita`.
   - Updated `pom.xml` to `<java.version>17</java.version>` matching local Temurin JDK 17.

---

## 4. Test Verification Summary

- **Maven Test-Compile**: `BUILD SUCCESS` (0 compilation errors across all 73 classes).
- **PRD-06 Verification Test (`SchemeSearchVerification.java`)**:
  - `TEST 1`: Static archetype catalog loading $\rightarrow$ **PASSED** (10 archetypes).
  - `TEST 2`: Progressive scheme search for Meena Devi (SC Female) $\rightarrow$ **PASSED** (Session #801).
  - `TEST 3`: Mandatory non-removable disclaimers $\rightarrow$ **PASSED** (all cards verified).
  - `TEST 4`: Household strategy optimization insight $\rightarrow$ **PASSED** (gender/caste advantage advice).
  - `TEST 5`: Tri-bucket visual categorization $\rightarrow$ **PASSED** (`loan_type_specific`, `business_linked`, `bank_specific`).
