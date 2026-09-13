package com.sih26.vyapaarsathi.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
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
public class AmortizationTableRequest {

    @NotNull(message = "Loan amount is required")
    @DecimalMin(value = "1000.00", message = "Loan amount must be at least ₹1,000.00")
    private BigDecimal loanAmount;

    @NotNull(message = "Annual interest rate is required")
    private Double interestRatePa;

    @NotNull(message = "Tenure in months is required")
    @Min(value = 12, message = "Tenure must be at least 12 months")
    private Integer tenureMonths;

    @NotNull(message = "Moratorium in months is required")
    @Min(value = 0, message = "Moratorium must be at least 0 months")
    private Integer moratoriumMonths;
}
