package com.pgfinder.controller;

import com.pgfinder.dto.response.ApiResponse;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class HealthController {

  @GetMapping("/health")
  public ResponseEntity<ApiResponse<Map<String, String>>> health() {
    return ResponseEntity.ok(ApiResponse.ok(Map.of(
        "status", "UP",
        "service", "PG Finder API",
        "version", "1.0.0"
    )));
  }

}
