package com.housingprice.backend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public class SinglePredictionRequestDTO {

    @NotNull
    @Valid
    private HousingFeaturesDTO features;

    public SinglePredictionRequestDTO() {
    }

    public SinglePredictionRequestDTO(HousingFeaturesDTO features) {
        this.features = features;
    }

    public HousingFeaturesDTO getFeatures() {
        return features;
    }

    public void setFeatures(HousingFeaturesDTO features) {
        this.features = features;
    }
}
