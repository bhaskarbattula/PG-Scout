package com.pgfinder.service;

import com.pgfinder.dto.response.*;
import com.pgfinder.service.PGListingService.NearbyResult;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SearchService {

  private static final Logger log = LoggerFactory.getLogger(SearchService.class);

  private final CompanyService companyService;
  private final BranchService branchService;
  private final PGListingService pgListingService;

  @Value("${app.geo.default-radius-km}")
  private double defaultRadiusKm;

  public SearchService(CompanyService companyService, BranchService branchService,
      PGListingService pgListingService) {
    this.companyService = companyService;
    this.branchService = branchService;
    this.pgListingService = pgListingService;
  }

  public SearchResponse search(String query, UUID branchId,
      String gender, Integer minRent, Integer maxRent,
      Double lat, Double lng, Double radius,
      int page, int size) {

    if (branchId != null) {
      return searchByBranch(branchId, gender, minRent, maxRent, page, size);
    }

    // BRANCH 1: Exact company name match
    CompanyResponse company = companyService.findByName(query);
    if (company != null) {
      return handleCompanyBranches(company, null, gender, minRent, maxRent, page, size);
    }

    // BRANCH 2: Compound query parsing — e.g. "Amazon Bangalore", "Infosys Hyderabad"
    if (query != null && !query.isBlank() && query.contains(" ")) {
      String[] words = query.trim().split("\\s+");
      // Try every prefix as a potential company name (longest first)
      for (int splitAt = words.length - 1; splitAt >= 1; splitAt--) {
        StringBuilder companyPart = new StringBuilder();
        for (int i = 0; i < splitAt; i++) {
          if (i > 0) companyPart.append(" ");
          companyPart.append(words[i]);
        }
        StringBuilder locationPart = new StringBuilder();
        for (int i = splitAt; i < words.length; i++) {
          if (i > splitAt) locationPart.append(" ");
          locationPart.append(words[i]);
        }
        String locationStr = locationPart.toString().toLowerCase();

        CompanyResponse parsedCompany = companyService.findByName(companyPart.toString());
        if (parsedCompany != null) {
          List<BranchResponse> branches = branchService.getBranchesByCompany(parsedCompany.id());
          List<BranchResponse> matching = branches.stream()
              .filter(b -> b.cityName().toLowerCase().contains(locationStr)
                        || (b.name() != null && b.name().toLowerCase().contains(locationStr))
                        || (b.address() != null && b.address().toLowerCase().contains(locationStr)))
              .toList();

          if (!matching.isEmpty()) {
            return handleCompanyBranches(parsedCompany, matching, gender, minRent, maxRent, page, size);
          }
          // Company found but no branch matches the location — still show all branches
          return handleCompanyBranches(parsedCompany, branches, gender, minRent, maxRent, page, size);
        }
      }
    }

    // BRANCH 3: LIKE-based company search (catches abbreviations like "TCS" → "Tata Consultancy Services")
    if (query != null && !query.isBlank()) {
      List<CompanyResponse> matchingCompanies = companyService.searchCompanies(query);
      if (!matchingCompanies.isEmpty()) {
        return handleCompanyBranches(matchingCompanies.get(0), null, gender, minRent, maxRent, page, size);
      }
    }

    // BRANCH 4: Area search — try query as an area/location name
    if (query != null && !query.isBlank()) {
      NearbyResult areaResult = pgListingService.searchByArea(query, gender, minRent, maxRent, page, size);
      if (areaResult.totalCount() > 0) {
        return SearchResponse.locationResults(query, areaResult.listings(), areaResult.totalCount());
      }
    }

    // BRANCH 5: Location-based search
    if (lat != null && lng != null) {
      return searchByLocation(lat, lng, radius != null ? radius : defaultRadiusKm,
          gender, minRent, maxRent, page, size);
    }

    // BRANCH 6: Final fallback
    if (query != null && !query.isBlank()) {
      return SearchResponse.locationResults(query, List.of(), 0);
    }

    return SearchResponse.locationResults(null, List.of(), 0);
  }

  /**
   * Handles a company match: if exactly 1 branch (possibly filtered), auto-select it and return nearby PGs.
   * If multiple branches, return them for the user to pick.
   */
  private SearchResponse handleCompanyBranches(CompanyResponse company, List<BranchResponse> branches,
      String gender, Integer minRent, Integer maxRent, int page, int size) {
    if (branches == null) {
      branches = branchService.getBranchesByCompany(company.id());
    }
    if (branches.size() == 1) {
      return searchByBranch(branches.get(0).id(), gender, minRent, maxRent, page, size);
    }
    return SearchResponse.companyFound(company, branches);
  }

  private SearchResponse searchByBranch(UUID branchId, String gender,
      Integer minRent, Integer maxRent, int page, int size) {
    var branch = branchService.getBranch(branchId);
    NearbyResult nearby = pgListingService.findNearby(
        branch.latitude(), branch.longitude(), defaultRadiusKm,
        gender, minRent, maxRent, page, size);

    CompanyResponse company = companyService.getCompany(branch.companyId());
    return SearchResponse.singleBranch(company, branch, nearby.listings(), nearby.totalCount());
  }

  private SearchResponse searchByLocation(double lat, double lng, double radius,
      String gender, Integer minRent, Integer maxRent, int page, int size) {
    NearbyResult nearby = pgListingService.findNearby(
        lat, lng, radius, gender, minRent, maxRent, page, size);
    return SearchResponse.locationResults(null, nearby.listings(), nearby.totalCount());
  }
}
