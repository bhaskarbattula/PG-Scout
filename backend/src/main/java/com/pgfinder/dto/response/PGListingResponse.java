package com.pgfinder.dto.response;

import java.util.UUID;

public record PGListingResponse(
    UUID id,
    String slug,
    String name,
    String description,
    Double latitude,
    Double longitude,
    String address,
    String city,
    String area,
    String type,
    String gender,
    Integer rentMin,
    Integer rentMax,
    Boolean foodAvailable,
    Boolean wifi,
    Boolean laundry,
    Boolean parking,
    Boolean ac,
    Boolean furnished,
    Double rating,
    Integer reviewCount,
    String[] images,
    String phone,
    Double distance
) {}
