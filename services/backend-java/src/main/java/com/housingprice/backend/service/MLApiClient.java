package com.housingprice.backend.service;

import com.housingprice.backend.dto.request.HousingFeaturesDTO;
import com.housingprice.backend.dto.response.ModelInfoResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestOperations;

import java.util.List;
import java.util.Map;

@Service
public class MLApiClient implements MLApiClientInterface {

    private final RestOperations restTemplate;
    private final String mlApiUrl;

    public MLApiClient(RestOperations restTemplate,
                       @Value("${ml.api.url}") String mlApiUrl) {
        this.restTemplate = restTemplate;
        this.mlApiUrl = mlApiUrl;
    }

    @Override
    public double predict(HousingFeaturesDTO features) {
        try {
            String url = mlApiUrl + "/predict";
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(url, features, Map.class);
            if (response == null || !response.containsKey("predicted_price")) {
                throw new RuntimeException("Invalid response from ML API: missing predicted_price");
            }
            return ((Number) response.get("predicted_price")).doubleValue();
        } catch (HttpStatusCodeException ex) {
            throw new RuntimeException("ML API /predict returned HTTP " + ex.getStatusCode().value()
                    + ": " + ex.getResponseBodyAsString(), ex);
        } catch (RuntimeException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new RuntimeException("Failed to call ML API /predict: " + ex.getMessage(), ex);
        }
    }

    @Override
    public List<Double> predictBatch(List<HousingFeaturesDTO> features) {
        try {
            String url = mlApiUrl + "/predict/batch";
            Map<String, Object> body = Map.of("features", features);
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(url, body, Map.class);
            if (response == null || !response.containsKey("predictions")) {
                throw new RuntimeException("Invalid response from ML API: missing predictions");
            }
            @SuppressWarnings("unchecked")
            List<Number> rawList = (List<Number>) response.get("predictions");
            return rawList.stream().map(Number::doubleValue).toList();
        } catch (HttpStatusCodeException ex) {
            throw new RuntimeException("ML API /predict/batch returned HTTP " + ex.getStatusCode().value()
                    + ": " + ex.getResponseBodyAsString(), ex);
        } catch (RuntimeException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new RuntimeException("Failed to call ML API /predict/batch: " + ex.getMessage(), ex);
        }
    }

    @Override
    public ModelInfoResponse getModelInfo() {
        try {
            String url = mlApiUrl + "/model-info";
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response == null) {
                throw new RuntimeException("Empty response from ML API /model-info");
            }

            String modelType = (String) response.get("model_type");

            @SuppressWarnings("unchecked")
            Map<String, Double> coefficients = toDoubleMap((Map<String, Object>) response.get("coefficients"));

            Double intercept = ((Number) response.get("intercept")).doubleValue();

            @SuppressWarnings("unchecked")
            Map<String, Double> metrics = toDoubleMap((Map<String, Object>) response.get("metrics"));

            return new ModelInfoResponse(modelType, coefficients, intercept, metrics);
        } catch (HttpStatusCodeException ex) {
            throw new RuntimeException("ML API /model-info returned HTTP " + ex.getStatusCode().value()
                    + ": " + ex.getResponseBodyAsString(), ex);
        } catch (RuntimeException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new RuntimeException("Failed to call ML API /model-info: " + ex.getMessage(), ex);
        }
    }

    private Map<String, Double> toDoubleMap(Map<String, Object> raw) {
        if (raw == null) return Map.of();
        return raw.entrySet().stream()
                .collect(java.util.stream.Collectors.toMap(
                        Map.Entry::getKey,
                        e -> ((Number) e.getValue()).doubleValue()
                ));
    }
}
