package com.sih26.vyapaarsathi.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinanceCalculateRequest {

    @NotNull(message = "Available margin capital is required")
    @DecimalMin(value = "1000.00", message = "Available margin capital must be at least ₹1,000.00")
    private BigDecimal marginCapital;

    @NotBlank(message = "Business category is required")
    private String businessCategory;

    @NotBlank(message = "Social category is required")
    private String socialCategory; // SC, ST, OBC, Safai Karamchari, General

    @NotBlank(message = "Gender is required")
    private String gender; // Female, Male, Other

    @NotNull(message = "Disability status is required")
    private Boolean disabilityStatus;

    @NotNull(message = "Ex-servicemen status is required")
    private Boolean exServicemenStatus;

    private BigDecimal annualHouseholdIncome;

    private Module1MetricsDto module1Metrics;
}
