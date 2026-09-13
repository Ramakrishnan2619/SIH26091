package com.sih26.vyapaarsathi.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "assessments")
@Getter
@Setter
@NoArgsConstructor
public class Assessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "assessment_id")
    private Long assessmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "village_lgd_code")
    private Integer villageLgdCode;

    @Column(name = "latitude", precision = 10, scale = 6)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 10, scale = 6)
    private BigDecimal longitude;

    @Column(name = "business_category", length = 100)
    private String businessCategory;

    @Column(name = "margin_capital", precision = 12, scale = 2)
    private BigDecimal marginCapital;

    @Column(name = "business_idea_description", columnDefinition = "TEXT")
    private String businessIdeaDescription;

    @Column(name = "module1_report_json", columnDefinition = "LONGTEXT")
    private String module1ReportJson;

    @Column(name = "module2_result_json", columnDefinition = "LONGTEXT")
    private String module2ResultJson;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}
