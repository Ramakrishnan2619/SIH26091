package com.sih26.vyapaarsathi.dto.scheme;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SchemeSearchRequest {

    @NotNull(message = "Assessment ID is required")
    @JsonProperty("assessment_id")
    private Long assessmentId;

    @Valid
    @NotNull(message = "Questionnaire responses are required")
    private QuestionnaireDto questionnaire;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionnaireDto {
        private String ownership; // "Me (Primary Applicant)", "My Spouse", "Joint / Family Enterprise", "Not Decided Yet"

        @JsonProperty("primary_applicant")
        private PrimaryApplicantDto primaryApplicant;

        @JsonProperty("household_history")
        private HouseholdHistoryDto householdHistory;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PrimaryApplicantDto {
        private Integer age;
        private String gender;
        @JsonProperty("social_category")
        private String socialCategory; // SC, ST, OBC, General, Safai Karamchari
        @JsonProperty("annual_household_income_band")
        private String annualHouseholdIncomeBand; // "< ₹1.5 Lakh", "₹1.5L - ₹3.0L", "₹3.0L - ₹6.0L", "> ₹6.0L"
        @JsonProperty("education_level")
        private String educationLevel;
        @JsonProperty("disability_status")
        private Boolean disabilityStatus;
        @JsonProperty("ex_servicemen_status")
        private Boolean exServicemenStatus;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HouseholdHistoryDto {
        @JsonProperty("has_existing_business")
        private Boolean hasExistingBusiness;
        @JsonProperty("previous_subsidies")
        private String previousSubsidies; // "None", "MUDRA", "PMEGP", "SCA Loan", "Other"
        @JsonProperty("co_applicant")
        private CoApplicantDto coApplicant;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CoApplicantDto {
        private String relationship;
        private String gender;
        @JsonProperty("disability_status")
        private Boolean disabilityStatus;
    }
}
