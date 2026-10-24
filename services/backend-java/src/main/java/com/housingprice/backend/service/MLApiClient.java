package com.housingprice.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.housingprice.backend.dto.request.HousingFeaturesDTO;
import com.housingprice.backend.dto.response.ModelInfoResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestOperations;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
public class MLApiClient implements MLApiClientInterface {

    private static final Logger log = LoggerFactory.getLogger(MLApiClient.class);

    private final RestOperations restTemplate;
    private final String mlApiUrl;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public MLApiClient(RestOperations restTemplate,
                       @Value("${ml.api.url}") String mlApiUrl,
                       ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.mlApiUrl = mlApiUrl;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_1_1)  // Force HTTP/1.1
                .connectTimeout(Duration.ofSeconds(5))
                .build();
    }

    @Override
    public double predict(HousingFeaturesDTO features) {
        try {
            String url = mlApiUrl + "/predict";
            // Convert DTO to Map to ensure proper JSON serialization
            @SuppressWarnings("unchecked")
            Map<String, Object> body = objectMapper.convertValue(features, Map.class);
            String jsonBody = objectMapper.writeValueAsString(body);
            log.info("ML API /predict request: {}", jsonBody);
            
            // Use Java HttpClient instead of RestTemplate
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();
            
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            log.info("ML API /predict response status: {}", response.statusCode());
            
            if (response.statusCode() != 200) {
                log.error("ML API /predict error: {} - {}", response.statusCode(), response.body());
                throw new RuntimeException("ML API /predict returned HTTP " + response.statusCode()
                        + ": " + response.body());
            }
            
            @SuppressWarnings("unchecked")
            Map<String, Object> responseMap = objectMapper.readValue(response.body(), Map.class);
            if (responseMap == null || !responseMap.containsKey("predicted_price")) {
                throw new RuntimeException("Invalid response from ML API: missing predicted_price");
            }
            return ((Number) responseMap.get("predicted_price")).doubleValue();
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
            String jsonBody = objectMapper.writeValueAsString(body);
            log.info("ML API /predict/batch request: {}", jsonBody);
            
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();
            
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            log.info("ML API /predict/batch response status: {}", response.statusCode());
            
            if (response.statusCode() != 200) {
                log.error("ML API /predict/batch error: {} - {}", response.statusCode(), response.body());
                throw new RuntimeException("ML API /predict/batch returned HTTP " + response.statusCode()
                        + ": " + response.body());
            }
            
            @SuppressWarnings("unchecked")
            Map<String, Object> responseMap = objectMapper.readValue(response.body(), Map.class);
            if (responseMap == null || !responseMap.containsKey("predictions")) {
                throw new RuntimeException("Invalid response from ML API: missing predictions");
            }
            @SuppressWarnings("unchecked")
            List<Number> rawList = (List<Number>) responseMap.get("predictions");
            return rawList.stream().map(Number::doubleValue).toList();
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
