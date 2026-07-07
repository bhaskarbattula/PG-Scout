package com.pgfinder.repository;

import com.pgfinder.entity.Company;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface CompanyRepository extends JpaRepository<Company, UUID> {
  Optional<Company> findByNameIgnoreCase(String name);

  @Query("SELECT c FROM Company c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%'))"
       + " OR (c.abbreviation IS NOT NULL AND LOWER(c.abbreviation) LIKE LOWER(CONCAT('%', :query, '%')))")
  List<Company> searchByName(String query);
}
