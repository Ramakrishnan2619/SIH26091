package com.sih26.vyapaarsathi.dto;

import com.sih26.vyapaarsathi.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private Long userId;
    private String email;
    private String name;
    private String role;
    private String preferredLanguage;
    private String profilePicUrl;
    private Instant createdAt;

    public static UserProfileResponse fromEntity(User user) {
        return UserProfileResponse.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .preferredLanguage(user.getPreferredLanguage().name())
                .profilePicUrl(user.getProfilePicUrl())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
