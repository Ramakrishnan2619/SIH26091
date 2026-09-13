package com.sih26.vyapaarsathi.controller;

import com.sih26.vyapaarsathi.dto.AuthResponse;
import com.sih26.vyapaarsathi.dto.LoginRequest;
import com.sih26.vyapaarsathi.dto.RegisterRequest;
import com.sih26.vyapaarsathi.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request,
                                                 HttpServletResponse response) {
        AuthResponse authResponse = authService.register(request);
        addAuthCookie(response, authResponse.getToken(), (int) authResponse.getExpiresInSeconds());
        return ResponseEntity.status(HttpStatus.CREATED).body(authResponse);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request,
                                              HttpServletResponse response) {
        AuthResponse authResponse = authService.login(request);
        addAuthCookie(response, authResponse.getToken(), (int) authResponse.getExpiresInSeconds());
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/demo")
    public ResponseEntity<AuthResponse> demoLogin(@RequestParam(value = "role", defaultValue = "beneficiary") String role,
                                                  HttpServletResponse response) {
        AuthResponse authResponse = authService.getDemoAuth(role);
        addAuthCookie(response, authResponse.getToken(), (int) authResponse.getExpiresInSeconds());
        return ResponseEntity.ok(authResponse);
    }

    @GetMapping("/demo")
    public ResponseEntity<AuthResponse> demoLoginGet(@RequestParam(value = "role", defaultValue = "beneficiary") String role,
                                                     HttpServletResponse response) {
        AuthResponse authResponse = authService.getDemoAuth(role);
        addAuthCookie(response, authResponse.getToken(), (int) authResponse.getExpiresInSeconds());
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("vyapaarsathi_token", null);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setMaxAge(0);
        response.addCookie(cookie);

        return ResponseEntity.ok(Map.of("message", "Successfully logged out"));
    }

    private void addAuthCookie(HttpServletResponse response, String token, int maxAge) {
        Cookie cookie = new Cookie("vyapaarsathi_token", token);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setMaxAge(maxAge);
        response.addCookie(cookie);
    }
}
