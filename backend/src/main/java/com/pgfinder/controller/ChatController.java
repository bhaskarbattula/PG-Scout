package com.pgfinder.controller;

import com.pgfinder.dto.response.ApiResponse;
import com.pgfinder.dto.response.ChatResponse;
import com.pgfinder.service.ChatService;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

  private final ChatService chatService;

  public ChatController(ChatService chatService) {
    this.chatService = chatService;
  }

  @PostMapping
  public ResponseEntity<ApiResponse<ChatResponse>> chat(@RequestBody ChatRequest request) {
    if (request.message() == null || request.message().isBlank()) {
      return ResponseEntity.badRequest()
          .body(ApiResponse.error("Message is required"));
    }
    ChatResponse response = chatService.processMessage(request.message(), request.branchId());
    return ResponseEntity.ok(ApiResponse.ok(response));
  }

  @GetMapping("/suggestions")
  public ResponseEntity<ApiResponse<List<String>>> suggestions() {
    return ResponseEntity.ok(ApiResponse.ok(chatService.getSuggestions()));
  }

  record ChatRequest(String message, UUID branchId, String sessionId) {}
}
