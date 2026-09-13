# Layer 2 — Demand & Economics Data Dictionary

**Project**: SIH PS 26091 — Rural Business Feasibility Tool  
**Scope**: Tamil Nadu (State LGD Code = 33)  
**Database**: SQLite (`Output/layer2_demand_economics.db`), Parquet (`Output/layer2_demand_economics.parquet`), JSON (`Output/layer2_demand_economics.json`)

---

## Schema Overview

| Field | Type | Nullable | Primary Source Dataset | Description & Provenance |
| :--- | :--- | :--- | :--- | :--- |
| `state_lgd_code` | `INTEGER` | No | LGD State Master (`State List.xlsx`) | Canonical State Local Government Directory (LGD) code. Standardized to `33` (Tamil Nadu). |
| `district_lgd_code` | `INTEGER` | No | LGD District Master (`Districts List.xlsx`) | Canonical District LGD code across all 38 Tamil Nadu districts. |
| `subdistrict_lgd_code` | `INTEGER` | No | LGD Village Master (`c967fe8f...csv.xls`) | Canonical Taluk/Subdistrict LGD code. |
| `village_lgd_code` | `INTEGER` | No (PK) | LGD Village Master (`c967fe8f...csv.xls`) | Unique canonical Village LGD code. Serves as the primary key. |
| `village_name` | `TEXT` | No | LGD Village Master (`villageNameEnglish`) | Standardized English name of the revenue village/panchayat. |
| `district_name` | `TEXT` | No | LGD District Master (`districtNameEnglish`) | Standardized English name of the parent district. |
| `subdistrict_name` | `TEXT` | Yes | LGD Village Master (`subdistrictNameEnglish`) | Standardized English name of the parent subdistrict / taluk. |
| `population` | `INTEGER` | Yes | Census 2011 PCA / Census 2011 DCHB | Total resident population of the village. Derived from Census 2011 Primary Census Abstract (PCA) where available, falling back to Census 2011 District Census Hand Book (DCHB) Village/Town releases. `NULL` if post-2011 newly gazetted village. |
| `literacy_rate` | `REAL` | Yes | Census 2011 PCA | Effective literacy percentage (`(Literates / Total Population) * 100`) rounded to 2 decimal places. |
| `households` | `INTEGER` | Yes | Census 2011 PCA / Census 2011 DCHB | Total number of occupied residential households. |
| `district_income_band` | `TEXT` | Yes | TN DES District Income Estimates 2023-24 | Economic tier classification based on district per capita GDP (`High`: $\ge ₹450\text{k}$, `Upper-Middle`: $₹270\text{k} - ₹450\text{k}$, `Middle`: $₹220\text{k} - ₹270\text{k}$, `Low-Middle`: $< ₹220\text{k}$). |
| `district_ndp_per_capita` | `REAL` | Yes | TN DES District Income Estimates 2023-24 | District Net Domestic Product / GDDP Per Capita in Indian Rupees (INR) for 2023-24 (e.g. ₹844,661 for Kanchipuram, ₹325,874 for Erode). |
| `state_avg_household_spend` | `REAL` | Yes | NSSO HCES 2023-24 | Monthly Per Capita Consumption Expenditure (MPCE) benchmark for Rural Tamil Nadu ($₹5,701.00$ / person/month). Uniform state-level baseline. |
| `source` | `OBJECT / JSON` | No | Pipeline Metadata | Structured JSON mapping indicating the exact source dataset for `population`, `income`, and `spend`. |
| `confidence` | `TEXT` | No | Pipeline Logic | Granularity fidelity indicator: `"village-level"` (if demographic data exists at village granularity) or `"no village data"` (if only district/state attributes are inherited). |

---

## Confidence and Granularity Hierarchy

Because economic indicators (DDP, HCES) are not surveyed at the micro-village level by government agencies, data is joined hierarchically:
1. **Demographics (`population`, `households`, `literacy_rate`)**:
   - **Tier 1 (Highest Fidelity)**: Census 2011 PCA (`PCA_CDB_3309_F_Census.xls`) — provides exact literacy count and village demographics.
   - **Tier 2**: Census 2011 DCHB Village Release (`DH_2011_DCHB_Village_Release_3300.xlsx`) — provides village population and households.
   - **Tier 3**: Census 2011 DCHB Town Release (`DH_2011_DCHB_Town_Release_3300.xlsx`) — provides census town demographics.
   - **Tier 4 (Unmatched)**: Set to `NULL`, marked with `confidence = "no village data"`.
2. **Income Proxies (`district_ndp_per_capita`, `district_income_band`)**:
   - Inherited from parent district via 2023-24 DES District Income Estimates across all 38 districts.
3. **Consumption Spend (`state_avg_household_spend`)**:
   - Inherited from state-level NSSO HCES 2023-24 Rural Tamil Nadu benchmark ($₹5,701$).
