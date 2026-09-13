package com.sih26.vyapaarsathi.controller;

import com.sih26.vyapaarsathi.dto.chat.ChatMessageDto;
import com.sih26.vyapaarsathi.dto.chat.SendChatMessageRequest;
import com.sih26.vyapaarsathi.dto.chat.SendChatMessageResponse;
import com.sih26.vyapaarsathi.entity.User;
import com.sih26.vyapaarsathi.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final com.sih26.vyapaarsathi.repository.UserRepository userRepository;
    private final com.sih26.vyapaarsathi.service.AuthService authService;

    @GetMapping("/history/{assessmentId}")
    public ResponseEntity<List<ChatMessageDto>> getChatHistory(
            @PathVariable Long assessmentId,
            @AuthenticationPrincipal com.sih26.vyapaarsathi.security.UserPrincipal principal) {
        User user = getUser(principal);
        List<ChatMessageDto> history = chatService.getChatHistory(assessmentId, user);
        return ResponseEntity.ok(history);
    }

    @PostMapping("/message")
    public ResponseEntity<SendChatMessageResponse> sendMessage(
            @Valid @RequestBody SendChatMessageRequest request,
            @AuthenticationPrincipal com.sih26.vyapaarsathi.security.UserPrincipal principal) {
        User user = getUser(principal);
        SendChatMessageResponse response = chatService.processChatMessage(
                request.getAssessmentId(),
                request.getContent(),
                user
        );
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
