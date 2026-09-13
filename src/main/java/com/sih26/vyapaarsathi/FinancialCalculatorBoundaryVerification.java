package com.sih26.vyapaarsathi;

import com.sih26.vyapaarsathi.dto.CanonicalModule2Result;
import com.sih26.vyapaarsathi.dto.FinanceCalculateRequest;
import com.sih26.vyapaarsathi.dto.Module1MetricsDto;
import com.sih26.vyapaarsathi.dto.QuarterRecordDto;
import com.sih26.vyapaarsathi.service.FinancialCalculatorService;

import java.math.BigDecimal;
import java.util.List;

public class FinancialCalculatorBoundaryVerification {

    public static void main(String[] args) {
        FinancialCalculatorService service = new FinancialCalculatorService();
        System.out.println("================================================================================");
        System.out.println("VyapaarSathi (SIH 26091) — Module 2 Boundary-Case Verification Suite");
        System.out.println("================================================================================");

        // TEST 1: Boundary Case ₹1.40 Lakh Project Cost (Margin = ₹14,000.00)
        System.out.println("\n[TEST 1] Boundary Case: Margin = ₹14,000.00 (Project Cost = exactly ₹1,40,000.00)");
        FinanceCalculateRequest req1 = FinanceCalculateRequest.builder()
                .marginCapital(new BigDecimal("14000.00"))
                .businessCategory("Dairy")
                .socialCategory("SC")
                .gender("Female")
                .disabilityStatus(false)
                .exServicemenStatus(false)
                .build();
        CanonicalModule2Result res1 = service.calculate(req1);
        System.out.println("  Scheme Selected:       " + res1.getSchemeName() + " (" + res1.getSchemeType() + ")");
        System.out.println("  Project Cost:          ₹" + res1.getProjectCost());
        System.out.println("  Loan Amount:           ₹" + res1.getLoanAmount() + " (Max cap: ₹1,25,000)");
        System.out.println("  Interest Rate:         " + res1.getInterestRatePa() + "% p.a.");
        System.out.println("  Moratorium Months:     " + res1.getMoratoriumMonths() + "m (" + res1.getMoratoriumQuarters() + " quarter)");
        System.out.println("  Repayment Quarters:    " + res1.getRepaymentQuarters() + " quarters");
        System.out.println("  Quarterly EQI:         ₹" + res1.getQuarterlyInstallment());
        System.out.println("  Corporation Assigned:  " + res1.getApplicableCorporation());
        System.out.println("  Special Flags:         " + res1.getSpecialFlags());

        assert "Micro Finance Scheme".equals(res1.getSchemeName()) : "FAILED: Must route to Micro Finance Scheme";
        assert new BigDecimal("125000.00").compareTo(res1.getLoanAmount()) == 0 : "FAILED: Loan cap must be ₹1,25,000.00";
        assert 11 == res1.getRepaymentQuarters() : "FAILED: Repayment quarters must be 11";

        List<QuarterRecordDto> sched1 = res1.getAmortizationSchedule();
        QuarterRecordDto q1_1 = sched1.get(0);
        QuarterRecordDto q1_12 = sched1.get(11);
        System.out.println("  Q1 Moratorium Interest: ₹" + q1_1.getInterestPaid() + " (Principal Paid: ₹" + q1_1.getPrincipalPaid() + ")");
        System.out.println("  Q12 Terminal Balance:   ₹" + q1_12.getClosingBalance());
        assert new BigDecimal("2031.25").compareTo(q1_1.getInterestPaid()) == 0 : "FAILED: Q1 interest must be ₹2,031.25";
        assert new BigDecimal("0.00").compareTo(q1_12.getClosingBalance()) == 0 : "FAILED: Q12 closing balance must be exactly ₹0.00";
        System.out.println("  >>> TEST 1 PASSED: Strictly routed to Micro Finance, Q1 interest ₹2,031.25, Q12 closed to ₹0.00.");

        // TEST 2: Boundary Transition at ₹1,40,010.00 Project Cost (Margin = ₹14,001.00)
        System.out.println("\n[TEST 2] Boundary Transition: Margin = ₹14,001.00 (Project Cost = ₹1,40,010.00)");
        FinanceCalculateRequest req2 = FinanceCalculateRequest.builder()
                .marginCapital(new BigDecimal("14001.00"))
                .businessCategory("Dairy")
                .socialCategory("OBC")
                .gender("Male")
                .disabilityStatus(false)
                .exServicemenStatus(false)
                .build();
        CanonicalModule2Result res2 = service.calculate(req2);
        System.out.println("  Scheme Selected:       " + res2.getSchemeName() + " (" + res2.getSchemeType() + ")");
        System.out.println("  Project Cost:          ₹" + res2.getProjectCost());
        System.out.println("  Loan Amount:           ₹" + res2.getLoanAmount());
        System.out.println("  Interest Rate:         " + res2.getInterestRatePa() + "% p.a.");
        System.out.println("  Corporation Assigned:  " + res2.getApplicableCorporation());

        assert "Term Loan Scheme".equals(res2.getSchemeName()) : "FAILED: Must route to Term Loan Scheme";
        assert 8.0 == res2.getInterestRatePa() : "FAILED: Term Loan rate must be 8.0%";
        System.out.println("  >>> TEST 2 PASSED: Transition immediately routed to Term Loan Scheme at 8.0%.");

        // TEST 3: Upper Boundary ₹50.00 Lakh Project Cost (Margin = ₹5,00,000.00)
        System.out.println("\n[TEST 3] Upper Boundary: Margin = ₹5,00,000.00 (Project Cost = exactly ₹50,00,000.00)");
        FinanceCalculateRequest req3 = FinanceCalculateRequest.builder()
                .marginCapital(new BigDecimal("500000.00"))
                .businessCategory("Small-scale Manufacturing")
                .socialCategory("Safai Karamchari")
                .gender("Female")
                .disabilityStatus(true)
                .exServicemenStatus(false)
                .build();
        CanonicalModule2Result res3 = service.calculate(req3);
        System.out.println("  Scheme Selected:       " + res3.getSchemeName());
        System.out.println("  Project Cost:          ₹" + res3.getProjectCost());
        System.out.println("  Loan Amount:           ₹" + res3.getLoanAmount() + " (Max cap: ₹45,00,000.00)");
        System.out.println("  Corporation Assigned:  " + res3.getApplicableCorporation());
        System.out.println("  Special Flags:         " + res3.getSpecialFlags());

        assert "Term Loan Scheme".equals(res3.getSchemeName()) : "FAILED: Must route to Term Loan Scheme";
        assert new BigDecimal("4500000.00").compareTo(res3.getLoanAmount()) == 0 : "FAILED: Loan amount must equal cap ₹45,00,000.00";

        List<QuarterRecordDto> sched3 = res3.getAmortizationSchedule();
        QuarterRecordDto q3_28 = sched3.get(27);
        System.out.println("  Q28 Terminal Balance:  ₹" + q3_28.getClosingBalance());
        assert new BigDecimal("0.00").compareTo(q3_28.getClosingBalance()) == 0 : "FAILED: Q28 closing balance must be exactly ₹0.00";
        System.out.println("  >>> TEST 3 PASSED: ₹50L project cost routed to Term Loan, capped at ₹45L, closed to ₹0.00.");

        // TEST 4: Out-of-Scheme State (> ₹50.00 Lakh Project Cost)
        System.out.println("\n[TEST 4] Exceeded Scope State: Margin = ₹6,00,000.00 (Project Cost = ₹60,00,000.00)");
        FinanceCalculateRequest req4 = FinanceCalculateRequest.builder()
                .marginCapital(new BigDecimal("600000.00"))
                .businessCategory("Retail")
                .socialCategory("General")
                .gender("Male")
                .disabilityStatus(false)
                .exServicemenStatus(false)
                .build();
        CanonicalModule2Result res4 = service.calculate(req4);
        System.out.println("  Is Eligible:           " + res4.isEligible());
        System.out.println("  Advisory Message:      " + res4.getAdvisoryMessage());

        assert !res4.isEligible() : "FAILED: Must be marked ineligible";
        assert res4.getAdvisoryMessage() != null && res4.getAdvisoryMessage().contains("Exceeds Term Loan Scheme eligibility")
                : "FAILED: Expected advisory notice";
        System.out.println("  >>> TEST 4 PASSED: Gracefully handled out-of-scope enterprise with advisory message.");

        // TEST 5: Worked Example from API Contract (₹10L Project Cost, ₹9L Loan, ₹28,500 Net Profit)
        System.out.println("\n[TEST 5] Worked Example: Margin = ₹1,00,000.00, Loan = ₹9,00,000.00, Profit = ₹28,500.00");
        FinanceCalculateRequest req5 = FinanceCalculateRequest.builder()
                .marginCapital(new BigDecimal("100000.00"))
                .businessCategory("Dairy")
                .socialCategory("SC")
                .gender("Female")
                .disabilityStatus(false)
                .exServicemenStatus(false)
                .module1Metrics(Module1MetricsDto.builder()
                        .estimatedMonthlyNetProfit(new BigDecimal("28500.00"))
                        .unitSellingPrice(new BigDecimal("40.00"))
                        .unitVariableCost(new BigDecimal("22.00"))
                        .monthlyFixedCosts(new BigDecimal("6500.00"))
                        .build())
                .build();
        CanonicalModule2Result res5 = service.calculate(req5);
        System.out.println("  Quarterly EQI:         ₹" + res5.getQuarterlyInstallment() + " (Expected: ₹44,729.31)");
        System.out.println("  Monthly Debt:          ₹" + res5.getMonthlyEquivalentInstallment() + " (Expected: ₹14,909.77)");
        System.out.println("  FOIR Percentage:       " + res5.getFoirPercentage() + "% (Expected: 52.31%)");
        System.out.println("  FOIR Verdict:          " + res5.getFoirVerdictCode() + " / " + res5.getFoirBadgeColor() + " (" + res5.getFoirVerdictLabel() + ")");
        System.out.println("  Break-Even Units:      " + res5.getBreakEvenUnitsPerMonth() + " units/month");
        System.out.println("  Stress Test FOIR:      " + res5.getStressTest().getStressedFoirPercentage() + "% (" + res5.getStressTest().getResilienceRating() + ")");

        assert new BigDecimal("44729.31").compareTo(res5.getQuarterlyInstallment()) == 0 : "FAILED: EQI must be ₹44,729.31";
        assert new BigDecimal("14909.77").compareTo(res5.getMonthlyEquivalentInstallment()) == 0 : "FAILED: Monthly debt must be ₹14,909.77";
        assert Math.abs(52.31 - res5.getFoirPercentage()) < 0.01 : "FAILED: FOIR must be 52.31%";
        assert "HIGH_FINANCIAL_BURDEN".equals(res5.getFoirVerdictCode()) : "FAILED: Verdict must be HIGH_FINANCIAL_BURDEN";
        assert "RED".equals(res5.getFoirBadgeColor()) : "FAILED: Badge must be RED";

        List<QuarterRecordDto> sched5 = res5.getAmortizationSchedule();
        assert sched5.size() == 28 : "FAILED: Schedule must have 28 quarters";
        assert sched5.get(0).isMoratorium() && sched5.get(1).isMoratorium() : "FAILED: Q1 and Q2 must be moratorium";
        assert new BigDecimal("18000.00").compareTo(sched5.get(0).getInterestPaid()) == 0 : "FAILED: Q1 interest must be ₹18,000.00";
        assert new BigDecimal("18000.00").compareTo(sched5.get(1).getInterestPaid()) == 0 : "FAILED: Q2 interest must be ₹18,000.00";
        assert new BigDecimal("0.00").compareTo(sched5.get(27).getClosingBalance()) == 0 : "FAILED: Q28 closing balance must be exactly ₹0.00";
        System.out.println("  >>> TEST 5 PASSED: EQI matches ₹44,729.31, FOIR 52.31% (RED), all 28 quarters verified to ₹0.00.");

        System.out.println("\n================================================================================");
        System.out.println("ALL 5 BOUNDARY-CASE TESTS PASSED PERFECTLY!");
        System.out.println("================================================================================");
    }
}
