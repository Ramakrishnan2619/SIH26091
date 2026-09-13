package com.sih26.vyapaarsathi.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
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
@JsonIgnoreProperties(ignoreUnknown = true)
public class FeasibilityReportResponse {

    private Long assessmentId;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private VillageContextDto villageContext;
    private SupplyMetricsDto supplyMetrics;
    private Module1ReportDto module1Report;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class VillageContextDto {
        private Integer villageLgdCode;
        private String villageName;
        private String subdistrictName;
        private String districtName;
        private Integer population;
        private Integer households;
        private Double literacyRate;
        private String districtIncomeBand;
        private BigDecimal districtNdpPerCapita;
        private BigDecimal stateAvgHouseholdSpend;
        private String confidence;
        private BigDecimal latitude;
        private BigDecimal longitude;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class SupplyMetricsDto {
        private int competitorDensityCount;
        private String dataSource;
        private List<NearbyPlaceDto> nearbyPlaces;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class NearbyPlaceDto {
        private String name;
        private String address;
        private BigDecimal latitude;
        private BigDecimal longitude;
        private List<String> types;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Module1ReportDto {
        private MarketReachDto marketReach;
        private OpportunityAnalysisDto opportunityAnalysis;
        private SwotAnalysisDto swotAnalysis;
        private ThreatsIdentificationDto threatsIdentification;
        private CompetitorMappingDto competitorMapping;
        private ProductMarketValueDto productMarketValue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class MarketReachDto {
        private Integer consumerBasePopulation;
        private Integer consumerBaseHouseholds;
        private List<String> primaryDistributionChannels;
        private String dataAttribution;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class OpportunityAnalysisDto {
        private List<String> underservedNiches;
        private String opportunityScore; // "High", "Medium", "Emerging"
        private String dataAttribution;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class SwotAnalysisDto {
        private List<String> strengths;
        private List<String> weaknesses;
        private List<String> opportunities;
        private List<String> threats;
        private String dataAttribution;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ThreatsIdentificationDto {
        private String supplyBottlenecks;
        private String seasonalDips;
        private String singleBuyerDependency;
        private String dataAttribution;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CompetitorMappingDto {
        private int totalNearbyShops;
        private int directCompetitors;
        private String saturationIndex; // "Low" | "Moderate" | "High"
        private boolean isModeledEstimate; // nested directly here per review fix
        private String saturationCommentary;
        private String dataAttribution;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ProductMarketValueDto {
        private String recommendedSellingPrice;
        private int estimatedDailySalesVolumeUnits;
        private BigDecimal estimatedMonthlyGrossRevenue;
        private BigDecimal estimatedMonthlyNetProfit;
        private BigDecimal unitVariableCost;
        private BigDecimal monthlyFixedCosts;
        private String purchasingPowerTier;
        private String dataAttribution;
    }
}

