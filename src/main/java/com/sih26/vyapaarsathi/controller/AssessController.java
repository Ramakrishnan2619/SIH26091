package com.sih26.vyapaarsathi.controller;

import com.sih26.vyapaarsathi.dto.FeasibilityReportRequest;
import com.sih26.vyapaarsathi.dto.FeasibilityReportResponse;
import com.sih26.vyapaarsathi.dto.ReverseGeocodeRequest;
import com.sih26.vyapaarsathi.dto.ReverseGeocodeResponse;
import com.sih26.vyapaarsathi.dto.VillageAutocompleteDto;
import com.sih26.vyapaarsathi.entity.User;
import com.sih26.vyapaarsathi.exception.ResourceNotFoundException;
import com.sih26.vyapaarsathi.repository.UserRepository;
import com.sih26.vyapaarsathi.security.UserPrincipal;
import com.sih26.vyapaarsathi.service.GoogleMapsService;
import com.sih26.vyapaarsathi.service.Layer2DbService;
import com.sih26.vyapaarsathi.service.VertexAiFeasibilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assess")
@RequiredArgsConstructor
public class AssessController {

    private final Layer2DbService layer2DbService;
    private final GoogleMapsService googleMapsService;
    private final VertexAiFeasibilityService feasibilityService;
    private final com.sih26.vyapaarsathi.service.AssessmentService assessmentService;
    private final UserRepository userRepository;
    private final com.sih26.vyapaarsathi.service.AuthService authService;

    @GetMapping("/location/autocomplete")
    public ResponseEntity<List<VillageAutocompleteDto>> autocomplete(
            @RequestParam("q") String query,
            @RequestParam(value = "limit", defaultValue = "10") int limit) {
        return ResponseEntity.ok(layer2DbService.searchVillages(query, limit));
    }

    @PostMapping("/location/reverse-geocode")
    public ResponseEntity<ReverseGeocodeResponse> reverseGeocode(
            @Valid @RequestBody ReverseGeocodeRequest request) {
        return ResponseEntity.ok(googleMapsService.reverseGeocode(request.getLatitude(), request.getLongitude()));
    }

    @PostMapping("/feasibility")
    public ResponseEntity<FeasibilityReportResponse> generateFeasibilityReport(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody FeasibilityReportRequest request) {
        User user = getUser(principal);
        FeasibilityReportResponse response = feasibilityService.generateFeasibilityReport(user, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/complete")
    public ResponseEntity<com.sih26.vyapaarsathi.dto.UnifiedReportResponse> completeAssessment(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody com.sih26.vyapaarsathi.dto.CompleteAssessmentRequest request) {
        User user = getUser(principal);
        return ResponseEntity.ok(assessmentService.executeCompleteAssessment(user, request));
    }

    private User getUser(UserPrincipal principal) {
        if (principal == null) {
            return authService.getOrCreateDefaultUser();
        }
        return userRepository.findById(principal.getUserId())
                .orElseGet(authService::getOrCreateDefaultUser);
    }
}
