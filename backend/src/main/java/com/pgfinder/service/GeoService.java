package com.pgfinder.service;

import com.pgfinder.dto.response.BranchResponse;
import com.pgfinder.dto.response.PGListingResponse;
import com.pgfinder.entity.Branch;
import com.pgfinder.entity.PGListing;
import com.pgfinder.exception.ResourceNotFoundException;
import com.pgfinder.mapper.BranchMapper;
import com.pgfinder.mapper.PGListingMapper;
import com.pgfinder.repository.BranchRepository;
import com.pgfinder.repository.PGListingRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class GeoService {

  private final BranchRepository branchRepository;
  private final PGListingRepository pgListingRepository;
  private final BranchMapper branchMapper;
  private final PGListingMapper pgListingMapper;

  public GeoService(BranchRepository branchRepository, PGListingRepository pgListingRepository,
      BranchMapper branchMapper, PGListingMapper pgListingMapper) {
    this.branchRepository = branchRepository;
    this.pgListingRepository = pgListingRepository;
    this.branchMapper = branchMapper;
    this.pgListingMapper = pgListingMapper;
  }

  public List<BranchResponse> findNearestBranches(double lat, double lng, int limit) {
    return branchRepository.findNearestBranches(lat, lng, limit)
        .stream()
        .map(branchMapper::toResponse)
        .toList();
  }

  public record GeoSearchResult(List<PGListingResponse> pgListings, long totalCount) {}

  public GeoSearchResult findPGsNearLocation(double lat, double lng, double radiusKm,
      String gender, Integer minRent, Integer maxRent, int page, int size) {
    double radiusMeters = radiusKm * 1000;
    var pageable = org.springframework.data.domain.PageRequest.of(page, size);

    var result = pgListingRepository.findNearbyWithFilters(lat, lng, radiusMeters,
        gender, minRent, maxRent, pageable);

    var listings = result.getContent().stream()
        .map(l -> pgListingMapper.toResponseWithDistance(l, calculateDistance(l, lat, lng)))
        .toList();

    return new GeoSearchResult(listings, result.getTotalElements());
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
