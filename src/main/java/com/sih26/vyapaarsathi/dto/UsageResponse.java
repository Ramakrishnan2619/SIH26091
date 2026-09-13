package com.sih26.vyapaarsathi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsageResponse {
    private long totalQueriesToday;
    private long dailyLimit;
    private long remainingQueries;
    private long totalTokensConsumed;
    private String resetWindow;
}
