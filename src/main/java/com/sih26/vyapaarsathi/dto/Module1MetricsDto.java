package com.sih26.vyapaarsathi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Module1MetricsDto {
    private BigDecimal estimatedMonthlyNetProfit;
    private BigDecimal unitSellingPrice;
    private BigDecimal unitVariableCost;
    private BigDecimal monthlyFixedCosts;
}
