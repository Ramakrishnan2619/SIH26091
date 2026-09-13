package com.sih26.vyapaarsathi.controller;

import com.sih26.vyapaarsathi.dto.UnifiedReportResponse;
import com.sih26.vyapaarsathi.entity.User;
import com.sih26.vyapaarsathi.exception.ResourceNotFoundException;
import com.sih26.vyapaarsathi.repository.UserRepository;
import com.sih26.vyapaarsathi.security.UserPrincipal;
import com.sih26.vyapaarsathi.service.AssessmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final AssessmentService assessmentService;
    private final UserRepository userRepository;
    private final com.sih26.vyapaarsathi.service.AuthService authService;

    @GetMapping("/{assessment_id}")
    public ResponseEntity<UnifiedReportResponse> getReportById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("assessment_id") Long assessmentId) {
        User user = getUser(principal);
        return ResponseEntity.ok(assessmentService.getAssessmentById(user, assessmentId));
    }

    @GetMapping("/latest")
    public ResponseEntity<UnifiedReportResponse> getLatestReport(
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = getUser(principal);
        return ResponseEntity.ok(assessmentService.getLatestAssessment(user));
    }

    private User getUser(UserPrincipal principal) {
        if (principal == null) {
            return authService.getOrCreateDefaultUser();
        }
        return userRepository.findById(principal.getUserId())
                .orElseGet(authService::getOrCreateDefaultUser);
    }
}
