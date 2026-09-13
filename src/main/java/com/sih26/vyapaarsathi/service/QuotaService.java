package com.sih26.vyapaarsathi.service;

import com.sih26.vyapaarsathi.dto.UsageResponse;
import com.sih26.vyapaarsathi.entity.LlmUsageLog;
import com.sih26.vyapaarsathi.entity.User;
import com.sih26.vyapaarsathi.exception.QuotaExceededException;
import com.sih26.vyapaarsathi.repository.LlmUsageLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class QuotaService {

    private final LlmUsageLogRepository llmUsageLogRepository;

    @Value("${app.quota.daily-limit:100}")
    private long dailyLimit;

    @Transactional(readOnly = true)
    public void checkQuota(User user) {
        Instant since = Instant.now().minus(24, ChronoUnit.HOURS);
        long queriesUsed = llmUsageLogRepository.countQueriesByUserSince(user, since);

        if (queriesUsed >= dailyLimit) {
            log.warn("Quota exceeded for user {}: {} / {}", user.getUserId(), queriesUsed, dailyLimit);
            throw new QuotaExceededException("Daily advisory limit reached (" + dailyLimit + " queries). Please try again tomorrow.");
        }
    }

    @Transactional
    public void recordUsage(User user, String model, int tokensUsed) {
        LlmUsageLog logEntry = new LlmUsageLog(user, model, Math.max(tokensUsed, 0));
        llmUsageLogRepository.save(logEntry);
        log.debug("Recorded LLM usage: user={}, model={}, tokens={}", user.getUserId(), model, tokensUsed);
    }

    @Transactional(readOnly = true)
    public UsageResponse getUsage(User user) {
        Instant since = Instant.now().minus(24, ChronoUnit.HOURS);
        long queriesToday = llmUsageLogRepository.countQueriesByUserSince(user, since);
        long totalTokens = llmUsageLogRepository.sumAllTokensByUser(user);
        long remaining = Math.max(0, dailyLimit - queriesToday);

        return UsageResponse.builder()
                .totalQueriesToday(queriesToday)
                .dailyLimit(dailyLimit)
                .remainingQueries(remaining)
                .totalTokensConsumed(totalTokens)
                .resetWindow("Rolling 24-Hour Window")
                .build();
    }
}
