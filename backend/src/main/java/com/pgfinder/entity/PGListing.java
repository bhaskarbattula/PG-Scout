package com.pgfinder.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import java.time.Instant;
import java.util.UUID;
import org.locationtech.jts.geom.Point;

@Entity
@Table(name = "pg_listings", indexes = {
    @Index(name = "idx_pg_listings_location", columnList = "location"),
    @Index(name = "idx_pg_listings_city", columnList = "city"),
    @Index(name = "idx_pg_listings_rent", columnList = "rent_min"),
    @Index(name = "idx_pg_listings_gender", columnList = "gender")
})
public class PGListing {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @NotBlank
  @Column(nullable = false, unique = true)
  private String slug;

  @NotBlank
  @Column(nullable = false)
  private String name;

  @Column(columnDefinition = "TEXT")
  private String description;

  @Column(nullable = false)
  private Double latitude;

  @Column(nullable = false)
  private Double longitude;

  @Column(columnDefinition = "geometry(Point, 4326)")
  private Point location;

  private String address;

  @NotBlank
  @Column(nullable = false)
  private String city;

  private String area;

  @Column(nullable = false)
  private String type;

  @Column(nullable = false)
  private String gender;

  @PositiveOrZero
  @Column(name = "rent_min", nullable = false)
  private Integer rentMin;

  @PositiveOrZero
  @Column(name = "rent_max")
  private Integer rentMax;

  @Column(name = "food_available")
  private Boolean foodAvailable;

  private Boolean wifi;
  private Boolean laundry;
  private Boolean parking;
  private Boolean ac;
  private Boolean furnished;

  private Double rating;

  @Column(name = "review_count")
  private Integer reviewCount;

  @Column(columnDefinition = "TEXT[]")
  private String[] images;

  private String phone;

  @Column(name = "osm_id")
  private String osmId;

  @Column(name = "last_updated")
  private Instant lastUpdated;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  @PrePersist
  protected void onCreate() {
    createdAt = Instant.now();
    lastUpdated = Instant.now();
  }

  @PreUpdate
  protected void onUpdate() {
    lastUpdated = Instant.now();
  }

  public UUID getId() { return id; }
  public void setId(UUID id) { this.id = id; }
  public String getSlug() { return slug; }
  public void setSlug(String slug) { this.slug = slug; }
  public String getName() { return name; }
  public void setName(String name) { this.name = name; }
  public String getDescription() { return description; }
  public void setDescription(String description) { this.description = description; }
  public Double getLatitude() { return latitude; }
  public void setLatitude(Double latitude) { this.latitude = latitude; }
  public Double getLongitude() { return longitude; }
  public void setLongitude(Double longitude) { this.longitude = longitude; }
  public Point getLocation() { return location; }
  public void setLocation(Point location) { this.location = location; }
  public String getAddress() { return address; }
  public void setAddress(String address) { this.address = address; }
  public String getCity() { return city; }
  public void setCity(String city) { this.city = city; }
  public String getArea() { return area; }
  public void setArea(String area) { this.area = area; }
  public String getType() { return type; }
  public void setType(String type) { this.type = type; }
  public String getGender() { return gender; }
  public void setGender(String gender) { this.gender = gender; }
  public Integer getRentMin() { return rentMin; }
  public void setRentMin(Integer rentMin) { this.rentMin = rentMin; }
  public Integer getRentMax() { return rentMax; }
  public void setRentMax(Integer rentMax) { this.rentMax = rentMax; }
  public Boolean getFoodAvailable() { return foodAvailable; }
  public void setFoodAvailable(Boolean foodAvailable) { this.foodAvailable = foodAvailable; }
  public Boolean getWifi() { return wifi; }
  public void setWifi(Boolean wifi) { this.wifi = wifi; }
  public Boolean getLaundry() { return laundry; }
  public void setLaundry(Boolean laundry) { this.laundry = laundry; }
  public Boolean getParking() { return parking; }
  public void setParking(Boolean parking) { this.parking = parking; }
  public Boolean getAc() { return ac; }
  public void setAc(Boolean ac) { this.ac = ac; }
  public Boolean getFurnished() { return furnished; }
  public void setFurnished(Boolean furnished) { this.furnished = furnished; }
  public Double getRating() { return rating; }
  public void setRating(Double rating) { this.rating = rating; }
  public Integer getReviewCount() { return reviewCount; }
  public void setReviewCount(Integer reviewCount) { this.reviewCount = reviewCount; }
  public String[] getImages() { return images; }
  public void setImages(String[] images) { this.images = images; }
  public String getPhone() { return phone; }
  public void setPhone(String phone) { this.phone = phone; }
  public String getOsmId() { return osmId; }
  public void setOsmId(String osmId) { this.osmId = osmId; }
  public Instant getLastUpdated() { return lastUpdated; }
  public Instant getCreatedAt() { return createdAt; }
}
