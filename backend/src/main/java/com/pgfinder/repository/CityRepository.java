package com.pgfinder.repository;

import com.pgfinder.entity.City;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CityRepository extends JpaRepository<City, UUID> {
  Optional<City> findBySlug(String slug);
  Optional<City> findByNameIgnoreCase(String name);
}
