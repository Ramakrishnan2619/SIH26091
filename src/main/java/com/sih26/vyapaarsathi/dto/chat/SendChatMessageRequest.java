package com.sih26.vyapaarsathi.dto.chat;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SendChatMessageRequest {
    @NotNull(message = "Assessment ID is required")
    @JsonProperty("assessment_id")
    private Long assessmentId;

    @NotBlank(message = "Message content must not be blank")
    private String content;
}
