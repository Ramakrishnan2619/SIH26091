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
public class SendChatMessageResponse {
    @JsonProperty("message_id")
    private Long messageId;

    private String sender;
    private String content;

    @JsonProperty("tokens_used")
    private Integer tokensUsed;

    @JsonProperty("created_at")
    private Instant createdAt;
}
