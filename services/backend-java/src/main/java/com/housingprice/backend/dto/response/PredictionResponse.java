package com.housingprice.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.housingprice.backend.dto.request.HousingFeaturesDTO;
import com.housingprice.backend.model.PredictionRecord;
import java.time.format.DateTimeFormatter;

public class PredictionResponse {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    private Long id;
    private String timestamp;
    private HousingFeaturesDTO features;
    private Double predictedPrice;

    public PredictionResponse() {
    }

    public PredictionResponse(Long id, String timestamp, HousingFeaturesDTO features, Double predictedPrice) {
        this.id = id;
        this.timestamp = timestamp;
        this.features = features;
        this.predictedPrice = predictedPrice;
    }

    public static PredictionResponse from(PredictionRecord record) {
        HousingFeaturesDTO features = new HousingFeaturesDTO(
                record.getSquareFootage(),
                record.getBedrooms(),
                record.getBathrooms(),
                record.getYearBuilt(),
                record.getLotSize(),
                record.getDistanceToCityCenter(),
                record.getSchoolRating()
        );
        return new PredictionResponse(
                record.getId(),
                record.getTimestamp().format(FORMATTER),
                features,
                record.getPredictedPrice()
        );
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public HousingFeaturesDTO getFeatures() {
        return features;
    }

    public void setFeatures(HousingFeaturesDTO features) {
        this.features = features;
    }

    public Double getPredictedPrice() {
        return predictedPrice;
    }

    public void setPredictedPrice(Double predictedPrice) {
        this.predictedPrice = predictedPrice;
    }

    @Override
    public String toString() {
        return "PredictionResponse{" +
                "id=" + id +
                ", timestamp='" + timestamp + '\'' +
                ", predictedPrice=" + predictedPrice +
                '}';
    }
}
