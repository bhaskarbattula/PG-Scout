package com.pgfinder.mapper;

import com.pgfinder.dto.response.PGListingResponse;
import com.pgfinder.entity.PGListing;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface PGListingMapper {

  @Mapping(target = "distance", ignore = true)
  PGListingResponse toResponse(PGListing listing);

  default PGListingResponse toResponseWithDistance(PGListing listing, Double distance) {
    var resp = toResponse(listing);
    return new PGListingResponse(
        resp.id(), resp.slug(), resp.name(), resp.description(),
        resp.latitude(), resp.longitude(), resp.address(), resp.city(),
        resp.area(), resp.type(), resp.gender(), resp.rentMin(), resp.rentMax(),
        resp.foodAvailable(), resp.wifi(), resp.laundry(), resp.parking(),
        resp.ac(), resp.furnished(), resp.rating(), resp.reviewCount(),
        resp.images(), resp.phone(), distance
    );
  }

  default PGListingResponse toResponseWithDistance(PGListing listing, Object distanceObj) {
    Double distance = distanceObj instanceof Number n ? n.doubleValue() : null;
    return toResponseWithDistance(listing, distance);
  }
}
