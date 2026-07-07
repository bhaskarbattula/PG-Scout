package com.pgfinder.dto.response;

import java.util.List;

public record SearchResponse(
    String query,
    String type,
    CompanyResponse company,
    List<BranchResponse> branches,
    BranchResponse selectedBranch,
    List<PGListingResponse> pgListings,
    Integer totalCount
) {

  public static SearchResponse companyFound(CompanyResponse company, List<BranchResponse> branches) {
    return new SearchResponse(null, "multiple_branches", company, branches, null, null, null);
  }

  public static SearchResponse singleBranch(CompanyResponse company, BranchResponse branch, List<PGListingResponse> pgs, int count) {
    return new SearchResponse(null, "results", company, List.of(branch), branch, pgs, count);
  }

  public static SearchResponse locationResults(String query, List<PGListingResponse> pgs, int count) {
    return new SearchResponse(query, "results", null, List.of(), null, pgs, count);
  }
}
