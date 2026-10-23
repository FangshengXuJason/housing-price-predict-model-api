package com.housingprice.backend.model;

import jakarta.persistence.*;
import java.util.Objects;

@Entity
@Table(name = "housing_data")
public class HousingData {

    @Id
    private Integer id;

    @Column(name = "square_footage")
    private Double squareFootage;

    private Integer bedrooms;

    private Double bathrooms;

    @Column(name = "year_built")
    private Integer yearBuilt;

    @Column(name = "lot_size")
    private Double lotSize;

    @Column(name = "distance_to_city_center")
    private Double distanceToCityCenter;

    @Column(name = "school_rating")
    private Double schoolRating;

    private Double price;

    public HousingData() {
    }

    public HousingData(Integer id, Double squareFootage, Integer bedrooms, Double bathrooms,
                       Integer yearBuilt, Double lotSize, Double distanceToCityCenter,
                       Double schoolRating, Double price) {
        this.id = id;
        this.squareFootage = squareFootage;
        this.bedrooms = bedrooms;
        this.bathrooms = bathrooms;
        this.yearBuilt = yearBuilt;
        this.lotSize = lotSize;
        this.distanceToCityCenter = distanceToCityCenter;
        this.schoolRating = schoolRating;
        this.price = price;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
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

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        HousingData that = (HousingData) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "HousingData{" +
                "id=" + id +
                ", squareFootage=" + squareFootage +
                ", bedrooms=" + bedrooms +
                ", bathrooms=" + bathrooms +
                ", yearBuilt=" + yearBuilt +
                ", lotSize=" + lotSize +
                ", distanceToCityCenter=" + distanceToCityCenter +
                ", schoolRating=" + schoolRating +
                ", price=" + price +
                '}';
    }
}
