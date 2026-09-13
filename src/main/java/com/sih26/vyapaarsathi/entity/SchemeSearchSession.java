package com.sih26.vyapaarsathi.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "scheme_search_sessions")
@Getter
@Setter
@NoArgsConstructor
public class SchemeSearchSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "session_id")
    private Long sessionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assessment_id", nullable = false)
    private Assessment assessment;

    @Column(name = "household_answers_json", columnDefinition = "LONGTEXT")
    private String householdAnswersJson;

    @Column(name = "generated_schemes_json", columnDefinition = "LONGTEXT")
    private String generatedSchemesJson;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}
