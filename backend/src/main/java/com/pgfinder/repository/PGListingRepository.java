package com.pgfinder.repository;

import com.pgfinder.entity.PGListing;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PGListingRepository extends JpaRepository<PGListing, UUID> {
  Optional<PGListing> findBySlug(String slug);

  Page<PGListing> findByCity(String city, Pageable pageable);

  Page<PGListing> findByCityAndArea(String city, String area, Pageable pageable);

  @Query("SELECT pl FROM PGListing pl WHERE pl.city = :city AND LOWER(pl.area) LIKE LOWER(CONCAT('%', :area, '%'))")
  Page<PGListing> findByCityAndAreaContainingIgnoreCase(@Param("city") String city, @Param("area") String area, Pageable pageable);

  @Query(value = "SELECT *, ST_Distance(location, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography) AS dist "
      + "FROM pg_listings "
      + "WHERE ST_DWithin(location, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, :radiusMeters) "
      + "ORDER BY dist",
      countQuery = "SELECT count(*) FROM pg_listings "
          + "WHERE ST_DWithin(location, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, :radiusMeters)",
      nativeQuery = true)
  Page<PGListing> findNearby(@Param("lat") double lat, @Param("lng") double lng,
      @Param("radiusMeters") double radiusMeters, Pageable pageable);

  @Query(value = "SELECT *, ST_Distance(location, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography) AS dist "
      + "FROM pg_listings "
      + "WHERE ST_DWithin(location, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, :radiusMeters) "
      + "AND (:gender IS NULL OR gender = :gender) "
      + "AND (:minRent IS NULL OR rent_min >= :minRent) "
      + "AND (:maxRent IS NULL OR rent_min <= :maxRent) "
      + "ORDER BY dist",
      countQuery = "SELECT count(*) FROM pg_listings "
          + "WHERE ST_DWithin(location, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, :radiusMeters) "
          + "AND (:gender IS NULL OR gender = :gender) "
          + "AND (:minRent IS NULL OR rent_min >= :minRent) "
          + "AND (:maxRent IS NULL OR rent_min <= :maxRent)",
      nativeQuery = true)
  Page<PGListing> findNearbyWithFilters(@Param("lat") double lat, @Param("lng") double lng,
      @Param("radiusMeters") double radiusMeters,
      @Param("gender") String gender,
      @Param("minRent") Integer minRent,
      @Param("maxRent") Integer maxRent,
      Pageable pageable);

  List<PGListing> findTop10ByOrderByRatingDesc();

  @Query("SELECT DISTINCT pl.area FROM PGListing pl WHERE pl.city = :city AND LOWER(pl.area) LIKE LOWER(CONCAT('%', :query, '%'))")
  List<String> findDistinctAreasByCityAndAreaContainingIgnoreCase(@Param("city") String city, @Param("query") String query);
}
