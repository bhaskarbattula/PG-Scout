package com.pgfinder.repository;

import com.pgfinder.entity.Branch;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BranchRepository extends JpaRepository<Branch, UUID> {
  List<Branch> findByCompanyId(UUID companyId);

  List<Branch> findByCompanyIdAndCityName(UUID companyId, String cityName);

  @Query(value = "SELECT * FROM branches ORDER BY location <-> ST_SetSRID(ST_MakePoint(:lng, :lat), 4326) LIMIT :limit",
      nativeQuery = true)
  List<Branch> findNearestBranches(@Param("lat") double lat, @Param("lng") double lng,
      @Param("limit") int limit);
}
