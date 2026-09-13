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
public class QuarterRecordDto {
    private int quarterNumber;
    private BigDecimal openingBalance;
    private BigDecimal principalPaid;
    private BigDecimal interestPaid;
    private BigDecimal totalInstallment;
    private BigDecimal closingBalance;
    private boolean isMoratorium;
}
