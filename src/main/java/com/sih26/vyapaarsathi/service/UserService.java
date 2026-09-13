package com.sih26.vyapaarsathi.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sih26.vyapaarsathi.dto.AssessmentHistorySummary;
import com.sih26.vyapaarsathi.dto.UpdateProfileRequest;
import com.sih26.vyapaarsathi.dto.UserProfileResponse;
import com.sih26.vyapaarsathi.entity.Assessment;
import com.sih26.vyapaarsathi.entity.User;
import com.sih26.vyapaarsathi.repository.AssessmentRepository;
import com.sih26.vyapaarsathi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final AssessmentRepository assessmentRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(User user) {
        return UserProfileResponse.fromEntity(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(User user, UpdateProfileRequest request) {
        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            user.setName(request.getName().trim());
        }
        if (request.getPreferredLanguage() != null) {
            user.setPreferredLanguage(request.getPreferredLanguage());
        }
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }

        user = userRepository.save(user);
        log.info("Updated profile for user: id={}", user.getUserId());
        return UserProfileResponse.fromEntity(user);
    }

    @Transactional(readOnly = true)
    public List<AssessmentHistorySummary> getUserHistory(User user) {
        List<Assessment> assessments = assessmentRepository.findByUserOrderByCreatedAtDesc(user);
        List<AssessmentHistorySummary> summaries = new ArrayList<>();

        for (Assessment assessment : assessments) {
            AssessmentHistorySummary.AssessmentHistorySummaryBuilder builder = AssessmentHistorySummary.builder()
                    .assessmentId(assessment.getAssessmentId())
                    .villageLgdCode(assessment.getVillageLgdCode())
                    .businessCategory(assessment.getBusinessCategory())
                    .marginCapital(assessment.getMarginCapital())
                    .createdAt(assessment.getCreatedAt());

            // Extract village and district from module1_report_json if present
            if (assessment.getModule1ReportJson() != null) {
                try {
                    JsonNode m1 = objectMapper.readTree(assessment.getModule1ReportJson());
                    JsonNode vc = m1.path("village_context");
                    if (!vc.isMissingNode()) {
                        builder.villageName(vc.path("village_name").asText(null));
                        builder.districtName(vc.path("district_name").asText(null));
                    }
                } catch (Exception ex) {
                    log.debug("Error parsing module1 json for assessment {}: {}", assessment.getAssessmentId(), ex.getMessage());
                }
            }

            // Extract financial metrics from module2_result_json adhering to Canonical Schema A
            if (assessment.getModule2ResultJson() != null) {
                try {
                    JsonNode m2 = objectMapper.readTree(assessment.getModule2ResultJson());
                    JsonNode fin = m2.path("financial_summary");
                    if (fin.isMissingNode()) {
                        fin = m2; // in case root is the canonical object
                    }

                    builder.projectCost(fin.has("project_cost") ? new BigDecimal(fin.path("project_cost").asText()) : null);
                    builder.loanAmount(fin.has("loan_amount") ? new BigDecimal(fin.path("loan_amount").asText()) : null);
                    builder.schemeName(fin.path("scheme_name").asText(null));
                    builder.schemeType(fin.path("scheme_type").asText(null));

                    // Canonical FOIR fields
                    if (fin.has("foir_percentage")) {
                        builder.foirPercentage(fin.path("foir_percentage").asDouble());
                    }
                    builder.foirVerdictCode(fin.path("foir_verdict_code").asText(null));
                    builder.foirVerdictLabel(fin.path("foir_verdict_label").asText(null));
                    builder.foirBadgeColor(fin.path("foir_badge_color").asText(null));
                } catch (Exception ex) {
                    log.debug("Error parsing module2 json for assessment {}: {}", assessment.getAssessmentId(), ex.getMessage());
                }
            }

            summaries.add(builder.build());
        }

        return summaries;
    }

    @Transactional
    public void deleteAssessment(User user, Long assessmentId) {
        assessmentRepository.findById(assessmentId).ifPresent(a -> {
            if (a.getUser() != null && a.getUser().getUserId().equals(user.getUserId())) {
                assessmentRepository.delete(a);
                log.info("Deleted assessment {} for user {}", assessmentId, user.getUserId());
            }
        });
    }

    @Transactional
    public void clearAllHistory(User user) {
        List<Assessment> list = assessmentRepository.findByUserOrderByCreatedAtDesc(user);
        assessmentRepository.deleteAll(list);
        log.info("Cleared all {} assessments for user {}", list.size(), user.getUserId());
    }
}
