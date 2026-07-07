package com.pgfinder.controller;

import com.pgfinder.dto.response.ApiResponse;
import com.pgfinder.service.OSMDataIngestionService;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

  private static final Logger log = LoggerFactory.getLogger(AdminController.class);

  private final OSMDataIngestionService osmDataIngestionService;

  /** Hyderabad IT corridor companies with real offices in the city. */
  private static final List<String> HYDERABAD_COMPANIES = List.of(
      "Google", "Amazon", "Microsoft", "Apple", "Meta", "Netflix",
      "Tata Consultancy Services", "Infosys", "Wipro", "HCL", "Tech Mahindra",
      "Accenture", "Deloitte", "Walmart", "Goldman Sachs", "JP Morgan",
      "Morgan Stanley", "Wells Fargo", "Bank of America", "HSBC", "Barclays",
      "Citi", "IBM", "Oracle", "SAP", "Cognizant", "Capgemini",
      "Qualcomm", "Intel", "Cisco", "Dell", "HP", "Nvidia", "AMD",
      "Broadcom", "Micron", "Samsung", "Salesforce", "ServiceNow", "Adobe",
      "Uber", "Swiggy", "Freshworks", "ADP", "Virtusa", "Cyient",
      "NTT Data", "EY", "KPMG", "UnitedHealth Group"
  );

  public AdminController(OSMDataIngestionService osmDataIngestionService) {
    this.osmDataIngestionService = osmDataIngestionService;
  }

  /**
   * Ingests all known Hyderabad companies from OSM.
   * POST /api/admin/ingest/hyderabad
   */
  @PostMapping("/ingest/hyderabad")
  public ResponseEntity<ApiResponse<Map<String, Object>>> ingestHyderabadCompanies() {
    log.info("Starting Hyderabad company ingestion from OSM...");
    List<String> ingested = osmDataIngestionService.ingestHyderabadCompanies(HYDERABAD_COMPANIES);
    return ResponseEntity.ok(ApiResponse.ok(Map.of(
        "message", "Ingestion complete",
        "companiesAttempted", HYDERABAD_COMPANIES.size(),
        "companiesFound", ingested.size(),
        "companies", ingested
    )));
  }

  /**
   * Ingests a single company by name.
   * POST /api/admin/ingest/company?name=Amazon
   */
  @PostMapping("/ingest/company")
  public ResponseEntity<ApiResponse<Map<String, Object>>> ingestCompany(
      @RequestParam String name) {
    log.info("Ingesting company: {} from OSM...", name);
    List<String> ingested = osmDataIngestionService.ingestHyderabadCompanies(List.of(name));
    return ResponseEntity.ok(ApiResponse.ok(Map.of(
        "message", ingested.contains(name) ? "Branch added" : "No new branches found for " + name,
        "company", name,
        "found", ingested.contains(name)
    )));
  }
}
