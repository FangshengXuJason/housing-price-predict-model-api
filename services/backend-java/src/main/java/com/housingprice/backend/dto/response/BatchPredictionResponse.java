package com.housingprice.backend.dto.response;

import java.util.List;

public class BatchPredictionResponse {

    private List<PredictionResponse> predictions;

    public BatchPredictionResponse() {
    }

    public BatchPredictionResponse(List<PredictionResponse> predictions) {
        this.predictions = predictions;
    }

    public List<PredictionResponse> getPredictions() {
        return predictions;
    }

    public void setPredictions(List<PredictionResponse> predictions) {
        this.predictions = predictions;
    }

    @Override
    public String toString() {
        return "BatchPredictionResponse{" +
                "predictions=" + predictions +
                '}';
    }
}
