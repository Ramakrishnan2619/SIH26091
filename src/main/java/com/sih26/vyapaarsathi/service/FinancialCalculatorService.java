package com.sih26.vyapaarsathi.service;

import com.sih26.vyapaarsathi.dto.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Slf4j
@Service
public class FinancialCalculatorService {

    public static final BigDecimal MICRO_FINANCE_MAX_PROJECT_COST = new BigDecimal("140000.00");
    public static final BigDecimal MICRO_FINANCE_MAX_LOAN_CAP = new BigDecimal("125000.00");
    public static final double MICRO_FINANCE_RATE_PA = 6.5;
    public static final int MICRO_FINANCE_TENURE_MONTHS = 36;
    public static final int MICRO_FINANCE_MORATORIUM_MONTHS = 3;

    public static final BigDecimal TERM_LOAN_MAX_PROJECT_COST = new BigDecimal("5000000.00");
    public static final BigDecimal TERM_LOAN_MAX_LOAN_CAP = new BigDecimal("4500000.00");
    public static final double TERM_LOAN_RATE_PA = 8.0;
    public static final int TERM_LOAN_TENURE_MONTHS = 84;
    public static final int TERM_LOAN_MORATORIUM_MONTHS = 6;

    public CanonicalModule2Result calculate(FinanceCalculateRequest request) {
        BigDecimal marginCapital = request.getMarginCapital();

        // 1. Feasible Project Cost = margin_capital / 0.10
        BigDecimal projectCost = marginCapital.divide(new BigDecimal("0.10"), 2, RoundingMode.HALF_UP);

        // 2. Check Exceeded Scope State (> ₹50.00 Lakh)
        if (projectCost.compareTo(TERM_LOAN_MAX_PROJECT_COST) > 0) {
            return CanonicalModule2Result.builder()
                    .isEligible(false)
                    .advisoryMessage("Exceeds Term Loan Scheme eligibility (maximum ₹50.00 Lakh project cost). Please consult your State Channelizing Agency for specialized large enterprise schemes.")
                    .marginCapital(marginCapital)
                    .projectCost(projectCost)
                    .loanAmount(BigDecimal.ZERO)
                    .build();
        }

        // 3. Scheme Auto-Selection
        boolean isMicro = projectCost.compareTo(MICRO_FINANCE_MAX_PROJECT_COST) <= 0;
        String schemeName = isMicro ? "Micro Finance Scheme" : "Term Loan Scheme";
        String schemeType = isMicro ? "MICRO_FINANCE" : "TERM_LOAN";
        double ratePa = isMicro ? MICRO_FINANCE_RATE_PA : TERM_LOAN_RATE_PA;
        int tenureMonths = isMicro ? MICRO_FINANCE_TENURE_MONTHS : TERM_LOAN_TENURE_MONTHS;
        int moratoriumMonths = isMicro ? MICRO_FINANCE_MORATORIUM_MONTHS : TERM_LOAN_MORATORIUM_MONTHS;
        BigDecimal loanCap = isMicro ? MICRO_FINANCE_MAX_LOAN_CAP : TERM_LOAN_MAX_LOAN_CAP;

        // 4. Loan Amount = min(0.90 * project_cost, loan_cap)
        BigDecimal eligibleLoan = projectCost.multiply(new BigDecimal("0.90")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal loanAmount = eligibleLoan.min(loanCap);

        // 5. Working Capital vs CapEx Allocation
        double wcPct = resolveWorkingCapitalPct(request.getBusinessCategory());
        BigDecimal workingCapitalAmount = projectCost.multiply(BigDecimal.valueOf(wcPct / 100.0)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal capexAmount = projectCost.subtract(workingCapitalAmount).setScale(2, RoundingMode.HALF_UP);

        // 6. Quarterly Amortization Schedule Generation
        int totalQuarters = tenureMonths / 3;
        int moratoriumQuarters = moratoriumMonths / 3;
        int repaymentQuarters = totalQuarters - moratoriumQuarters;

        List<QuarterRecordDto> schedule = generateAmortizationSchedule(loanAmount, ratePa, tenureMonths, moratoriumMonths);
        BigDecimal quarterlyInstallment = schedule.stream()
                .filter(r -> !r.isMoratorium())
                .findFirst()
                .map(QuarterRecordDto::getTotalInstallment)
                .orElse(BigDecimal.ZERO);

        BigDecimal monthlyEquivalentInstallment = quarterlyInstallment.divide(new BigDecimal("3"), 2, RoundingMode.HALF_UP);

        // 7. Dynamic Eligibility Matrix
        String corporation = resolveCorporation(request.getSocialCategory());
        List<String> flags = resolveConcessionalFlags(request);

        // 8. Affordability & FOIR Calculation (Integration Bridge with M1)
        BigDecimal monthlyNetRevenue = resolveMonthlyNetRevenue(request.getModule1Metrics(), projectCost);
        double foirPct;
        String foirCode;
        String foirLabel;
        String foirColor;

        if (monthlyNetRevenue.compareTo(BigDecimal.ZERO) <= 0) {
            foirPct = 100.0;
            foirCode = "HIGH_FINANCIAL_BURDEN";
            foirLabel = "High Financial Burden";
            foirColor = "RED";
        } else {
            foirPct = monthlyEquivalentInstallment
                    .multiply(new BigDecimal("100"))
                    .divide(monthlyNetRevenue, 2, RoundingMode.HALF_UP)
                    .doubleValue();

            if (foirPct <= 35.00) {
                foirCode = "SAFE";
                foirLabel = "Safe Affordability";
                foirColor = "GREEN";
            } else if (foirPct <= 50.00) {
                foirCode = "TIGHT";
                foirLabel = "Moderate Caution";
                foirColor = "YELLOW";
            } else {
                foirCode = "HIGH_FINANCIAL_BURDEN";
                foirLabel = "High Financial Burden";
                foirColor = "RED";
            }
        }

        // 9. Break-Even Units
        Integer breakEvenUnits = calculateBreakEvenUnits(request.getModule1Metrics(), monthlyEquivalentInstallment);

        // 10. Stress-Test Scenario (30% revenue drop)
        BigDecimal stressedRevenue = monthlyNetRevenue.multiply(new BigDecimal("0.70")).setScale(2, RoundingMode.HALF_UP);
        double stressedFoirPct = stressedRevenue.compareTo(BigDecimal.ZERO) > 0
                ? monthlyEquivalentInstallment.multiply(new BigDecimal("100")).divide(stressedRevenue, 2, RoundingMode.HALF_UP).doubleValue()
                : 100.0;
        String resilienceRating = stressedFoirPct <= 50.00 ? "Resilient" : "Vulnerable";
        String resilienceRec = "Resilient".equals(resilienceRating)
                ? "Business comfortably survives 30% seasonal revenue dips without debt distress."
                : "Maintain a minimum 3-month operating cash buffer (₹" + monthlyEquivalentInstallment.multiply(new BigDecimal("3")) + ") before loan drawdown.";

        CanonicalModule2Result.StressTestResult stressTest = CanonicalModule2Result.StressTestResult.builder()
                .stressedMonthlyRevenue(stressedRevenue)
                .stressedFoirPercentage(stressedFoirPct)
                .resilienceRating(resilienceRating)
                .resilienceRecommendation(resilienceRec)
                .build();

        return CanonicalModule2Result.builder()
                .isEligible(true)
                .advisoryMessage(null)
                .marginCapital(marginCapital)
                .projectCost(projectCost)
                .loanAmount(loanAmount)
                .schemeName(schemeName)
                .schemeType(schemeType)
                .interestRatePa(ratePa)
                .tenureMonths(tenureMonths)
                .moratoriumMonths(moratoriumMonths)
                .totalQuarters(totalQuarters)
                .moratoriumQuarters(moratoriumQuarters)
                .repaymentQuarters(repaymentQuarters)
                .quarterlyInstallment(quarterlyInstallment)
                .monthlyEquivalentInstallment(monthlyEquivalentInstallment)
                .workingCapitalAllocationPct(wcPct)
                .workingCapitalAmount(workingCapitalAmount)
                .capexAmount(capexAmount)
                .foirPercentage(foirPct)
                .foirVerdictCode(foirCode)
                .foirVerdictLabel(foirLabel)
                .foirBadgeColor(foirColor)
                .breakEvenUnitsPerMonth(breakEvenUnits)
                .applicableCorporation(corporation)
                .specialFlags(flags)
                .stressTest(stressTest)
                .amortizationSchedule(schedule)
                .build();
    }

    public List<QuarterRecordDto> generateAmortizationSchedule(BigDecimal loanAmount, double ratePa, int tenureMonths, int moratoriumMonths) {
        int totalQuarters = tenureMonths / 3;
        int moratoriumQuarters = moratoriumMonths / 3;
        int repaymentQuarters = totalQuarters - moratoriumQuarters;
        double r = ratePa / 4.0 / 100.0; // quarterly rate

        // EQI Annuity Formula: P * [ r * (1+r)^n ] / [ (1+r)^n - 1 ]
        double p = loanAmount.doubleValue();
        double pow = Math.pow(1.0 + r, repaymentQuarters);
        double eqiExact = p * (r * pow) / (pow - 1.0);
        BigDecimal eqiRounded = BigDecimal.valueOf(eqiExact).setScale(2, RoundingMode.HALF_UP);

        List<QuarterRecordDto> schedule = new ArrayList<>();
        BigDecimal balance = loanAmount.setScale(2, RoundingMode.HALF_UP);

        for (int q = 1; q <= totalQuarters; q++) {
            BigDecimal opening = balance;
            BigDecimal interest = opening.multiply(BigDecimal.valueOf(r)).setScale(2, RoundingMode.HALF_UP);
            BigDecimal principal;
            BigDecimal installment;
            boolean isMorat = q <= moratoriumQuarters;

            if (isMorat) {
                principal = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
                installment = interest;
                // balance remains unchanged
            } else if (q == totalQuarters) {
                // Final quarter: absorb rounding difference to close exactly to 0.00
                principal = opening;
                installment = principal.add(interest);
                balance = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
            } else {
                installment = eqiRounded;
                principal = installment.subtract(interest);
                balance = opening.subtract(principal).setScale(2, RoundingMode.HALF_UP);
            }

            schedule.add(QuarterRecordDto.builder()
                    .quarterNumber(q)
                    .openingBalance(opening)
                    .principalPaid(principal)
                    .interestPaid(interest)
                    .totalInstallment(installment)
                    .closingBalance(balance)
                    .isMoratorium(isMorat)
                    .build());
        }

        return schedule;
    }

    private double resolveWorkingCapitalPct(String category) {
        if (category == null) return 25.0;
        String cat = category.toLowerCase(Locale.ROOT);
        if (cat.contains("dairy") || cat.contains("agri")) return 25.0;
        if (cat.contains("food") || cat.contains("tea") || cat.contains("tiffin")) return 30.0;
        if (cat.contains("retail") || cat.contains("kirana")) return 35.0;
        if (cat.contains("textile") || cat.contains("tailor")) return 20.0;
        if (cat.contains("handicraft")) return 25.0;
        if (cat.contains("repair")) return 15.0;
        if (cat.contains("beauty") || cat.contains("salon")) return 15.0;
        if (cat.contains("transport")) return 10.0;
        if (cat.contains("manufacturing")) return 25.0;
        return 25.0;
    }

    private String resolveCorporation(String socialCategory) {
        if (socialCategory == null) return "State Channelizing Agency (SCA) / District Cooperative Bank";
        return switch (socialCategory.trim().toUpperCase(Locale.ROOT)) {
            case "SC" -> "National Scheduled Castes Finance and Development Corporation (NSFDC)";
            case "SAFAI KARAMCHARI" -> "National Safai Karamcharis Finance and Development Corporation (NSKFDC)";
            case "OBC" -> "National Backward Classes Finance & Development Corporation (NBCFDC)";
            case "ST" -> "National Scheduled Tribes Finance and Development Corporation (NSTFDC)";
            default -> "State Channelizing Agency (SCA) / District Cooperative Bank";
        };
    }

    private List<String> resolveConcessionalFlags(FinanceCalculateRequest request) {
        List<String> flags = new ArrayList<>();
        if ("Female".equalsIgnoreCase(request.getGender())) {
            flags.add("Eligible for Mahila Samriddhi Yojana (special interest concession / women SHG priority)");
        }
        if (Boolean.TRUE.equals(request.getDisabilityStatus())) {
            flags.add("Eligible for NHFDC special concessional credit tier");
        }
        if (Boolean.TRUE.equals(request.getExServicemenStatus())) {
            flags.add("Eligible for SEMFEX / Directorate General Resettlement scheme linkages");
        }
        return flags;
    }

    private BigDecimal resolveMonthlyNetRevenue(Module1MetricsDto m1, BigDecimal projectCost) {
        if (m1 != null && m1.getEstimatedMonthlyNetProfit() != null && m1.getEstimatedMonthlyNetProfit().compareTo(BigDecimal.ZERO) > 0) {
            return m1.getEstimatedMonthlyNetProfit();
        }
        // Default estimate: 22% net profit margin on estimated monthly turnover
        BigDecimal estimatedMonthlyTurnover = projectCost.multiply(new BigDecimal("0.15")).setScale(2, RoundingMode.HALF_UP);
        return estimatedMonthlyTurnover.multiply(new BigDecimal("0.22")).setScale(2, RoundingMode.HALF_UP);
    }

    private Integer calculateBreakEvenUnits(Module1MetricsDto m1, BigDecimal monthlyDebt) {
        if (m1 != null && m1.getUnitSellingPrice() != null && m1.getUnitVariableCost() != null) {
            BigDecimal price = m1.getUnitSellingPrice();
            BigDecimal varCost = m1.getUnitVariableCost();
            BigDecimal fixedCost = m1.getMonthlyFixedCosts() != null ? m1.getMonthlyFixedCosts() : new BigDecimal("5000.00");

            BigDecimal contribution = price.subtract(varCost);
            if (contribution.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal totalFixedBurden = fixedCost.add(monthlyDebt);
                return (int) Math.ceil(totalFixedBurden.divide(contribution, 4, RoundingMode.HALF_UP).doubleValue());
            }
        }
        // Default break-even projection
        return 1190;
    }
}
