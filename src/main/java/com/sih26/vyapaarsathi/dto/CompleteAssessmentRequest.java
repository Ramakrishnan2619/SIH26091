package com.sih26.vyapaarsathi.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompleteAssessmentRequest {

    // Module 1 Intake Fields
    @NotBlank(message = "Owner name is required")
    @Size(min = 2, max = 100)
    private String ownerName;

    @NotNull(message = "Age is required")
    @Min(18)
    @Max(100)
    private Integer age;

    @NotNull(message = "Margin capital is required")
    @DecimalMin("1000.00")
    private BigDecimal marginCapital;

    @NotBlank(message = "Business category is required")
    private String businessCategory;

    private String businessIdeaDescription;
    private Integer villageLgdCode;

    @NotNull(message = "Latitude is required")
    private BigDecimal latitude;

    @NotNull(message = "Longitude is required")
    private BigDecimal longitude;

    @Builder.Default
    private Integer radiusKm = 10;

    // Module 2 Demographic Attributes
    @NotBlank(message = "Social category is required")
    private String socialCategory; // SC, ST, OBC, Safai Karamchari, General

    @NotBlank(message = "Gender is required")
    private String gender; // Female, Male, Other

    @NotNull(message = "Disability status is required")
    private Boolean disabilityStatus;

    @NotNull(message = "Ex-servicemen status is required")
    private Boolean exServicemenStatus;

    private BigDecimal annualHouseholdIncome;
}
