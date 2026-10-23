package com.housingprice.backend.dto.response;

import java.util.List;

public class PredictionHistoryResponse {

    private List<PredictionResponse> predictions;
    private long total;

    public PredictionHistoryResponse() {
    }

    public PredictionHistoryResponse(List<PredictionResponse> predictions, long total) {
        this.predictions = predictions;
        this.total = total;
    }

    public List<PredictionResponse> getPredictions() {
        return predictions;
    }

    public void setPredictions(List<PredictionResponse> predictions) {
        this.predictions = predictions;
    }

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }
}
