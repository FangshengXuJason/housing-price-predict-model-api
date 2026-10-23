package com.housingprice.backend.service;

import com.housingprice.backend.dto.request.HousingFeaturesDTO;
import com.housingprice.backend.dto.response.ModelInfoResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestOperations;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MLApiClientTest {

    @Mock
    private RestOperations restTemplate;

    private MLApiClient mlApiClient;

    private static final String ML_API_URL = "http://localhost:8000";

    @BeforeEach
    void setUp() {
        mlApiClient = new MLApiClient(restTemplate, ML_API_URL);
    }

    private HousingFeaturesDTO createValidFeatures() {
        return new HousingFeaturesDTO(2000.0, 3, 2.0, 2010, 5000.0, 10.0, 8.0);
    }

    @Test
    void predict_success() {
        HousingFeaturesDTO features = createValidFeatures();
        Map<String, Object> mockResponse = Map.of("predicted_price", 350000.0);

        when(restTemplate.postForObject(eq(ML_API_URL + "/predict"), eq(features), eq(Map.class)))
                .thenReturn(mockResponse);

        double result = mlApiClient.predict(features);

        assertEquals(350000.0, result);
    }

    @Test
    void predict_nullResponse() {
        HousingFeaturesDTO features = createValidFeatures();

        when(restTemplate.postForObject(eq(ML_API_URL + "/predict"), eq(features), eq(Map.class)))
                .thenReturn(null);

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> mlApiClient.predict(features));

        assertTrue(exception.getMessage().contains("missing predicted_price"));
    }

    @Test
    void predict_missingPredictedPrice() {
        HousingFeaturesDTO features = createValidFeatures();
        Map<String, Object> mockResponse = Map.of("other_field", "value");

        when(restTemplate.postForObject(eq(ML_API_URL + "/predict"), eq(features), eq(Map.class)))
                .thenReturn(mockResponse);

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> mlApiClient.predict(features));

        assertTrue(exception.getMessage().contains("missing predicted_price"));
    }

    @Test
    void predict_httpError() {
        HousingFeaturesDTO features = createValidFeatures();

        when(restTemplate.postForObject(eq(ML_API_URL + "/predict"), eq(features), eq(Map.class)))
                .thenThrow(new org.springframework.web.client.HttpServerErrorException(
                        org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR, "Server error"));

        // HttpStatusCodeException is now caught and wrapped in RuntimeException with status info
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> mlApiClient.predict(features));

        assertTrue(exception.getMessage().contains("HTTP 500"));
    }

    @Test
    void predictBatch_success() {
        List<HousingFeaturesDTO> featuresList = List.of(createValidFeatures(), createValidFeatures());
        Map<String, Object> body = Map.of("features", featuresList);
        Map<String, Object> mockResponse = Map.of("predictions", List.of(350000.0, 400000.0));

        when(restTemplate.postForObject(eq(ML_API_URL + "/predict/batch"), eq(body), eq(Map.class)))
                .thenReturn(mockResponse);

        List<Double> result = mlApiClient.predictBatch(featuresList);

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(350000.0, result.get(0));
        assertEquals(400000.0, result.get(1));
    }

    @Test
    void predictBatch_nullResponse() {
        List<HousingFeaturesDTO> featuresList = List.of(createValidFeatures());
        Map<String, Object> body = Map.of("features", featuresList);

        when(restTemplate.postForObject(eq(ML_API_URL + "/predict/batch"), eq(body), eq(Map.class)))
                .thenReturn(null);

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> mlApiClient.predictBatch(featuresList));

        assertTrue(exception.getMessage().contains("missing predictions"));
    }

    @Test
    void predictBatch_missingPredictions() {
        List<HousingFeaturesDTO> featuresList = List.of(createValidFeatures());
        Map<String, Object> body = Map.of("features", featuresList);
        Map<String, Object> mockResponse = Map.of("other_field", "value");

        when(restTemplate.postForObject(eq(ML_API_URL + "/predict/batch"), eq(body), eq(Map.class)))
                .thenReturn(mockResponse);

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> mlApiClient.predictBatch(featuresList));

        assertTrue(exception.getMessage().contains("missing predictions"));
    }

    @Test
    void predictBatch_httpError() {
        List<HousingFeaturesDTO> featuresList = List.of(createValidFeatures());
        Map<String, Object> body = Map.of("features", featuresList);
    
        when(restTemplate.postForObject(eq(ML_API_URL + "/predict/batch"), eq(body), eq(Map.class)))
                .thenThrow(new org.springframework.web.client.ResourceAccessException("Connection refused"));
    
        // ResourceAccessException extends RuntimeException, which is rethrown directly by MLApiClient
        assertThrows(org.springframework.web.client.ResourceAccessException.class,
                () -> mlApiClient.predictBatch(featuresList));
    }

    @Test
    void predictBatch_httpStatusError() {
        List<HousingFeaturesDTO> featuresList = List.of(createValidFeatures());
        Map<String, Object> body = Map.of("features", featuresList);

        when(restTemplate.postForObject(eq(ML_API_URL + "/predict/batch"), eq(body), eq(Map.class)))
                .thenThrow(new org.springframework.web.client.HttpClientErrorException(
                        org.springframework.http.HttpStatus.BAD_REQUEST, "Bad request"));

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> mlApiClient.predictBatch(featuresList));

        assertTrue(exception.getMessage().contains("HTTP 400"));
    }

    @Test
    void getModelInfo_success() {
        Map<String, Object> mockResponse = Map.of(
                "model_type", "Ridge Regression",
                "coefficients", Map.of("square_footage", 150.0, "bedrooms", 10000.0),
                "intercept", 50000.0,
                "metrics", Map.of("r2_score", 0.85, "rmse", 25000.0)
        );

        when(restTemplate.getForObject(eq(ML_API_URL + "/model-info"), eq(Map.class)))
                .thenReturn(mockResponse);

        ModelInfoResponse result = mlApiClient.getModelInfo();

        assertNotNull(result);
        assertEquals("Ridge Regression", result.getModelType());
        assertEquals(50000.0, result.getIntercept());
        assertNotNull(result.getCoefficients());
        assertEquals(150.0, result.getCoefficients().get("square_footage"));
        assertEquals(10000.0, result.getCoefficients().get("bedrooms"));
        assertNotNull(result.getMetrics());
        assertEquals(0.85, result.getMetrics().get("r2_score"));
        assertEquals(25000.0, result.getMetrics().get("rmse"));
    }

    @Test
    void getModelInfo_nullResponse() {
        when(restTemplate.getForObject(eq(ML_API_URL + "/model-info"), eq(Map.class)))
                .thenReturn(null);

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> mlApiClient.getModelInfo());

        assertTrue(exception.getMessage().contains("Empty response from ML API"));
    }

    @Test
    void getModelInfo_httpError() {
        when(restTemplate.getForObject(eq(ML_API_URL + "/model-info"), eq(Map.class)))
                .thenThrow(new org.springframework.web.client.ResourceAccessException("Connection refused"));

        // ResourceAccessException extends RuntimeException, which is rethrown directly by MLApiClient
        assertThrows(org.springframework.web.client.ResourceAccessException.class,
                () -> mlApiClient.getModelInfo());
    }

    @Test
    void getModelInfo_httpStatusError() {
        when(restTemplate.getForObject(eq(ML_API_URL + "/model-info"), eq(Map.class)))
                .thenThrow(new org.springframework.web.client.HttpServerErrorException(
                        org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR, "Server error"));

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> mlApiClient.getModelInfo());

        assertTrue(exception.getMessage().contains("HTTP 500"));
    }
}
