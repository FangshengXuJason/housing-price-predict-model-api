package com.housingprice.backend.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public class ComparisonRequest {

    @NotNull
    @Size(min = 1)
    @JsonProperty("prediction_ids")
    private List<Long> predictionIds;

    public ComparisonRequest() {
    }

    public ComparisonRequest(List<Long> predictionIds) {
        this.predictionIds = predictionIds;
    }

    public List<Long> getPredictionIds() {
        return predictionIds;
    }

    public void setPredictionIds(List<Long> predictionIds) {
        this.predictionIds = predictionIds;
    }

    @Override
    public String toString() {
        return "ComparisonRequest{" +
                "predictionIds=" + predictionIds +
                '}';
    }
}
