// Pure client-side deterministic financial calculator matching Java backend
export function calculateFinanceClientSide(marginCapital, netProfit = 28500) {
  const margin = Number(marginCapital);
  if (isNaN(margin) || margin < 1000) {
    return null;
  }

  const projectCost = margin * 10;
  if (projectCost > 5000000) {
    return {
      isEligible: false,
      advisoryMessage: "Exceeds Term Loan Scheme eligibility (maximum ₹50.00 Lakh project cost). Please consult your State Channelizing Agency for specialized large enterprise schemes.",
      marginCapital: margin,
      projectCost: projectCost,
      loanAmount: 0,
      schemeName: "Out of Scheme",
    };
  }

  const isMicro = projectCost <= 140000;
  const schemeName = isMicro ? "Micro Finance Scheme" : "Term Loan Scheme";
  const schemeType = isMicro ? "MICRO_FINANCE" : "TERM_LOAN";
  const ratePa = isMicro ? 6.5 : 8.0;
  const tenureMonths = isMicro ? 36 : 84;
  const moratoriumMonths = isMicro ? 3 : 6;
  const loanCap = isMicro ? 125000 : 4500000;

  const eligibleLoan = projectCost * 0.90;
  const loanAmount = Math.min(eligibleLoan, loanCap);

  const totalQuarters = tenureMonths / 3;
  const moratoriumQuarters = moratoriumMonths / 3;
  const repaymentQuarters = totalQuarters - moratoriumQuarters;
  const r = ratePa / 4.0 / 100.0;

  // Standard Reducing-Balance Annuity Formula:
  const pow = Math.pow(1 + r, repaymentQuarters);
  const eqiExact = loanAmount * (r * pow) / (pow - 1);
  const quarterlyInstallment = Math.round(eqiExact * 100) / 100;
  const monthlyEquivalentInstallment = Math.round((quarterlyInstallment / 3) * 100) / 100;

  // FOIR & Affordability
  let foirPercentage = 100;
  let foirVerdictCode = "HIGH_FINANCIAL_BURDEN";
  let foirVerdictLabel = "High Financial Burden";
  let foirBadgeColor = "RED";

  if (netProfit > 0) {
    foirPercentage = Math.round((monthlyEquivalentInstallment / netProfit) * 10000) / 100;
    if (foirPercentage <= 35.00) {
      foirVerdictCode = "SAFE";
      foirVerdictLabel = "Safe Affordability";
      foirBadgeColor = "GREEN";
    } else if (foirPercentage <= 50.00) {
      foirVerdictCode = "TIGHT";
      foirVerdictLabel = "Moderate Caution";
      foirBadgeColor = "YELLOW";
    } else {
      foirVerdictCode = "HIGH_FINANCIAL_BURDEN";
      foirVerdictLabel = "High Financial Burden";
      foirBadgeColor = "RED";
    }
  }

  // Generate Amortization Table (Option B: Serviced Interest during Moratorium)
  const schedule = [];
  let balance = loanAmount;

  for (let q = 1; q <= totalQuarters; q++) {
    const opening = balance;
    const interest = Math.round(opening * r * 100) / 100;
    let principal = 0;
    let installment = 0;
    const isMorat = q <= moratoriumQuarters;

    if (isMorat) {
      principal = 0;
      installment = interest;
    } else if (q === totalQuarters) {
      principal = opening;
      installment = Math.round((principal + interest) * 100) / 100;
      balance = 0;
    } else {
      installment = quarterlyInstallment;
      principal = Math.round((installment - interest) * 100) / 100;
      balance = Math.round((opening - principal) * 100) / 100;
    }

    schedule.push({
      quarterNumber: q,
      openingBalance: opening,
      principalPaid: principal,
      interestPaid: interest,
      totalInstallment: installment,
      closingBalance: balance,
      isMoratorium: isMorat,
    });
  }

  // Capital Outlay Split: 75% Capital Expenditure (CAPEX) & 25% Working Capital (OPEX)
  const workingCapitalAllocationPct = 25.0;
  const capexAllocationPct = 75.0;
  const workingCapitalAmount = Math.round(projectCost * 0.25 * 100) / 100;
  const capexAmount = Math.round(projectCost * 0.75 * 100) / 100;

  return {
    isEligible: true,
    marginCapital: margin,
    projectCost: projectCost,
    loanAmount: loanAmount,
    capexAmount: capexAmount,
    workingCapitalAmount: workingCapitalAmount,
    workingCapitalAllocationPct: workingCapitalAllocationPct,
    capexAllocationPct: capexAllocationPct,
    schemeName: schemeName,
    schemeType: schemeType,
    interestRatePa: ratePa,
    tenureMonths: tenureMonths,
    moratoriumMonths: moratoriumMonths,
    totalQuarters: totalQuarters,
    moratoriumQuarters: moratoriumQuarters,
    repaymentQuarters: repaymentQuarters,
    quarterlyInstallment: quarterlyInstallment,
    monthlyEquivalentInstallment: monthlyEquivalentInstallment,
    foirPercentage: foirPercentage,
    foirVerdictCode: foirVerdictCode,
    foirVerdictLabel: foirVerdictLabel,
    foirBadgeColor: foirBadgeColor,
    amortizationSchedule: schedule,
  };
}
