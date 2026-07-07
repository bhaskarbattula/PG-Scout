package com.pgfinder.service;

import com.pgfinder.dto.response.BranchResponse;
import com.pgfinder.entity.Branch;
import com.pgfinder.entity.City;
import com.pgfinder.entity.Company;
import com.pgfinder.exception.ResourceNotFoundException;
import com.pgfinder.mapper.BranchMapper;
import com.pgfinder.repository.BranchRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class BranchService {

  private final BranchRepository branchRepository;
  private final BranchMapper branchMapper;
  private final CompanyService companyService;

  public BranchService(BranchRepository branchRepository, BranchMapper branchMapper,
      CompanyService companyService) {
    this.branchRepository = branchRepository;
    this.branchMapper = branchMapper;
    this.companyService = companyService;
  }

  @Cacheable("branches.byCompany")
  public List<BranchResponse> getBranchesByCompany(UUID companyId) {
    return branchRepository.findByCompanyId(companyId)
        .stream()
        .map(branchMapper::toResponse)
        .toList();
  }

  @Cacheable("branches.byCompanyAndCity")
  public List<BranchResponse> getBranchesByCompanyAndCity(UUID companyId, String cityName) {
    return branchRepository.findByCompanyIdAndCityName(companyId, cityName)
        .stream()
        .map(branchMapper::toResponse)
        .toList();
  }

  @Cacheable("branches.byId")
  public BranchResponse getBranch(UUID id) {
    return branchRepository.findById(id)
        .map(branchMapper::toResponse)
        .orElseThrow(() -> new ResourceNotFoundException("Branch", "id", id));
  }

  Branch getBranchEntity(UUID id) {
    return branchRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Branch", "id", id));
  }
}
