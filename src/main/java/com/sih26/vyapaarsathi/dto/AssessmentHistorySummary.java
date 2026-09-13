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
public class AssessmentHistorySummary {
    private Long assessmentId;
    private Integer villageLgdCode;
    private String villageName;
    private String districtName;
    private String businessCategory;
    private BigDecimal marginCapital;
    private BigDecimal projectCost;
    private BigDecimal loanAmount;
    private String schemeName;
    private String schemeType;
    private Double foirPercentage;
    private String foirVerdictCode;
    private String foirVerdictLabel;
    private String foirBadgeColor;
    private Instant createdAt;
}
