package com.housingprice.backend.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public class BatchPredictionRequest {

    @NotNull
    @Size(min = 1)
    @JsonProperty("features_list")
    private List<HousingFeaturesDTO> features;

    public BatchPredictionRequest() {
    }

    public BatchPredictionRequest(List<HousingFeaturesDTO> features) {
        this.features = features;
    }

    public List<HousingFeaturesDTO> getFeatures() {
        return features;
    }

    public void setFeatures(List<HousingFeaturesDTO> features) {
        this.features = features;
    }

    @Override
    public String toString() {
        return "BatchPredictionRequest{" +
                "features=" + features +
                '}';
    }
}
