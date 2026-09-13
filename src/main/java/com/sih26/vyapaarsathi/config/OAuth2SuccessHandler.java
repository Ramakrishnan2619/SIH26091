package com.sih26.vyapaarsathi.config;

import com.sih26.vyapaarsathi.entity.User;
import com.sih26.vyapaarsathi.repository.UserRepository;
import com.sih26.vyapaarsathi.security.JwtUtils;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");
        String sub = oAuth2User.getAttribute("sub");

        if (email == null) {
            log.error("Google OAuth returned user without email");
            response.sendRedirect("/login?error=" + URLEncoder.encode("Email not provided by Google", StandardCharsets.UTF_8));
            return;
        }

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setAuthProvider(User.AuthProvider.google);
            newUser.setRole(User.UserRole.beneficiary);
            newUser.setPreferredLanguage(User.PreferredLanguage.en);
            return newUser;
        });

        user.setName(name != null ? name : "Beneficiary");
        user.setGoogleSub(sub);
        if (picture != null) {
            user.setProfilePicUrl(picture);
        }
        user = userRepository.save(user);

        String token = jwtUtils.generateToken(user);

        // Set HttpOnly cookie
        Cookie authCookie = new Cookie("vyapaarsathi_token", token);
        authCookie.setPath("/");
        authCookie.setHttpOnly(true);
        authCookie.setMaxAge((int) jwtUtils.getExpirationSeconds());
        response.addCookie(authCookie);

        // Also redirect with token query param for client-side storage
        String targetUrl = "/login/callback?token=" + URLEncoder.encode(token, StandardCharsets.UTF_8);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
