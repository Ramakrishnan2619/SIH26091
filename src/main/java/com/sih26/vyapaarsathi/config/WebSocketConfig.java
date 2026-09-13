package com.sih26.vyapaarsathi.config;

import com.sih26.vyapaarsathi.websocket.LiveVoiceWebSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {

    private final LiveVoiceWebSocketHandler liveVoiceWebSocketHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(liveVoiceWebSocketHandler, "/ws/live-voice")
                .setAllowedOrigins("*");
    }
}
