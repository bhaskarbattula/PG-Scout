package com.pgfinder.controller;

import com.pgfinder.dto.response.ApiResponse;
import com.pgfinder.dto.response.SearchResponse;
import com.pgfinder.service.SearchService;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/search")
public class SearchController {

  private final SearchService searchService;

  public SearchController(SearchService searchService) {
    this.searchService = searchService;
  }

  @GetMapping
  public ResponseEntity<ApiResponse<SearchResponse>> search(
      @RequestParam(required = false) String query,
      @RequestParam(required = false) UUID branchId,
      @RequestParam(required = false) String gender,
      @RequestParam(required = false) Integer minRent,
      @RequestParam(required = false) Integer maxRent,
      @RequestParam(required = false) Double lat,
      @RequestParam(required = false) Double lng,
      @RequestParam(required = false) Double radius,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size) {

    if (query == null && lat == null && lng == null && branchId == null) {
      return ResponseEntity.badRequest()
          .body(ApiResponse.error("Provide a search query, location, or branch ID"));
    }

    if (size > 50) size = 50;

    SearchResponse result = searchService.search(query, branchId,
        gender, minRent, maxRent, lat, lng, radius, page, size);

    return ResponseEntity.ok(ApiResponse.ok(result));
  }
}
