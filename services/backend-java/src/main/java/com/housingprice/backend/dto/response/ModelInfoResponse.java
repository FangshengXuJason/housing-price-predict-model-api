package com.housingprice.backend.dto.response;

import java.util.Map;

public class ModelInfoResponse {

    private String modelType;
    private Map<String, Double> coefficients;
    private Double intercept;
    private Map<String, Double> metrics;

    public ModelInfoResponse() {
    }

    public ModelInfoResponse(String modelType, Map<String, Double> coefficients,
                             Double intercept, Map<String, Double> metrics) {
        this.modelType = modelType;
        this.coefficients = coefficients;
        this.intercept = intercept;
        this.metrics = metrics;
    }

    public String getModelType() {
        return modelType;
    }

    public void setModelType(String modelType) {
        this.modelType = modelType;
    }

    public Map<String, Double> getCoefficients() {
        return coefficients;
    }

    public void setCoefficients(Map<String, Double> coefficients) {
        this.coefficients = coefficients;
    }

    public Double getIntercept() {
        return intercept;
    }

    public void setIntercept(Double intercept) {
        this.intercept = intercept;
    }

    public Map<String, Double> getMetrics() {
        return metrics;
    }

    public void setMetrics(Map<String, Double> metrics) {
        this.metrics = metrics;
    }

    @Override
    public String toString() {
        return "ModelInfoResponse{" +
                "modelType='" + modelType + '\'' +
                ", intercept=" + intercept +
                '}';
    }
}
