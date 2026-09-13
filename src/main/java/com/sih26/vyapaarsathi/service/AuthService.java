package com.sih26.vyapaarsathi.service;

import com.sih26.vyapaarsathi.dto.AuthResponse;
import com.sih26.vyapaarsathi.dto.LoginRequest;
import com.sih26.vyapaarsathi.dto.RegisterRequest;
import com.sih26.vyapaarsathi.dto.UserProfileResponse;
import com.sih26.vyapaarsathi.entity.User;
import com.sih26.vyapaarsathi.exception.DuplicateEmailException;
import com.sih26.vyapaarsathi.repository.UserRepository;
import com.sih26.vyapaarsathi.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new DuplicateEmailException("An account with email " + email + " already exists.");
        }

        User user = new User();
        user.setEmail(email);
        user.setName(request.getName().trim());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setAuthProvider(User.AuthProvider.local);
        user.setRole(request.getRole() != null ? request.getRole() : User.UserRole.beneficiary);
        user.setPreferredLanguage(request.getPreferredLanguage() != null ? request.getPreferredLanguage() : User.PreferredLanguage.en);

        user = userRepository.save(user);
        log.info("Registered new local user: id={}, email={}", user.getUserId(), user.getEmail());

        String token = jwtUtils.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresInSeconds(jwtUtils.getExpirationSeconds())
                .user(UserProfileResponse.fromEntity(user))
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (user.getPasswordHash() == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String token = jwtUtils.generateToken(user);
        log.info("User logged in successfully: id={}, email={}", user.getUserId(), user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresInSeconds(jwtUtils.getExpirationSeconds())
                .user(UserProfileResponse.fromEntity(user))
                .build();
    }

    @Transactional
    public User getOrCreateDefaultUser() {
        return userRepository.findByEmail("beneficiary.meena@vyapaarsathi.gov.in")
                .orElseGet(() -> {
                    User user = new User();
                    user.setEmail("beneficiary.meena@vyapaarsathi.gov.in");
                    user.setName("Meena K.");
                    user.setPasswordHash(passwordEncoder.encode("demoPass123"));
                    user.setAuthProvider(User.AuthProvider.local);
                    user.setRole(User.UserRole.beneficiary);
                    user.setPreferredLanguage(User.PreferredLanguage.en);
                    return userRepository.save(user);
                });
    }

    @Transactional
    public User getOrCreateDemoOfficer() {
        return userRepository.findByEmail("sca.officer@mosje.gov.in")
                .orElseGet(() -> {
                    User user = new User();
                    user.setEmail("sca.officer@mosje.gov.in");
                    user.setName("Ramanathan K.");
                    user.setPasswordHash(passwordEncoder.encode("officerPass123"));
                    user.setAuthProvider(User.AuthProvider.local);
                    user.setRole(User.UserRole.sca_officer);
                    user.setPreferredLanguage(User.PreferredLanguage.en);
                    return userRepository.save(user);
                });
    }

    @Transactional
    public AuthResponse getDemoAuth(String role) {
        User user = "officer".equalsIgnoreCase(role) ? getOrCreateDemoOfficer() : getOrCreateDefaultUser();
        String token = jwtUtils.generateToken(user);
        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresInSeconds(jwtUtils.getExpirationSeconds())
                .user(UserProfileResponse.fromEntity(user))
                .build();
    }
}
