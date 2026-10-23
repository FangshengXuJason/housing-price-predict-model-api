package com.housingprice.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "prediction_records")
public class PredictionRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "square_footage", nullable = false)
    private Double squareFootage;

    @Column(nullable = false)
    private Integer bedrooms;

    @Column(nullable = false)
    private Double bathrooms;

    @Column(name = "year_built", nullable = false)
    private Integer yearBuilt;

    @Column(name = "lot_size", nullable = false)
    private Double lotSize;

    @Column(name = "distance_to_city_center", nullable = false)
    private Double distanceToCityCenter;

    @Column(name = "school_rating", nullable = false)
    private Double schoolRating;

    @Column(name = "predicted_price", nullable = false)
    private Double predictedPrice;

    public PredictionRecord() {
    }

    public PredictionRecord(LocalDateTime timestamp, Double squareFootage, Integer bedrooms,
                            Double bathrooms, Integer yearBuilt, Double lotSize,
                            Double distanceToCityCenter, Double schoolRating, Double predictedPrice) {
        this.timestamp = timestamp;
        this.squareFootage = squareFootage;
        this.bedrooms = bedrooms;
        this.bathrooms = bathrooms;
        this.yearBuilt = yearBuilt;
        this.lotSize = lotSize;
        this.distanceToCityCenter = distanceToCityCenter;
        this.schoolRating = schoolRating;
        this.predictedPrice = predictedPrice;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

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

    public Double getPredictedPrice() {
        return predictedPrice;
    }

    public void setPredictedPrice(Double predictedPrice) {
        this.predictedPrice = predictedPrice;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PredictionRecord that = (PredictionRecord) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "PredictionRecord{" +
                "id=" + id +
                ", timestamp=" + timestamp +
                ", squareFootage=" + squareFootage +
                ", bedrooms=" + bedrooms +
                ", bathrooms=" + bathrooms +
                ", yearBuilt=" + yearBuilt +
                ", lotSize=" + lotSize +
                ", distanceToCityCenter=" + distanceToCityCenter +
                ", schoolRating=" + schoolRating +
                ", predictedPrice=" + predictedPrice +
                '}';
    }
}
