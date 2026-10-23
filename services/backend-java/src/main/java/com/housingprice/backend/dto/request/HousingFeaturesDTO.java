package com.housingprice.backend.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import java.util.Objects;

public class HousingFeaturesDTO {

    @JsonProperty("square_footage")
    @NotNull @Positive
    private Double squareFootage;

    @JsonProperty("bedrooms")
    @NotNull @Min(1)
    private Integer bedrooms;

    @JsonProperty("bathrooms")
    @NotNull @DecimalMin("0.5")
    private Double bathrooms;

    @JsonProperty("year_built")
    @NotNull @Min(1900) @Max(2026)
    private Integer yearBuilt;

    @JsonProperty("lot_size")
    @NotNull @Positive
    private Double lotSize;

    @JsonProperty("distance_to_city_center")
    @NotNull @DecimalMin("0")
    private Double distanceToCityCenter;

    @JsonProperty("school_rating")
    @NotNull @DecimalMin("1.0") @DecimalMax("10.0")
    private Double schoolRating;

    public HousingFeaturesDTO() {
    }

    public HousingFeaturesDTO(Double squareFootage, Integer bedrooms, Double bathrooms,
                              Integer yearBuilt, Double lotSize, Double distanceToCityCenter,
                              Double schoolRating) {
        this.squareFootage = squareFootage;
        this.bedrooms = bedrooms;
        this.bathrooms = bathrooms;
        this.yearBuilt = yearBuilt;
        this.lotSize = lotSize;
        this.distanceToCityCenter = distanceToCityCenter;
        this.schoolRating = schoolRating;
    }

    // Getters and Setters
    public Double getSquareFootage() {
        return squareFootage;
    }

    public void setSquareFootage(Double squareFootage) {
        this.squareFootage = squareFootage;
    }

    public Integer getBedrooms() {
        return bedrooms;
    }

    public void setBedrooms(Integer bedrooms) {
        this.bedrooms = bedrooms;
    }

    public Double getBathrooms() {
        return bathrooms;
    }

    public void setBathrooms(Double bathrooms) {
        this.bathrooms = bathrooms;
    }

    public Integer getYearBuilt() {
        return yearBuilt;
    }

    public void setYearBuilt(Integer yearBuilt) {
        this.yearBuilt = yearBuilt;
    }

    public Double getLotSize() {
        return lotSize;
    }

    public void setLotSize(Double lotSize) {
        this.lotSize = lotSize;
    }

    public Double getDistanceToCityCenter() {
        return distanceToCityCenter;
    }

    public void setDistanceToCityCenter(Double distanceToCityCenter) {
        this.distanceToCityCenter = distanceToCityCenter;
    }

    public Double getSchoolRating() {
        return schoolRating;
    }

    public void setSchoolRating(Double schoolRating) {
        this.schoolRating = schoolRating;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        HousingFeaturesDTO that = (HousingFeaturesDTO) o;
        return Objects.equals(squareFootage, that.squareFootage) &&
                Objects.equals(bedrooms, that.bedrooms) &&
                Objects.equals(bathrooms, that.bathrooms) &&
                Objects.equals(yearBuilt, that.yearBuilt) &&
                Objects.equals(lotSize, that.lotSize) &&
                Objects.equals(distanceToCityCenter, that.distanceToCityCenter) &&
                Objects.equals(schoolRating, that.schoolRating);
    }

    @Override
    public int hashCode() {
        return Objects.hash(squareFootage, bedrooms, bathrooms, yearBuilt, lotSize,
                distanceToCityCenter, schoolRating);
    }

    @Override
    public String toString() {
        return "HousingFeaturesDTO{" +
                "squareFootage=" + squareFootage +
                ", bedrooms=" + bedrooms +
                ", bathrooms=" + bathrooms +
                ", yearBuilt=" + yearBuilt +
                ", lotSize=" + lotSize +
                ", distanceToCityCenter=" + distanceToCityCenter +
                ", schoolRating=" + schoolRating +
                '}';
    }
}
