package com.pgfinder.service;

import com.pgfinder.dto.response.CompanyResponse;
import com.pgfinder.entity.Company;
import com.pgfinder.exception.ResourceNotFoundException;
import com.pgfinder.mapper.CompanyMapper;
import com.pgfinder.repository.CompanyRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class CompanyService {

  private final CompanyRepository companyRepository;
  private final CompanyMapper companyMapper;

  public CompanyService(CompanyRepository companyRepository, CompanyMapper companyMapper) {
    this.companyRepository = companyRepository;
    this.companyMapper = companyMapper;
  }

  @Cacheable("companies.search")
  public List<CompanyResponse> searchCompanies(String query) {
    return companyRepository.searchByName(query)
        .stream()
        .map(companyMapper::toResponse)
        .toList();
  }

  @Cacheable("companies.byId")
  public CompanyResponse getCompany(UUID id) {
    return companyRepository.findById(id)
        .map(companyMapper::toResponse)
        .orElseThrow(() -> new ResourceNotFoundException("Company", "id", id));
  }

  @Cacheable("companies.byName")
  public CompanyResponse findByName(String name) {
    return companyRepository.findByNameIgnoreCase(name)
        .map(companyMapper::toResponse)
        .orElse(null);
  }

  @Cacheable("companies.all")
  public List<CompanyResponse> getAllCompanies() {
    return companyRepository.findAll()
        .stream()
        .map(companyMapper::toResponse)
        .toList();
  }

  Company getCompanyEntity(UUID id) {
    return companyRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Company", "id", id));
  }

  Company findCompanyEntityByName(String name) {
    return companyRepository.findByNameIgnoreCase(name)
        .orElse(null);
  }
}
