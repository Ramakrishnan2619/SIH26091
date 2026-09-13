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
public class RecommendedSchemeDto {
    @JsonProperty("scheme_id")
    private String schemeId;

    @JsonProperty("scheme_name")
    private String schemeName;

    private String category; // business_linked | bank_specific | loan_type_specific

    @JsonProperty("target_beneficiary_match")
    private String targetBeneficiaryMatch;

    @JsonProperty("illustrative_benefit")
    private String illustrativeBenefit;

    @JsonProperty("indicative_interest_rate")
    private String indicativeInterestRate;

    @JsonProperty("participating_institutions")
    private String participatingInstitutions;

    @Builder.Default
    @JsonProperty("is_illustrative")
    private Boolean isIllustrative = true;

    @Builder.Default
    @JsonProperty("mandatory_disclosure")
    private String mandatoryDisclosure = "AI-generated illustrative match — verify with your nearest SCA/bank before applying";
}
