package com.sih26.vyapaarsathi.dto.scheme;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class FinSahayMasterSchemeDto {

    @JsonProperty("Scheme_ID")
    private String schemeId;

    @JsonProperty("Scheme_Name")
    private String schemeName;

    @JsonProperty("Micro/Term Loan")
    private String microOrTerm;

    @JsonProperty("[Individual/Group]")
    private String beneficiaryType;

    @JsonProperty("Age_Min")
    private String ageMin;

    @JsonProperty("Age_Max")
    private String ageMax;

    @JsonProperty("Income_Limit_Annual (Family Income)")
    private String incomeLimit;

    @JsonProperty("Gender_Requirement")
    private String genderRequirement;

    @JsonProperty("Residence_Requirement")
    private String residenceRequirement;

    @JsonProperty("Business_Purpose")
    private String businessPurpose;

    @JsonProperty("Business_Categories")
    private String businessCategories;

    @JsonProperty("Min_Project_Cost")
    private String minProjectCost;

    @JsonProperty("Max_Project_Cost")
    private String maxProjectCost;

    @JsonProperty("Max_Loan_Amount")
    private String maxLoanAmount;

    @JsonProperty("Own Contribution")
    private String ownContribution;

    @JsonProperty("Subsidy_percentage(Max)")
    private String subsidyPercentage;

    @JsonProperty("Interest_Rate")
    private String interestRate;

    @JsonProperty("Interest_Rate_Type")
    private String interestRateType;

    @JsonProperty("Tenure")
    private String tenure;

    @JsonProperty("Moratorium")
    private String moratorium;

    @JsonProperty("Collateral_Security")
    private String collateralSecurity;

    @JsonProperty("Subsidy_or_Benefit")
    private String subsidyOrBenefit;

    @JsonProperty("Other_Benefits")
    private String otherBenefits;

    @JsonProperty("Required_Documents")
    private String requiredDocuments;

    @JsonProperty("Application_Channel")
    private String applicationChannel;

    @JsonProperty("Official_URL")
    private String officialUrl;

    @JsonProperty("Source_Document")
    private String sourceDocument;

    @JsonProperty("Scheme_Status")
    private String schemeStatus;
}
