package com.pgfinder.controller;

import com.pgfinder.dto.response.ApiResponse;
import com.pgfinder.dto.response.PGListingResponse;
import com.pgfinder.service.PGListingService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pgs")
public class PGController {

  private final PGListingService pgListingService;

  public PGController(PGListingService pgListingService) {
    this.pgListingService = pgListingService;
  }

  @GetMapping("/{slug}")
  public ResponseEntity<ApiResponse<PGListingResponse>> getPG(@PathVariable String slug) {
    return ResponseEntity.ok(ApiResponse.ok(pgListingService.getPGBySlug(slug)));
  }

  @GetMapping("/trending")
  public ResponseEntity<ApiResponse<List<PGListingResponse>>> getTrending() {
    return ResponseEntity.ok(ApiResponse.ok(pgListingService.getTrending()));
  }

  @GetMapping("/areas")
  public ResponseEntity<ApiResponse<List<String>>> searchAreas(@RequestParam String q) {
    return ResponseEntity.ok(ApiResponse.ok(pgListingService.findMatchingAreas(q)));
  }
}
