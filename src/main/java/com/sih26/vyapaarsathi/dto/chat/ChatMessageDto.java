package com.sih26.vyapaarsathi.dto.chat;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDto {
    @JsonProperty("message_id")
    private Long messageId;

    @JsonProperty("assessment_id")
    private Long assessmentId;

    private String sender;
    private String content;

    @JsonProperty("is_voice")
    private Boolean isVoice;

    @JsonProperty("created_at")
    private Instant createdAt;
}
