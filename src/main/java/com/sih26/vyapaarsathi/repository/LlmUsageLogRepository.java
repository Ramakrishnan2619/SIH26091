package com.sih26.vyapaarsathi.repository;

import com.sih26.vyapaarsathi.entity.LlmUsageLog;
import com.sih26.vyapaarsathi.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;

@Repository
public interface LlmUsageLogRepository extends JpaRepository<LlmUsageLog, Long> {

    @Query("SELECT COUNT(l) FROM LlmUsageLog l WHERE l.user = :user AND l.createdAt >= :since")
    long countQueriesByUserSince(@Param("user") User user, @Param("since") Instant since);

    @Query("SELECT COALESCE(SUM(l.tokensUsed), 0) FROM LlmUsageLog l WHERE l.user = :user")
    long sumAllTokensByUser(@Param("user") User user);
}
