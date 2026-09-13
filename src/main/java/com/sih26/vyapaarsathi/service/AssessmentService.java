package com.sih26.vyapaarsathi.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sih26.vyapaarsathi.dto.*;
import com.sih26.vyapaarsathi.entity.Assessment;
import com.sih26.vyapaarsathi.entity.User;
import com.sih26.vyapaarsathi.exception.ResourceNotFoundException;
import com.sih26.vyapaarsathi.repository.AssessmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class AssessmentService {

    private final VertexAiFeasibilityService feasibilityService;
    private final FinancialCalculatorService calculatorService;
    private final AssessmentRepository assessmentRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public UnifiedReportResponse executeCompleteAssessment(User user, CompleteAssessmentRequest request) {
        // 1. Run Module 1 Feasibility Study
        FeasibilityReportRequest m1Req = FeasibilityReportRequest.builder()
                .ownerName(request.getOwnerName())
                .age(request.getAge())
                .marginCapital(request.getMarginCapital())
                .businessCategory(request.getBusinessCategory())
                .businessIdeaDescription(request.getBusinessIdeaDescription())
                .villageLgdCode(request.getVillageLgdCode())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .radiusKm(request.getRadiusKm())
                .build();

        FeasibilityReportResponse m1Resp = feasibilityService.generateFeasibilityReport(user, m1Req);

        // 2. Extract Module 1 Financial Benchmarks defensively
        FeasibilityReportResponse.ProductMarketValueDto pmv = (m1Resp.getModule1Report() != null)
                ? m1Resp.getModule1Report().getProductMarketValue() : null;
        BigDecimal monthlyProfit = (pmv != null && pmv.getEstimatedMonthlyNetProfit() != null)
                ? pmv.getEstimatedMonthlyNetProfit()
                : (request.getMarginCapital() != null
                        ? request.getMarginCapital().multiply(new BigDecimal("0.28")).setScale(2, RoundingMode.HALF_UP)
                        : new BigDecimal("25000.00"));
        BigDecimal unitVarCost = (pmv != null && pmv.getUnitVariableCost() != null)
                ? pmv.getUnitVariableCost() : new BigDecimal("22.00");
        BigDecimal fixedCosts = (pmv != null && pmv.getMonthlyFixedCosts() != null)
                ? pmv.getMonthlyFixedCosts() : new BigDecimal("6500.00");

        Module1MetricsDto m1Metrics = Module1MetricsDto.builder()
                .estimatedMonthlyNetProfit(monthlyProfit)
                .unitSellingPrice(new BigDecimal("40.00")) // default or derived
                .unitVariableCost(unitVarCost)
                .monthlyFixedCosts(fixedCosts)
                .build();

        // 3. Run Module 2 Financial Engineering
        FinanceCalculateRequest m2Req = FinanceCalculateRequest.builder()
                .marginCapital(request.getMarginCapital())
                .businessCategory(request.getBusinessCategory())
                .socialCategory(request.getSocialCategory())
                .gender(request.getGender())
                .disabilityStatus(request.getDisabilityStatus())
                .exServicemenStatus(request.getExServicemenStatus())
                .annualHouseholdIncome(request.getAnnualHouseholdIncome())
                .module1Metrics(m1Metrics)
                .build();

        CanonicalModule2Result m2Resp = calculatorService.calculate(m2Req);

        // 4. Update the saved Assessment with Module 2 results
        Assessment assessment = assessmentRepository.findById(m1Resp.getAssessmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found: " + m1Resp.getAssessmentId()));

        try {
            assessment.setModule2ResultJson(objectMapper.writeValueAsString(m2Resp));
            assessment = assessmentRepository.save(assessment);
        } catch (Exception ex) {
            log.error("Failed to serialize module2_result_json: {}", ex.getMessage());
        }

        // 5. Construct Dashboard KPIs
        UnifiedReportResponse.DashboardKpisDto kpis = constructDashboardKpis(m2Resp, pmv);

        return UnifiedReportResponse.builder()
                .assessmentId(assessment.getAssessmentId())
                .createdAt(assessment.getCreatedAt())
                .ownerName(request.getOwnerName())
                .businessCategory(request.getBusinessCategory())
                .villageContext(m1Resp.getVillageContext())
                .supplyMetrics(m1Resp.getSupplyMetrics())
                .module1Report(m1Resp.getModule1Report())
                .module2Result(m2Resp)
                .dashboardKpis(kpis)
                .build();
    }

    @Transactional(readOnly = true)
    public UnifiedReportResponse getAssessmentById(User user, Long assessmentId) {
        Assessment assessment = assessmentRepository.findByAssessmentIdAndUser(assessmentId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found or unauthorized: " + assessmentId));

        return buildUnifiedResponseFromEntity(assessment);
    }

    @Transactional(readOnly = true)
    public UnifiedReportResponse getLatestAssessment(User user) {
        Assessment assessment = assessmentRepository.findFirstByUserOrderByCreatedAtDesc(user)
                .orElseThrow(() -> new ResourceNotFoundException("No assessments found for current user"));

        return buildUnifiedResponseFromEntity(assessment);
    }

    private UnifiedReportResponse buildUnifiedResponseFromEntity(Assessment assessment) {
        FeasibilityReportResponse.VillageContextDto vc = null;
        FeasibilityReportResponse.SupplyMetricsDto sm = null;
        FeasibilityReportResponse.Module1ReportDto m1 = null;
        CanonicalModule2Result m2 = null;

        if (assessment.getModule1ReportJson() != null) {
            try {
                FeasibilityReportResponse m1Full = objectMapper.readValue(
                        assessment.getModule1ReportJson(),
                        FeasibilityReportResponse.class
                );
                vc = m1Full.getVillageContext();
                sm = m1Full.getSupplyMetrics();
                m1 = m1Full.getModule1Report();
            } catch (Exception ex) {
                log.error("Error parsing module1_report_json: {}", ex.getMessage());
            }
        }

        if (assessment.getModule2ResultJson() != null) {
            try {
                m2 = objectMapper.readValue(
                        assessment.getModule2ResultJson(),
                        CanonicalModule2Result.class
                );
            } catch (Exception ex) {
                log.error("Error parsing module2_result_json: {}", ex.getMessage());
            }
        }

        UnifiedReportResponse.DashboardKpisDto kpis = constructDashboardKpis(
                m2,
                m1 != null ? m1.getProductMarketValue() : null
        );

        return UnifiedReportResponse.builder()
                .assessmentId(assessment.getAssessmentId())
                .createdAt(assessment.getCreatedAt())
                .ownerName(assessment.getUser() != null ? assessment.getUser().getName() : "Beneficiary")
                .businessCategory(assessment.getBusinessCategory())
                .villageContext(vc)
                .supplyMetrics(sm)
                .module1Report(m1)
                .module2Result(m2)
                .dashboardKpis(kpis)
                .build();
    }

    private UnifiedReportResponse.DashboardKpisDto constructDashboardKpis(
            CanonicalModule2Result m2,
            FeasibilityReportResponse.ProductMarketValueDto pmv) {

        BigDecimal totalCost = m2 != null ? m2.getProjectCost() : BigDecimal.ZERO;
        BigDecimal marginMoney = m2 != null ? m2.getMarginCapital() : BigDecimal.ZERO;
        BigDecimal loanAmount = m2 != null ? m2.getLoanAmount() : BigDecimal.ZERO;
        String schemeName = m2 != null ? m2.getSchemeName() : "Concessional Loan";
        String schemeType = m2 != null ? m2.getSchemeType() : "TERM_LOAN";
        double ratePa = m2 != null ? m2.getInterestRatePa() : 8.0;
        Double foirPct = m2 != null ? m2.getFoirPercentage() : 35.0;
        String foirCode = m2 != null ? m2.getFoirVerdictCode() : "SAFE";
        String foirLabel = m2 != null ? m2.getFoirVerdictLabel() : "Safe Affordability";
        String foirColor = m2 != null ? m2.getFoirBadgeColor() : "GREEN";

        // Readiness Rings (Apple Activity style)
        int operatingMarginPct = 22;
        int documentCompletenessPct = 90;
        int permitReadinessPct = 80;
        int compositeScore = (operatingMarginPct * 2 + documentCompletenessPct + permitReadinessPct) / 4;

        UnifiedReportResponse.ReadinessRingsDto rings = UnifiedReportResponse.ReadinessRingsDto.builder()
                .compositeScorePct(compositeScore)
                .documentCompletenessPct(documentCompletenessPct)
                .permitReadinessPct(permitReadinessPct)
                .operatingMarginPct(operatingMarginPct)
                .build();

        return UnifiedReportResponse.DashboardKpisDto.builder()
                .totalProjectCost(totalCost)
                .marginMoney(marginMoney)
                .concessionalLoan(loanAmount)
                .schemeName(schemeName)
                .schemeType(schemeType)
                .interestRatePa(ratePa)
                .foirPercentage(foirPct)
                .foirVerdictCode(foirCode)
                .foirVerdictLabel(foirLabel)
                .foirBadgeColor(foirColor)
                .readinessRings(rings)
                .build();
    }
}
