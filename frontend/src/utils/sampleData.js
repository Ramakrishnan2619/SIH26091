// Canonical worked example data for Melavalavu, Madurai
export const CANONICAL_REPORT = {
  assessment_id: 101,
  dashboard_kpis: {
    assessment_id: 101,
    village_name: "Melavalavu",
    subdistrict_name: "Melur",
    district_name: "Madurai",
    enterprise_type: "Grocery & Daily Provisions Store",
    project_cost: 1000000.0,
    margin_money: 100000.0,
    loan_amount: 900000.0,
    scheme_name: "Term Loan Scheme",
    foir_badge: "GREEN",
    foir_verdict: "SAFE",
    composite_readiness_score: 78.5,
    generated_at: new Date().toISOString()
  },
  module1_feasibility: {
    village_context: {
      villageLgdCode: "639842",
      villageName: "Melavalavu",
      subdistrictName: "Melur",
      districtName: "Madurai",
      population: 5420,
      households: 1340,
      literacyRate: 74.2,
      districtIncomeBand: "Upper-Middle",
      districtNdpPerCapita: 284500.0,
      confidence: "village-level"
    },
    marketReach: {
      catchmentRadiusKm: 3.5,
      estimatedCustomerBase: 5420,
      spendingCapacityBand: "MODERATE",
      summary: "Primary consumer catchment covers 1,340 households across Melavalavu and adjoining agricultural hamlets. Daily staples and fast-moving grocery items demonstrate steady non-cyclical velocity. [LAYER_2_DB]"
    },
    opportunityAnalysis: {
      gapIdentified: "Absence of organized multi-category kirana offering packaged staples, dairy cold storage, and digital UPI acceptance within 2 km.",
      growthPotentialScore: 82,
      recommendedProducts: [
        "Packaged pulses and edible oils (1kg/5kg consumer packs)",
        "Daily dairy products and chilled beverages",
        "Personal care toiletries and detergent refills",
        "Agricultural small consumables and mobile recharge"
      ],
      summary: "High unmet local retail expenditure leaking to Melur town center (12 km away). Retaining this spend locally offers strong first-year profitability. [LAYER_2_DB]"
    },
    swotAnalysis: {
      strengths: [
        "Prime location along Melur-Tirupathur main road",
        "Zero debt burden and 10% owned equity ready",
        "Strong existing community rapport and local residency"
      ],
      weaknesses: [
        "Limited initial cold chain storage infrastructure",
        "Dependency on distributor credit for working capital"
      ],
      opportunities: [
        "Direct bulk wholesale procurement from Madurai mandi",
        "Exclusive delivery services for elderly village residents",
        "MoSJE 8.0% concessional credit with 6-month moratorium"
      ],
      threats: [
        "Unseasonal heavy monsoon disrupting footfall",
        "Wholesale price spikes in edible oils and dry chili"
      ]
    },
    threatsIdentification: {
      overallRiskLevel: "LOW_TO_MODERATE",
      criticalVulnerabilities: [
        "Working capital strain during July-August agricultural lean season",
        "Power fluctuations requiring inverter backup for refrigeration"
      ],
      mitigationRoadmap: "Deploy ₹45,000 from initial capital into a 1kVA hybrid inverter setup. Keep 15% liquid buffer for bulk procurement discounts."
    },
    competitorMapping: {
      localDensityScore: "SPARSE",
      directCompetitorsCount: 1,
      nearestCompetitorDistanceKm: 1.8,
      dataSource: "areainsights.googleapis.com (live area insights)",
      summary: "Only 1 traditional micro-pan shop exists within 1.5 km radius. No organized retail supermarket or multi-brand provision store detected within 3.5 km catchment. [PLACES_INSIGHTS]"
    },
    productMarketValue: {
      estimatedMonthlyRevenue: 145000.0,
      operatingMarginPercentage: 19.6,
      estimatedNetProfitMonthly: 28500.0,
      projectCost: 1000000.0,
      recommendedLoanAmount: 900000.0,
      summary: "Baseline operations project ₹1,45,000 gross monthly turnover yielding ₹28,500 net surplus after rent, electricity, and distributor settlements. [LAYER_2_DB]"
    }
  },
  module2_financial: {
    financial_summary: {
      project_cost: 1000000.0,
      margin_money_amount: 100000.0,
      margin_money_percentage: 10.0,
      eligible_loan_amount: 900000.0,
      scheme_name: "Term Loan Scheme",
      scheme_type: "TERM_LOAN",
      interest_rate_pa: 8.0,
      tenure_months: 84,
      moratorium_months: 6,
      quarterly_installment_eqi: 44729.31,
      monthly_equivalent_installment: 14909.77,
      total_quarters: 28,
      moratorium_quarters: 2,
      repayment_quarters: 26,
      total_repayment_amount: 1198962.06,
      total_interest_payable: 298962.06
    },
    affordability: {
      estimated_net_profit_monthly: 28500.0,
      foir_percentage: 52.31,
      foir_verdict: "HIGH_FINANCIAL_BURDEN",
      verdict_badge: "RED",
      affordability_notes: "At ₹10 Lakh project cost, monthly debt service is ₹14,909.77 against ₹28,500 baseline net profit (52.3% FOIR). Adjust margin or initial project cost to achieve SAFE (<35%) status."
    }
  }
};
