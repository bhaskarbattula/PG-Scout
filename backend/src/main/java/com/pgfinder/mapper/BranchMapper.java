package com.pgfinder.mapper;

import com.pgfinder.dto.response.BranchResponse;
import com.pgfinder.entity.Branch;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface BranchMapper {

  @Mapping(target = "companyId", source = "company.id")
  @Mapping(target = "companyName", source = "company.name")
  @Mapping(target = "cityId", source = "city.id")
  @Mapping(target = "cityName", source = "city.name")
  BranchResponse toResponse(Branch branch);
}
