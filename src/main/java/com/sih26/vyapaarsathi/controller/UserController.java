package com.sih26.vyapaarsathi.controller;

import com.sih26.vyapaarsathi.dto.AssessmentHistorySummary;
import com.sih26.vyapaarsathi.dto.UpdateProfileRequest;
import com.sih26.vyapaarsathi.dto.UsageResponse;
import com.sih26.vyapaarsathi.dto.UserProfileResponse;
import com.sih26.vyapaarsathi.entity.User;
import com.sih26.vyapaarsathi.exception.ResourceNotFoundException;
import com.sih26.vyapaarsathi.repository.UserRepository;
import com.sih26.vyapaarsathi.security.UserPrincipal;
import com.sih26.vyapaarsathi.service.QuotaService;
import com.sih26.vyapaarsathi.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final QuotaService quotaService;
    private final UserRepository userRepository;
    private final com.sih26.vyapaarsathi.service.AuthService authService;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        User user = getUser(principal);
        return ResponseEntity.ok(userService.getProfile(user));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(@AuthenticationPrincipal UserPrincipal principal,
                                                             @Valid @RequestBody UpdateProfileRequest request) {
        User user = getUser(principal);
        return ResponseEntity.ok(userService.updateProfile(user, request));
    }

    @GetMapping("/history")
    public ResponseEntity<List<AssessmentHistorySummary>> getHistory(@AuthenticationPrincipal UserPrincipal principal) {
        User user = getUser(principal);
        return ResponseEntity.ok(userService.getUserHistory(user));
    }

    @DeleteMapping("/history/{assessmentId}")
    public ResponseEntity<Void> deleteHistoryItem(@AuthenticationPrincipal UserPrincipal principal,
                                                  @PathVariable Long assessmentId) {
        User user = getUser(principal);
        userService.deleteAssessment(user, assessmentId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/history")
    public ResponseEntity<Void> clearAllHistory(@AuthenticationPrincipal UserPrincipal principal) {
        User user = getUser(principal);
        userService.clearAllHistory(user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/usage")
    public ResponseEntity<UsageResponse> getUsage(@AuthenticationPrincipal UserPrincipal principal) {
        User user = getUser(principal);
        return ResponseEntity.ok(quotaService.getUsage(user));
    }

    private User getUser(UserPrincipal principal) {
        if (principal == null) {
            return authService.getOrCreateDefaultUser();
        }
        return userRepository.findById(principal.getUserId())
                .orElseGet(authService::getOrCreateDefaultUser);
    }
}
