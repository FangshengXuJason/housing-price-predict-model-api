package com.housingprice.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.housingprice.backend.dto.request.BatchPredictionRequest;
import com.housingprice.backend.dto.request.ComparisonRequest;
import com.housingprice.backend.dto.request.HousingFeaturesDTO;
import com.housingprice.backend.dto.request.SinglePredictionRequestDTO;
import com.housingprice.backend.dto.response.BatchPredictionResponse;
import com.housingprice.backend.dto.response.ComparisonResponse;
import com.housingprice.backend.dto.response.ComparisonResponse.ComparisonSummary;
import com.housingprice.backend.dto.response.ModelInfoResponse;
import com.housingprice.backend.dto.response.PredictionHistoryResponse;
import com.housingprice.backend.dto.response.PredictionResponse;
import com.housingprice.backend.service.PredictionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PredictionController.class)
class PredictionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private PredictionService predictionService;

    private HousingFeaturesDTO createValidFeatures() {
        return new HousingFeaturesDTO(2000.0, 3, 2.0, 2010, 5000.0, 10.0, 8.0);
    }

    private PredictionResponse createPredictionResponse(Long id, Double price) {
        HousingFeaturesDTO features = createValidFeatures();
        return new PredictionResponse(
                id,
                LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
                features,
                price
        );
    }

    @Test
    void createPrediction_success() throws Exception {
        HousingFeaturesDTO features = createValidFeatures();
        SinglePredictionRequestDTO request = new SinglePredictionRequestDTO(features);
        PredictionResponse response = createPredictionResponse(1L, 350000.0);

        when(predictionService.createPrediction(any(SinglePredictionRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/predictions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.predicted_price").value(350000.0))
                .andExpect(jsonPath("$.features.square_footage").value(2000.0))
                .andExpect(jsonPath("$.features.bedrooms").value(3));
    }

    @Test
    void createPrediction_validationError_missingFeatures() throws Exception {
        String invalidJson = "{}";

        mockMvc.perform(post("/api/predictions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.detail").value("Validation failed"));
    }

    @Test
    void batchPredict_success() throws Exception {
        List<HousingFeaturesDTO> featuresList = List.of(createValidFeatures(), createValidFeatures());
        BatchPredictionRequest request = new BatchPredictionRequest(featuresList);

        List<PredictionResponse> predictions = List.of(
                createPredictionResponse(1L, 350000.0),
                createPredictionResponse(2L, 400000.0)
        );
        BatchPredictionResponse response = new BatchPredictionResponse(predictions);

        when(predictionService.createBatchPrediction(any(BatchPredictionRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/predictions/batch")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.predictions").isArray())
                .andExpect(jsonPath("$.predictions.length()").value(2))
                .andExpect(jsonPath("$.predictions[0].id").value(1))
                .andExpect(jsonPath("$.predictions[1].id").value(2));
    }

    @Test
    void getHistory_success() throws Exception {
        List<PredictionResponse> predictions = List.of(
                createPredictionResponse(1L, 350000.0),
                createPredictionResponse(2L, 400000.0)
        );
        PredictionHistoryResponse response = new PredictionHistoryResponse(predictions, 2L);

        when(predictionService.getPredictionHistory(eq(0), eq(20))).thenReturn(response);

        mockMvc.perform(get("/api/predictions")
                        .param("skip", "0")
                        .param("limit", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.predictions.length()").value(2))
                .andExpect(jsonPath("$.predictions[0].id").value(1))
                .andExpect(jsonPath("$.predictions[1].id").value(2))
                .andExpect(jsonPath("$.total").value(2));
    }

    @Test
    void getHistory_defaultParams() throws Exception {
        List<PredictionResponse> predictions = List.of(createPredictionResponse(1L, 350000.0));
        PredictionHistoryResponse response = new PredictionHistoryResponse(predictions, 1L);

        when(predictionService.getPredictionHistory(eq(0), eq(20))).thenReturn(response);

        mockMvc.perform(get("/api/predictions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.predictions.length()").value(1))
                .andExpect(jsonPath("$.total").value(1));
    }

    @Test
    void getById_success() throws Exception {
        PredictionResponse response = createPredictionResponse(1L, 350000.0);

        when(predictionService.getPredictionById(1L)).thenReturn(response);

        mockMvc.perform(get("/api/predictions/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.predicted_price").value(350000.0));
    }

    @Test
    void getById_notFound() throws Exception {
        when(predictionService.getPredictionById(999L))
                .thenThrow(new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Prediction with id 999 not found"));

        mockMvc.perform(get("/api/predictions/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Prediction with id 999 not found"));
    }

    @Test
    void delete_success() throws Exception {
        mockMvc.perform(delete("/api/predictions/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void delete_notFound() throws Exception {
        org.mockito.Mockito.doThrow(new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Prediction with id 999 not found"))
                .when(predictionService).deletePrediction(999L);

        mockMvc.perform(delete("/api/predictions/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Prediction with id 999 not found"));
    }

    @Test
    void clearAll_success() throws Exception {
        mockMvc.perform(delete("/api/predictions"))
                .andExpect(status().isNoContent());
    }

    @Test
    void compare_success() throws Exception {
        List<Long> predictionIds = List.of(1L, 2L);
        ComparisonRequest request = new ComparisonRequest(predictionIds);

        List<PredictionResponse> predictions = List.of(
                createPredictionResponse(1L, 350000.0),
                createPredictionResponse(2L, 400000.0)
        );
        ComparisonSummary summary = new ComparisonSummary(350000.0, 400000.0, 375000.0);
        ComparisonResponse response = new ComparisonResponse(predictions, summary);

        when(predictionService.comparePredictions(any(ComparisonRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/predictions/compare")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.predictions.length()").value(2))
                .andExpect(jsonPath("$.summary.min_price").value(350000.0))
                .andExpect(jsonPath("$.summary.max_price").value(400000.0))
                .andExpect(jsonPath("$.summary.avg_price").value(375000.0));
    }

    @Test
    void getModelInfo_success() throws Exception {
        ModelInfoResponse response = new ModelInfoResponse(
                "Ridge Regression",
                Map.of("square_footage", 150.0, "bedrooms", 10000.0),
                50000.0,
                Map.of("r2_score", 0.85, "rmse", 25000.0)
        );

        when(predictionService.getModelInfo()).thenReturn(response);

        mockMvc.perform(get("/api/model-info"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.model_type").value("Ridge Regression"))
                .andExpect(jsonPath("$.intercept").value(50000.0))
                .andExpect(jsonPath("$.coefficients.square_footage").value(150.0))
                .andExpect(jsonPath("$.metrics.r2_score").value(0.85));
    }
}
