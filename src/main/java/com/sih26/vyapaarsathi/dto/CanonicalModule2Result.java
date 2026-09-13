package com.sih26.vyapaarsathi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CanonicalModule2Result {

    private boolean isEligible;
    private String advisoryMessage;

    // Financial Structuring
    private BigDecimal marginCapital;
    private BigDecimal projectCost;
    private BigDecimal loanAmount;
    private String schemeName;
    private String schemeType; // "MICRO_FINANCE" | "TERM_LOAN"
    private double interestRatePa;
    private int tenureMonths;
    private int moratoriumMonths;
    private int totalQuarters;
    private int moratoriumQuarters;
    private int repaymentQuarters;
    private BigDecimal quarterlyInstallment;
    private BigDecimal monthlyEquivalentInstallment;
    private double workingCapitalAllocationPct;
    private BigDecimal workingCapitalAmount;
    private BigDecimal capexAmount;

    // Canonical Affordability & FOIR Fields
    private Double foirPercentage;
    private String foirVerdictCode; // "SAFE" | "TIGHT" | "HIGH_FINANCIAL_BURDEN"
    private String foirVerdictLabel;
    private String foirBadgeColor; // "GREEN" | "YELLOW" | "RED"
    private Integer breakEvenUnitsPerMonth;

    // Corporation Routing & Demographic Flags
    private String applicableCorporation;
    private List<String> specialFlags;

    // Stress-Test Scenario (30% revenue drop)
    private StressTestResult stressTest;

    // Amortization Schedule
    private List<QuarterRecordDto> amortizationSchedule;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StressTestResult {
        private BigDecimal stressedMonthlyRevenue;
        private Double stressedFoirPercentage;
        private String resilienceRating; // "Resilient" | "Vulnerable"
        private String resilienceRecommendation;
    }
}
