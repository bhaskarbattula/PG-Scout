package com.pgfinder.controller;

import com.pgfinder.dto.response.ApiResponse;
import com.pgfinder.dto.response.BranchResponse;
import com.pgfinder.dto.response.CompanyResponse;
import com.pgfinder.service.BranchService;
import com.pgfinder.service.CompanyService;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

  private final CompanyService companyService;
  private final BranchService branchService;

  public CompanyController(CompanyService companyService, BranchService branchService) {
    this.companyService = companyService;
    this.branchService = branchService;
  }

  @GetMapping
  public ResponseEntity<ApiResponse<List<CompanyResponse>>> getAllCompanies() {
    return ResponseEntity.ok(ApiResponse.ok(companyService.getAllCompanies()));
  }

  @GetMapping("/search")
  public ResponseEntity<ApiResponse<List<CompanyResponse>>> searchCompanies(
      @RequestParam String q) {
    return ResponseEntity.ok(ApiResponse.ok(companyService.searchCompanies(q)));
  }

  @GetMapping("/{id}")
  public ResponseEntity<ApiResponse<CompanyResponse>> getCompany(@PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.ok(companyService.getCompany(id)));
  }

  @GetMapping("/{id}/branches")
  public ResponseEntity<ApiResponse<List<BranchResponse>>> getBranches(
      @PathVariable UUID id,
      @RequestParam(required = false) String city) {
    if (city != null) {
      return ResponseEntity.ok(ApiResponse.ok(branchService.getBranchesByCompanyAndCity(id, city)));
    }
    return ResponseEntity.ok(ApiResponse.ok(branchService.getBranchesByCompany(id)));
  }
}
