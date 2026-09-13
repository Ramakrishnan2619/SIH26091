package com.sih26.vyapaarsathi.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "llm_usage_log")
@Getter
@Setter
@NoArgsConstructor
public class LlmUsageLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "log_id")
    private Long logId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "model", length = 100, nullable = false)
    private String model;

    @Column(name = "tokens_used", nullable = false)
    private Integer tokensUsed = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public LlmUsageLog(User user, String model, Integer tokensUsed) {
        this.user = user;
        this.model = model;
        this.tokensUsed = tokensUsed;
        this.createdAt = Instant.now();
    }
}
