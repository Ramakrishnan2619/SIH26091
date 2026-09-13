package com.sih26.vyapaarsathi.dto;

import com.sih26.vyapaarsathi.entity.User;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    private User.PreferredLanguage preferredLanguage;

    private User.UserRole role;
}
