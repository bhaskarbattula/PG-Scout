package com.pgfinder.dto.response;

import java.util.List;

public record ChatResponse(
    String message,
    List<String> suggestions,
    List<BranchResponse> branches,
    List<PGListingResponse> pgListings,
    String action
) {

  public static ChatResponse text(String message, List<String> suggestions) {
    return new ChatResponse(message, suggestions, List.of(), List.of(), "text");
  }

  public static ChatResponse withBranches(String message, List<BranchResponse> branches) {
    return new ChatResponse(message, List.of(), branches, List.of(), "select_branch");
  }

  public static ChatResponse withPGs(String message, List<PGListingResponse> pgs) {
    return new ChatResponse(message, List.of(), List.of(), pgs, "show_pgs");
  }
}
