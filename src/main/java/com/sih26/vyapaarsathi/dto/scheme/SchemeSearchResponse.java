package com.sih26.vyapaarsathi.dto.scheme;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SchemeSearchResponse {
    @JsonProperty("session_id")
    private Long sessionId;

    @JsonProperty("assessment_id")
    private Long assessmentId;

    @Builder.Default
    @JsonProperty("is_illustrative")
    private Boolean isIllustrative = true;

    @Builder.Default
    @JsonProperty("mandatory_global_disclosure")
    private String mandatoryGlobalDisclosure = "AI-generated illustrative match — verify with your nearest SCA or bank before applying. These matches do NOT constitute statutory sanction.";

    @JsonProperty("household_strategy_insight")
    private String householdStrategyInsight;

    @JsonProperty("recommended_schemes")
    private List<RecommendedSchemeDto> recommendedSchemes;
}
