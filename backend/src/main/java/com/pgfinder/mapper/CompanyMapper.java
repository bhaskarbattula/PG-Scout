package com.pgfinder.mapper;

import com.pgfinder.dto.response.CompanyResponse;
import com.pgfinder.entity.Company;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface CompanyMapper {
  CompanyResponse toResponse(Company company);
}
