package com.pgfinder.dto.response;

import java.util.UUID;

public record CompanyResponse(
    UUID id,
    String name,
    String description,
    String logoUrl,
    String website,
    String wikidataId,
    String abbreviation
) {}
