package com.cybershield.backend.service;

import com.cybershield.backend.websocket.ThreatWebSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WebSocketBroadcastService {

    private final SimpMessagingTemplate messagingTemplate;
    private final ThreatWebSocketHandler threatWebSocketHandler;

    public void broadcast(String destination, Object payload) {
        messagingTemplate.convertAndSend(destination, payload);
        threatWebSocketHandler.broadcast(payload);
    }
}
