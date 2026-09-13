package com.sih26.vyapaarsathi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UnifiedReportResponse {

    private Long assessmentId;
    private Instant createdAt;
    private String ownerName;
    private String businessCategory;
    private FeasibilityReportResponse.VillageContextDto villageContext;
    private FeasibilityReportResponse.SupplyMetricsDto supplyMetrics;
    private FeasibilityReportResponse.Module1ReportDto module1Report;
    private CanonicalModule2Result module2Result;
    private DashboardKpisDto dashboardKpis;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardKpisDto {
        private BigDecimal totalProjectCost;
        private BigDecimal marginMoney;
        private BigDecimal concessionalLoan;
        private String schemeName;
        private String schemeType;
        private double interestRatePa;
        private Double foirPercentage;
        private String foirVerdictCode;
        private String foirVerdictLabel;
        private String foirBadgeColor;
        private ReadinessRingsDto readinessRings;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReadinessRingsDto {
        private int compositeScorePct;
        private int documentCompletenessPct;
        private int permitReadinessPct;
        private int operatingMarginPct;
    }
}
