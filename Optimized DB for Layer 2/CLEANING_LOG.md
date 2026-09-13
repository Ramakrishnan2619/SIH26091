# Layer 2 — Data Cleaning & Provenance Log

**Project**: SIH PS 26091 — Rural Business Feasibility Tool  
**Scope**: Tamil Nadu (State LGD Code = 33)  
**Execution Timestamp**: 2026-09-11

---

## 1. Encoding Analysis & Text Normalization

### Diagnostic Findings
- **UTF-8 / Mojibake Scan**: All 11 files in `/Static Data` were scanned for byte-level corruption (e.g., UTF-8 misinterpreted as Latin-1/Windows-1252 producing `à®`, `à¤`, `Ã`).
- **Fixes Applied via `ftfy`**:
  - `Districts List.xlsx` and `State List.xlsx`: Fixed 17 occurrences of minor Unicode combining character order issues in non-English script names (e.g., Hindi/Odia ligature sequences like `छत्तीसगढ़` $\rightarrow$ `छत्तीसगढ़`, `ଓଡ଼ିଶା` $\rightarrow$ `ଓଡ଼ିଶା`).
  - `c967fe8f...csv.xls`: Fixed 5 Unicode combining sequences in `villageNameLocal` (e.g., `திருப்போரூர்` $\rightarrow$ `திருப்போரூர்`, `கொட்டப்பட்டு` $\rightarrow$ `கொட்டப்பட்டு`).
  - Removed persistent trailing whitespace padding from government fixed-width exports (e.g., `"TAMIL NADU                                        "` $\rightarrow$ `"TAMIL NADU"`).
- **Column Drop Policy**:
  - Administrative UI columns with no semantic value were dropped from raw exports: `['View Details', 'View History', 'View Government Order', 'View Map', 'Hierarchy', 'Short Name of District', 'Pesa Status']`.
  - Raw local-language columns with $>90\%$ missing values (`villageNameLocal` is 91.8% null in source) are retained only in intermediate stages; the canonical runtime schema prioritizes clean, standardized English identifiers (`village_name`, `district_name`, `subdistrict_name`).

---

## 2. Canonical Join Key & Master Hierarchy

### Primary Join Key: LGD Hierarchy
- **Master Hierarchy**: `state_lgd_code (33)` $\rightarrow$ `district_lgd_code` $\rightarrow$ `subdistrict_lgd_code` $\rightarrow$ `village_lgd_code`.
- **Master Source**: `c967fe8f-69c4-42df-8afc-8a2c98057437_cdc34133db392ae6813ea73c19d76b74.csv.xls` (Category c).
- **Filter**: `stateCode == 33` strictly enforced.

### Deduplication Strategy
- **Raw TN Rows**: 18,893 records.
- **Unique Village LGD Codes**: 18,728 records.
- **Root Cause of Duplicates (165 records)**: When taluks/districts were reorganized in Tamil Nadu (e.g., Chengalpattu bifurcated from Kanchipuram, Tirupathur/Ranipet from Vellore), the national data portal retains both historical and updated hierarchy records.
- **Resolution**: Deduplicated by sorting descending by `data_gov_update_date` (`pd.to_datetime(..., format='%d-%m-%Y')`), keeping only the newest administrative mapping for each unique `villageCode`. Result: exactly 18,728 unique village rows.

---

## 3. Census 2011 Code Bridge & Join Methodology

### Census Translation
- Rather than fuzzy string matching, join was performed using the official Census 2011 code translation bridge embedded in the LGD village master (`villageCensus2011Code`):
  1. **Census DCHB Village Directory (`DH_2011_DCHB_Village_Release_3300.xlsx`)**:
     - Joined on `villageCensus2011Code == Village Code`.
     - Matched: 15,969 villages ($99.94\%$ of all DCHB villages).
  2. **Census DCHB Town Directory (`DH_2011_DCHB_Town_Release_3300.xlsx`)**:
     - Joined on `villageCensus2011Code == Town Code`.
     - Matched: 363 census towns / urban agglomerations.
  3. **Census 2011 PCA (`PCA_CDB_3309_F_Census.xls`)**:
     - Joined on `villageCensus2011Code == Town/Village_Code`.
     - Matched: 306 villages in Erode district ($100\%$ of PCA records).
  4. **Post-2011 / Newly Formed Villages (2,396 records)**:
     - Villages with `villageCensus2011Code == 0` or unmapped post-2011 entities are preserved in the master table with `population = NULL`, `households = NULL`, `literacy_rate = NULL`, and `confidence = "no village data"`.

---

## 4. District Domestic Product (DDP) Join

- **Source File**: `District Domestic Product (income proxy), TN.xlsx` (DES 2023-24 estimates).
- **District Match Rate**: $38 / 38$ Tamil Nadu districts ($100\%$).
- **Transliteration Normalization**:
  - `Kancheepuram` $\leftrightarrow$ `Kanchipuram`
  - `Viluppuram` $\leftrightarrow$ `Villupuram`
  - `Tiruchirappalli` $\leftrightarrow$ `Tiruchirapalli`
  - `Thoothukkudi` $\leftrightarrow$ `Thoothukudi`
  - `Sivagangai` $\leftrightarrow$ `Sivaganga`
  - `Kanniyakumari` $\leftrightarrow$ `Kanniyakumari / Kanyakumari`
- **Income Band Logic**:
  - `High`: $\ge ₹450,000$ (7 districts)
  - `Upper-Middle`: $₹270,000 - ₹450,000$ (11 districts)
  - `Middle`: $₹220,000 - ₹270,000$ (10 districts)
  - `Low-Middle`: $< ₹220,000$ (10 districts)

---

## 5. Consumption Expenditure (HCES)

- **Source File**: `HCES.xlsx` (NSSO 2023-24).
- **Selected Baseline**: Rural Tamil Nadu Monthly Per Capita Consumption Expenditure (MPCE) without imputation = **$₹5,701.00$**.
- Applied uniformly across all Tamil Nadu village records with explicit attribution in `source.spend`.
