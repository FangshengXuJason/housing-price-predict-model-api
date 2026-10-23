package com.housingprice.backend.dto.response;

import java.util.List;

public class ComparisonResponse {

    private List<PredictionResponse> predictions;
    private ComparisonSummary summary;

    public ComparisonResponse() {
    }

    public ComparisonResponse(List<PredictionResponse> predictions, ComparisonSummary summary) {
        this.predictions = predictions;
        this.summary = summary;
    }

    public List<PredictionResponse> getPredictions() {
        return predictions;
    }

    public void setPredictions(List<PredictionResponse> predictions) {
        this.predictions = predictions;
    }

    public ComparisonSummary getSummary() {
        return summary;
    }

    public void setSummary(ComparisonSummary summary) {
        this.summary = summary;
    }

    @Override
    public String toString() {
        return "ComparisonResponse{" +
                "predictions=" + predictions +
                ", summary=" + summary +
                '}';
    }

    public static class ComparisonSummary {

        private Double minPrice;
        private Double maxPrice;
        private Double avgPrice;

        public ComparisonSummary() {
        }

        public ComparisonSummary(Double minPrice, Double maxPrice, Double avgPrice) {
            this.minPrice = minPrice;
            this.maxPrice = maxPrice;
            this.avgPrice = avgPrice;
        }

        public Double getMinPrice() {
            return minPrice;
        }

        public void setMinPrice(Double minPrice) {
            this.minPrice = minPrice;
        }

        public Double getMaxPrice() {
            return maxPrice;
        }

        public void setMaxPrice(Double maxPrice) {
            this.maxPrice = maxPrice;
        }

        public Double getAvgPrice() {
            return avgPrice;
        }

        public void setAvgPrice(Double avgPrice) {
            this.avgPrice = avgPrice;
        }

        @Override
        public String toString() {
            return "ComparisonSummary{" +
                    "minPrice=" + minPrice +
                    ", maxPrice=" + maxPrice +
                    ", avgPrice=" + avgPrice +
                    '}';
        }
    }
}
