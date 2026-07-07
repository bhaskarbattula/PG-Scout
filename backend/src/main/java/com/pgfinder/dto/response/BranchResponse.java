package com.pgfinder.dto.response;

import java.util.UUID;

public record BranchResponse(
    UUID id,
    String name,
    UUID companyId,
    String companyName,
    UUID cityId,
    String cityName,
    String address,
    Double latitude,
    Double longitude
) {}
