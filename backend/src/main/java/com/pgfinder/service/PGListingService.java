package com.pgfinder.service;

import com.pgfinder.dto.response.PGListingResponse;
import com.pgfinder.entity.PGListing;
import com.pgfinder.exception.ResourceNotFoundException;
import com.pgfinder.mapper.PGListingMapper;
import com.pgfinder.repository.PGListingRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class PGListingService {

  private final PGListingRepository pgListingRepository;
  private final PGListingMapper pgListingMapper;

  public PGListingService(PGListingRepository pgListingRepository, PGListingMapper pgListingMapper) {
    this.pgListingRepository = pgListingRepository;
    this.pgListingMapper = pgListingMapper;
  }

  public PGListingResponse getPGBySlug(String slug) {
    return pgListingRepository.findBySlug(slug)
        .map(pgListingMapper::toResponse)
        .orElseThrow(() -> new ResourceNotFoundException("PG", "slug", slug));
  }

  public record NearbyResult(List<PGListingResponse> listings, int totalCount) {}

  public NearbyResult findNearby(double lat, double lng, double radiusKm,
      String gender, Integer minRent, Integer maxRent, int page, int size) {
    double radiusMeters = radiusKm * 1000;
    Pageable pageable = PageRequest.of(page, size);

    Page<PGListing> result;
    if (gender != null || minRent != null || maxRent != null) {
      result = pgListingRepository.findNearbyWithFilters(lat, lng, radiusMeters,
          gender, minRent, maxRent, pageable);
    } else {
      result = pgListingRepository.findNearby(lat, lng, radiusMeters, pageable);
    }

    var listings = result.getContent().stream()
        .map(l -> pgListingMapper.toResponseWithDistance(l, calculateDistance(l, lat, lng)))
        .toList();

    return new NearbyResult(listings, (int) result.getTotalElements());
  }

  public List<PGListingResponse> getTrending() {
    return pgListingRepository.findTop10ByOrderByRatingDesc()
        .stream()
        .map(pgListingMapper::toResponse)
        .toList();
  }

  /** Search PGs by area name (case-insensitive LIKE). Returns PGs whose area field matches the query. */
  public NearbyResult searchByArea(String areaQuery, String gender, Integer minRent, Integer maxRent,
      int page, int size) {
    Pageable pageable = PageRequest.of(page, size);
    // Use LIKE search so partial/case-insensitive matches work
    Page<PGListing> result = pgListingRepository.findByCityAndAreaContainingIgnoreCase("Hyderabad", areaQuery, pageable);

    // Apply filters
    var filtered = result.getContent().stream()
        .filter(l -> gender == null || gender.equals(l.getGender()))
        .filter(l -> minRent == null || l.getRentMin() >= minRent)
        .filter(l -> maxRent == null || l.getRentMin() <= maxRent)
        .toList();

    var listings = filtered.stream()
        .map(pgListingMapper::toResponse)
        .toList();

    return new NearbyResult(listings, listings.size());
  }

  /** Returns distinct area names matching the query (for autocomplete). */
  public List<String> findMatchingAreas(String query) {
    return pgListingRepository.findDistinctAreasByCityAndAreaContainingIgnoreCase("Hyderabad", query);
  }

  private double calculateDistance(PGListing listing, double lat, double lng) {
    double R = 6371;
    double dLat = Math.toRadians(listing.getLatitude() - lat);
    double dLng = Math.toRadians(listing.getLongitude() - lng);
    double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
        + Math.cos(Math.toRadians(lat)) * Math.cos(Math.toRadians(listing.getLatitude()))
        * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
