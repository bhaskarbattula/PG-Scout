package com.pgfinder.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pgfinder.entity.Branch;
import com.pgfinder.entity.City;
import com.pgfinder.entity.Company;
import com.pgfinder.repository.BranchRepository;
import com.pgfinder.repository.CityRepository;
import com.pgfinder.repository.CompanyRepository;
import java.util.ArrayList;
import java.util.List;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

@Service
public class OSMDataIngestionService {

  private static final Logger log = LoggerFactory.getLogger(OSMDataIngestionService.class);
  private static final GeometryFactory GEOMETRY_FACTORY = new GeometryFactory(new PrecisionModel(), 4326);
  private static final String HYDERABAD_SLUG = "hyderabad";

  private final RestTemplate restTemplate;
  private final CompanyRepository companyRepository;
  private final BranchRepository branchRepository;
  private final CityRepository cityRepository;
  private final ObjectMapper objectMapper;

  @Value("${app.osm.overpass-url}")
  private String overpassUrl;

  public OSMDataIngestionService(RestTemplate restTemplate,
      CompanyRepository companyRepository,
      BranchRepository branchRepository,
      CityRepository cityRepository,
      ObjectMapper objectMapper) {
    this.restTemplate = restTemplate;
    this.companyRepository = companyRepository;
    this.branchRepository = branchRepository;
    this.cityRepository = cityRepository;
    this.objectMapper = objectMapper;
  }

  /**
   * Ingests all companies from the provided list by querying OSM Overpass API
   * for their offices in Hyderabad. Creates companies and branches on-the-fly.
   *
   * @return list of company names that were successfully ingested
   */
  @Transactional
  public List<String> ingestHyderabadCompanies(List<String> companyNames) {
    List<String> ingested = new ArrayList<>();
    City hyderabad = cityRepository.findBySlug(HYDERABAD_SLUG)
        .orElseThrow(() -> new RuntimeException("Hyderabad city not found in database. Run seed data first."));

    // Build Overpass query: search for ALL given company names in Hyderabad area
    String regex = String.join("|", companyNames.stream()
        .map(this::escapeOverpass)
        .toList());

    String overpassQuery = """
        [out:json];
        area["name"="Hyderabad"]["boundary"="administrative"]->.hyd;
        (
          node(area.hyd)["name"~"%s",i];
          way(area.hyd)["name"~"%s",i];
        );
        out center;
        """
        .formatted(regex, regex);

    try {
      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
      String body = "data=" + java.net.URLEncoder.encode(overpassQuery, "UTF-8");
      HttpEntity<String> request = new HttpEntity<>(body, headers);

      log.info("Querying Overpass API for {} companies in Hyderabad...", companyNames.size());
      String response = restTemplate.postForObject(overpassUrl, request, String.class);
      if (response == null || response.isBlank()) {
        log.warn("Empty response from Overpass API");
        return ingested;
      }

      JsonNode root = objectMapper.readTree(response);
      JsonNode elements = root.get("elements");
      if (elements == null || !elements.isArray()) {
        log.warn("No 'elements' in Overpass response");
        return ingested;
      }

      for (JsonNode el : elements) {
        String osmId = el.get("id").asText();
        String type = el.get("type").asText();
        JsonNode tags = el.get("tags");
        if (tags == null) continue;

        String name = tags.has("name") ? tags.get("name").asText() : null;
        if (name == null || name.isBlank()) continue;

        // Determine which company this belongs to (best match by name)
        Company company = matchCompany(name, companyNames);
        if (company == null) continue;

        // Extract coordinates (handle both node and way/center)
        double lat, lon;
        if ("node".equals(type)) {
          lat = el.get("lat").asDouble();
          lon = el.get("lon").asDouble();
        } else {
          JsonNode center = el.get("center");
          if (center == null) continue;
          lat = center.get("lat").asDouble();
          lon = center.get("lon").asDouble();
        }

        // Build address from tags
        String address = buildAddress(tags);

        // Check if this branch already exists (by OSM ID or name+lat+lng proximity)
        boolean exists = branchRepository.findByCompanyId(company.getId()).stream()
            .anyMatch(b -> osmId.equals(b.getOsmId())
                || (b.getLatitude() != null && Math.abs(b.getLatitude() - lat) < 0.001
                    && b.getLongitude() != null && Math.abs(b.getLongitude() - lon) < 0.001));
        if (exists) continue;

        saveBranch(name, lat, lon, address, hyderabad, osmId, company);
        if (!ingested.contains(company.getName())) {
          ingested.add(company.getName());
        }
        log.info("  + Branch '{}' for {}", name, company.getName());
      }

      log.info("OSM ingestion complete. {} companies with new branches.", ingested.size());
    } catch (Exception e) {
      log.error("Failed to ingest OSM data for Hyderabad companies", e);
    }

    return ingested;
  }

  /**
   * Matches an OSM entity name to one of the target company names.
   * First tries exact match, then contains match.
   */
  private Company matchCompany(String osmName, List<String> companyNames) {
    String lower = osmName.toLowerCase();

    // Try exact name match first
    for (String cn : companyNames) {
      if (lower.equals(cn.toLowerCase())) {
        return getOrCreateCompany(cn);
      }
    }

    // Try contains match (e.g., "Amazon Development Center Hyderabad" contains "Amazon")
    for (String cn : companyNames) {
      if (lower.contains(cn.toLowerCase()) || cn.toLowerCase().contains(lower)) {
        return getOrCreateCompany(cn);
      }
    }

    return null;
  }

  private Company getOrCreateCompany(String name) {
    return companyRepository.findByNameIgnoreCase(name)
        .orElseGet(() -> {
          Company c = new Company();
          c.setName(name);
          return companyRepository.save(c);
        });
  }

  private void saveBranch(String name, double lat, double lng, String address,
      City city, String osmId, Company company) {
    Branch branch = new Branch();
    branch.setName(name);
    branch.setCompany(company);
    branch.setCity(city);
    branch.setAddress(address);
    branch.setLatitude(lat);
    branch.setLongitude(lng);
    branch.setLocation(createPoint(lng, lat));
    branch.setOsmId(osmId);
    branchRepository.save(branch);
  }

  private String buildAddress(JsonNode tags) {
    StringBuilder sb = new StringBuilder();
    if (tags.has("addr:full")) {
      sb.append(tags.get("addr:full").asText());
    }
    if (tags.has("addr:street")) {
      if (!sb.isEmpty()) sb.append(", ");
      sb.append(tags.get("addr:street").asText());
    }
    if (tags.has("addr:city")) {
      if (!sb.isEmpty()) sb.append(", ");
      sb.append(tags.get("addr:city").asText());
    }
    return sb.toString();
  }

  private Point createPoint(double lng, double lat) {
    return GEOMETRY_FACTORY.createPoint(new Coordinate(lng, lat));
  }

  private String escapeOverpass(String input) {
    return input.replace("\\", "\\\\").replace("\"", "\\\"")
        .replace("|", "\\|").replace(".", "\\.");
  }
}
