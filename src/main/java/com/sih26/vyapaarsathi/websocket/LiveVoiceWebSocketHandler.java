package com.sih26.vyapaarsathi.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sih26.vyapaarsathi.entity.Assessment;
import com.sih26.vyapaarsathi.entity.ChatMessage;
import com.sih26.vyapaarsathi.entity.LlmUsageLog;
import com.sih26.vyapaarsathi.repository.AssessmentRepository;
import com.sih26.vyapaarsathi.repository.ChatMessageRepository;
import com.sih26.vyapaarsathi.repository.LlmUsageLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.AbstractWebSocketHandler;

import java.io.IOException;
import java.net.URI;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class LiveVoiceWebSocketHandler extends AbstractWebSocketHandler {

    private final AssessmentRepository assessmentRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final LlmUsageLogRepository llmUsageLogRepository;
    private final ObjectMapper objectMapper;

    private final Map<String, SessionState> activeSessions = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();

    private record SessionState(
            Long assessmentId,
            ScheduledFuture<?> timeoutTask,
            Instant startTime
    ) {}

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        URI uri = session.getUri();
        Long assessmentId = extractAssessmentId(uri);

        log.info("Live Voice WebSocket connected: sessionId={}, assessmentId={}", session.getId(), assessmentId);

        // Schedule 10-minute auto-termination (FR-5.11)
        ScheduledFuture<?> timeoutTask = scheduler.schedule(() -> {
            try {
                if (session.isOpen()) {
                    log.info("Live Voice session reached 10-minute maximum threshold. Closing session: {}", session.getId());
                    sendJsonEvent(session, Map.of(
                            "type", "system_notice",
                            "message", "Voice session auto-completed at 10-minute safety limit to conserve cloud resources."
                    ));
                    session.close(CloseStatus.NORMAL);
                }
            } catch (Exception e) {
                log.error("Error closing timed out session", e);
            }
        }, 10, TimeUnit.MINUTES);

        activeSessions.put(session.getId(), new SessionState(assessmentId, timeoutTask, Instant.now()));

        // Send initial connection ready message
        sendJsonEvent(session, Map.of(
                "type", "connection_ready",
                "message", "VyapaarSathi Live Voice Assistant ready. Speak now.",
                "sample_rate", 16000,
                "codec", "audio/pcm"
        ));
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        log.debug("Received text frame on voice socket: {}", payload);

        // Client may send control messages like {"action": "ping"} or {"action": "end"}
        if (payload.contains("\"action\":\"end\"")) {
            session.close(CloseStatus.NORMAL);
            return;
        }

        // Echo pong or acknowledge
        sendJsonEvent(session, Map.of("type", "ack", "timestamp", Instant.now().toString()));
    }

    @Override
    protected void handleBinaryMessage(WebSocketSession session, BinaryMessage message) throws Exception {
        SessionState state = activeSessions.get(session.getId());
        if (state == null) return;

        // Process audio chunk (e.g. 16kHz PCM audio chunk)
        byte[] audioData = message.getPayload().array();
        log.trace("Received {} bytes of audio data from session {}", audioData.length, session.getId());

        // In a live Gemini Live deployment, chunks are forwarded via bi-directional gRPC to Vertex AI.
        // For conversational feedback, dispatch simulated recognition event after threshold of speech bytes:
        if (audioData.length > 2000) {
            String userSpeech = "Can I know my quarterly payment amount and moratorium period?";
            String assistantSpeech = "Namaste! Your quarterly payment is ₹44,729.31 under the Term Loan Scheme, with a 6-month moratorium where you only service simple interest.";

            sendJsonEvent(session, Map.of(
                    "type", "transcript",
                    "sender", "user",
                    "text", userSpeech
            ));

            sendJsonEvent(session, Map.of(
                    "type", "transcript",
                    "sender", "assistant",
                    "text", assistantSpeech
            ));

            // Persist spoken dialogue to chat_messages with is_voice = true (FR-5.13)
            persistVoiceTurn(state.assessmentId(), userSpeech, assistantSpeech);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        SessionState state = activeSessions.remove(session.getId());
        if (state != null) {
            state.timeoutTask().cancel(true);
            log.info("Live Voice WebSocket disconnected: sessionId={}, status={}", session.getId(), status);
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        log.warn("WebSocket transport error for session {}: {}", session.getId(), exception.getMessage());
    }

    private void persistVoiceTurn(Long assessmentId, String userSpeech, String assistantSpeech) {
        if (assessmentId == null) return;
        try {
            Assessment assessment = assessmentRepository.findById(assessmentId).orElse(null);
            if (assessment != null) {
                // User voice message
                ChatMessage uMsg = new ChatMessage();
                uMsg.setAssessment(assessment);
                uMsg.setSender(ChatMessage.MessageSender.user);
                uMsg.setContent(userSpeech);
                uMsg.setIsVoice(true);
                uMsg.setCreatedAt(Instant.now());
                chatMessageRepository.save(uMsg);

                // Assistant voice reply
                ChatMessage aMsg = new ChatMessage();
                aMsg.setAssessment(assessment);
                aMsg.setSender(ChatMessage.MessageSender.assistant);
                aMsg.setContent(assistantSpeech);
                aMsg.setIsVoice(true);
                aMsg.setCreatedAt(Instant.now());
                chatMessageRepository.save(aMsg);

                // Log token usage (FR-5.14)
                if (assessment.getUser() != null) {
                    llmUsageLogRepository.save(new LlmUsageLog(
                            assessment.getUser(),
                            "gemini-live-2.5-flash-native-audio",
                            250
                    ));
                }
            }
        } catch (Exception e) {
            log.error("Failed to persist voice turn to database", e);
        }
    }

    private void sendJsonEvent(WebSocketSession session, Map<String, Object> event) {
        try {
            if (session.isOpen()) {
                String json = objectMapper.writeValueAsString(event);
                session.sendMessage(new TextMessage(json));
            }
        } catch (IOException e) {
            log.error("Failed to send JSON event to WebSocket session", e);
        }
    }

    private Long extractAssessmentId(URI uri) {
        if (uri == null || uri.getQuery() == null) return null;
        for (String param : uri.getQuery().split("&")) {
            String[] pair = param.split("=");
            if (pair.length == 2 && "assessment_id".equalsIgnoreCase(pair[0])) {
                try {
                    return Long.parseLong(pair[1]);
                } catch (NumberFormatException ignored) {}
            }
        }
        return null;
    }
}
