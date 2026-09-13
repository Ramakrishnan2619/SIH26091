package com.sih26.vyapaarsathi.security;

import com.sih26.vyapaarsathi.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Component
public class JwtUtils {

    private final SecretKey key;
    private final long expirationMs;

    public JwtUtils(@Value("${app.jwt.secret}") String secret,
                    @Value("${app.jwt.expiration-ms:3600000}") long expirationMs) {
        // Ensure key is at least 256 bits (32 bytes)
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            byte[] padded = new byte[32];
            System.arraycopy(keyBytes, 0, padded, 0, keyBytes.length);
            keyBytes = padded;
        }
        this.key = Keys.hmacShaKeyFor(keyBytes);
        this.expirationMs = expirationMs;
    }

    public String generateToken(User user) {
        Instant now = Instant.now();
        Instant expiry = now.plusMillis(expirationMs);

        return Jwts.builder()
                .subject(user.getEmail())
                .claim("user_id", user.getUserId())
                .claim("role", user.getRole().name())
                .claim("name", user.getName())
                .claim("preferred_language", user.getPreferredLanguage().name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(key)
                .compact();
    }

    public Claims validateAndExtractClaims(String token) throws JwtException {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public Long extractUserId(String token) {
        Claims claims = validateAndExtractClaims(token);
        Object userIdObj = claims.get("user_id");
        if (userIdObj instanceof Number num) {
            return num.longValue();
        }
        return Long.parseLong(userIdObj.toString());
    }

    public String extractEmail(String token) {
        return validateAndExtractClaims(token).getSubject();
    }

    public long getExpirationSeconds() {
        return expirationMs / 1000;
    }
}
