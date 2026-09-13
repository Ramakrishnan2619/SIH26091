package com.sih26.vyapaarsathi.dto.scheme;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SchemeArchetypeDto {
    @JsonProperty("scheme_id")
    private String schemeId;

    @JsonProperty("scheme_name")
    private String schemeName;

    private String category;

    @JsonProperty("target_demographic")
    private String targetDemographic;

    @JsonProperty("max_loan_limit")
    private String maxLoanLimit;

    @JsonProperty("indicative_interest_rate")
    private String indicativeInterestRate;

    @JsonProperty("participating_institutions")
    private String participatingInstitutions;

    @JsonProperty("illustrative_benefit")
    private String illustrativeBenefit;

    @Builder.Default
    @JsonProperty("is_illustrative")
    private Boolean isIllustrative = true;

    @Builder.Default
    @JsonProperty("mandatory_disclosure")
    private String mandatoryDisclosure = "AI-generated illustrative match — verify with your nearest SCA/bank before applying";
}
