package com.sih26.vyapaarsathi.controller;

import com.sih26.vyapaarsathi.dto.scheme.SchemeArchetypeDto;
import com.sih26.vyapaarsathi.dto.scheme.SchemeSearchRequest;
import com.sih26.vyapaarsathi.dto.scheme.SchemeSearchResponse;
import com.sih26.vyapaarsathi.entity.User;
import com.sih26.vyapaarsathi.service.SchemeSearchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schemes")
@RequiredArgsConstructor
public class SchemeController {

    private final SchemeSearchService schemeSearchService;
    private final com.sih26.vyapaarsathi.repository.UserRepository userRepository;
    private final com.sih26.vyapaarsathi.service.AuthService authService;

    @GetMapping("/archetypes")
    public ResponseEntity<List<SchemeArchetypeDto>> getArchetypes() {
        return ResponseEntity.ok(schemeSearchService.getArchetypeCatalog());
    }

    @PostMapping("/search")
    public ResponseEntity<SchemeSearchResponse> searchSchemes(
            @Valid @RequestBody SchemeSearchRequest request,
            @AuthenticationPrincipal com.sih26.vyapaarsathi.security.UserPrincipal principal) {
        User user = getUser(principal);
        SchemeSearchResponse response = schemeSearchService.searchSchemes(request, user);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<SchemeSearchResponse> getSession(
            @PathVariable Long sessionId,
            @AuthenticationPrincipal com.sih26.vyapaarsathi.security.UserPrincipal principal) {
        User user = getUser(principal);
        SchemeSearchResponse response = schemeSearchService.getSession(sessionId, user);
        return ResponseEntity.ok(response);
    }

    private User getUser(com.sih26.vyapaarsathi.security.UserPrincipal principal) {
        if (principal == null) {
            return authService.getOrCreateDefaultUser();
        }
        return userRepository.findById(principal.getUserId())
                .orElseGet(authService::getOrCreateDefaultUser);
    }
}
