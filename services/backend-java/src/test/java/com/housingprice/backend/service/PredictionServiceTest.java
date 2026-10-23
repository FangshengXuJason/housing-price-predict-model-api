package com.housingprice.backend.service;

import com.housingprice.backend.dto.request.BatchPredictionRequest;
import com.housingprice.backend.dto.request.ComparisonRequest;
import com.housingprice.backend.dto.request.HousingFeaturesDTO;
import com.housingprice.backend.dto.request.SinglePredictionRequestDTO;
import com.housingprice.backend.dto.response.BatchPredictionResponse;
import com.housingprice.backend.dto.response.ComparisonResponse;
import com.housingprice.backend.dto.response.ModelInfoResponse;
import com.housingprice.backend.dto.response.PredictionHistoryResponse;
import com.housingprice.backend.dto.response.PredictionResponse;
import com.housingprice.backend.model.PredictionRecord;
import com.housingprice.backend.repository.PredictionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PredictionServiceTest {

    @Mock
    private PredictionRepository predictionRepository;

    @Mock
    private MLApiClientInterface mlApiClient;

    @InjectMocks
    private PredictionService predictionService;

    private HousingFeaturesDTO validFeatures;
    private PredictionRecord savedRecord;

    @BeforeEach
    void setUp() {
        validFeatures = new HousingFeaturesDTO(2000.0, 3, 2.0, 2010, 5000.0, 10.0, 8.0);

        savedRecord = new PredictionRecord(
                LocalDateTime.now(),
                2000.0, 3, 2.0, 2010, 5000.0, 10.0, 8.0, 350000.0
        );
        savedRecord.setId(1L);
    }

    @Test
    void createPrediction_success() {
        SinglePredictionRequestDTO request = new SinglePredictionRequestDTO(validFeatures);

        when(mlApiClient.predict(validFeatures)).thenReturn(350000.0);
        when(predictionRepository.save(any(PredictionRecord.class))).thenReturn(savedRecord);

        PredictionResponse response = predictionService.createPrediction(request);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals(350000.0, response.getPredictedPrice());
        assertEquals(2000.0, response.getFeatures().getSquareFootage());
        assertEquals(3, response.getFeatures().getBedrooms());

        verify(mlApiClient).predict(validFeatures);
        verify(predictionRepository).save(any(PredictionRecord.class));
    }

    @Test
    void createPrediction_verifyEntityFields() {
        SinglePredictionRequestDTO request = new SinglePredictionRequestDTO(validFeatures);

        when(mlApiClient.predict(validFeatures)).thenReturn(350000.0);
        when(predictionRepository.save(any(PredictionRecord.class))).thenAnswer(invocation -> {
            PredictionRecord record = invocation.getArgument(0);
            assertEquals(2000.0, record.getSquareFootage());
            assertEquals(3, record.getBedrooms());
            assertEquals(2.0, record.getBathrooms());
            assertEquals(2010, record.getYearBuilt());
            assertEquals(5000.0, record.getLotSize());
            assertEquals(10.0, record.getDistanceToCityCenter());
            assertEquals(8.0, record.getSchoolRating());
            assertEquals(350000.0, record.getPredictedPrice());
            assertNotNull(record.getTimestamp());
            return savedRecord;
        });

        predictionService.createPrediction(request);

        verify(predictionRepository).save(any(PredictionRecord.class));
    }

    @Test
    void createBatchPrediction_success() {
        List<HousingFeaturesDTO> featuresList = List.of(validFeatures, validFeatures);
        BatchPredictionRequest request = new BatchPredictionRequest(featuresList);

        when(mlApiClient.predictBatch(featuresList)).thenReturn(List.of(350000.0, 400000.0));

        PredictionRecord record2 = new PredictionRecord(
                LocalDateTime.now(), 2000.0, 3, 2.0, 2010, 5000.0, 10.0, 8.0, 400000.0
        );
        record2.setId(2L);

        when(predictionRepository.save(any(PredictionRecord.class)))
                .thenReturn(savedRecord)
                .thenReturn(record2);

        BatchPredictionResponse response = predictionService.createBatchPrediction(request);

        assertNotNull(response);
        assertEquals(2, response.getPredictions().size());
        assertEquals(1L, response.getPredictions().get(0).getId());
        assertEquals(2L, response.getPredictions().get(1).getId());
        assertEquals(350000.0, response.getPredictions().get(0).getPredictedPrice());
        assertEquals(400000.0, response.getPredictions().get(1).getPredictedPrice());

        verify(mlApiClient).predictBatch(featuresList);
        verify(predictionRepository, times(2)).save(any(PredictionRecord.class));
    }

    @Test
    void getPredictionHistory_success() {
        Page<PredictionRecord> page = new PageImpl<>(List.of(savedRecord), PageRequest.of(0, 20), 1);
        when(predictionRepository.findAllByOrderByTimestampDesc(any(PageRequest.class))).thenReturn(page);

        PredictionHistoryResponse result = predictionService.getPredictionHistory(0, 20);

        assertNotNull(result);
        assertEquals(1, result.getPredictions().size());
        assertEquals(1L, result.getPredictions().get(0).getId());
        assertEquals(350000.0, result.getPredictions().get(0).getPredictedPrice());
        assertEquals(1L, result.getTotal());

        verify(predictionRepository).findAllByOrderByTimestampDesc(any(PageRequest.class));
    }

    @Test
    void getPredictionHistory_emptyResult() {
        Page<PredictionRecord> emptyPage = new PageImpl<>(List.of(), PageRequest.of(0, 20), 0);
        when(predictionRepository.findAllByOrderByTimestampDesc(any(PageRequest.class))).thenReturn(emptyPage);

        PredictionHistoryResponse result = predictionService.getPredictionHistory(0, 20);

        assertNotNull(result);
        assertTrue(result.getPredictions().isEmpty());
        assertEquals(0L, result.getTotal());
    }

    @Test
    void getPredictionById_success() {
        when(predictionRepository.findById(1L)).thenReturn(Optional.of(savedRecord));

        PredictionResponse response = predictionService.getPredictionById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals(350000.0, response.getPredictedPrice());

        verify(predictionRepository).findById(1L);
    }

    @Test
    void getPredictionById_notFound() {
        when(predictionRepository.findById(999L)).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> predictionService.getPredictionById(999L));

        assertEquals(org.springframework.http.HttpStatus.NOT_FOUND, exception.getStatusCode());
        assertTrue(exception.getReason().contains("999"));

        verify(predictionRepository).findById(999L);
    }

    @Test
    void deletePrediction_success() {
        when(predictionRepository.existsById(1L)).thenReturn(true);

        assertDoesNotThrow(() -> predictionService.deletePrediction(1L));

        verify(predictionRepository).existsById(1L);
        verify(predictionRepository).deleteById(1L);
    }

    @Test
    void deletePrediction_notFound() {
        when(predictionRepository.existsById(999L)).thenReturn(false);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> predictionService.deletePrediction(999L));

        assertEquals(org.springframework.http.HttpStatus.NOT_FOUND, exception.getStatusCode());
        assertTrue(exception.getReason().contains("999"));

        verify(predictionRepository).existsById(999L);
        verify(predictionRepository, never()).deleteById(any());
    }

    @Test
    void clearAllPredictions_success() {
        assertDoesNotThrow(() -> predictionService.clearAllPredictions());

        verify(predictionRepository).deleteAll();
    }

    @Test
    void comparePredictions_success() {
        List<Long> predictionIds = List.of(1L, 2L);
        ComparisonRequest request = new ComparisonRequest(predictionIds);

        PredictionRecord record2 = new PredictionRecord(
                LocalDateTime.now(), 2000.0, 3, 2.0, 2010, 5000.0, 10.0, 8.0, 500000.0
        );
        record2.setId(2L);

        when(predictionRepository.findAllById(predictionIds)).thenReturn(List.of(savedRecord, record2));

        ComparisonResponse response = predictionService.comparePredictions(request);

        assertNotNull(response);
        assertEquals(2, response.getPredictions().size());
        assertEquals(1L, response.getPredictions().get(0).getId());
        assertEquals(350000.0, response.getPredictions().get(0).getPredictedPrice());
        assertEquals(2L, response.getPredictions().get(1).getId());
        assertEquals(500000.0, response.getPredictions().get(1).getPredictedPrice());

        assertNotNull(response.getSummary());
        assertEquals(350000.0, response.getSummary().getMinPrice());
        assertEquals(500000.0, response.getSummary().getMaxPrice());
        assertEquals(425000.0, response.getSummary().getAvgPrice());

        verify(predictionRepository).findAllById(predictionIds);
        verify(predictionRepository, never()).save(any());
        verify(mlApiClient, never()).predictBatch(any());
    }

    @Test
    void comparePredictions_notFound() {
        List<Long> predictionIds = List.of(1L, 999L);
        ComparisonRequest request = new ComparisonRequest(predictionIds);

        when(predictionRepository.findAllById(predictionIds)).thenReturn(List.of(savedRecord));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> predictionService.comparePredictions(request));

        assertEquals(org.springframework.http.HttpStatus.NOT_FOUND, exception.getStatusCode());
        assertTrue(exception.getReason().contains("999"));
    }

    @Test
    void comparePredictions_summaryStatistics() {
        List<Long> predictionIds = List.of(1L, 2L, 3L);
        ComparisonRequest request = new ComparisonRequest(predictionIds);

        PredictionRecord record2 = new PredictionRecord(
                LocalDateTime.now(), 2000.0, 3, 2.0, 2010, 5000.0, 10.0, 8.0, 200000.0
        );
        record2.setId(2L);
        PredictionRecord record3 = new PredictionRecord(
                LocalDateTime.now(), 2000.0, 3, 2.0, 2010, 5000.0, 10.0, 8.0, 300000.0
        );
        record3.setId(3L);

        when(predictionRepository.findAllById(predictionIds))
                .thenReturn(List.of(savedRecord, record2, record3));

        ComparisonResponse response = predictionService.comparePredictions(request);

        assertEquals(200000.0, response.getSummary().getMinPrice());
        assertEquals(350000.0, response.getSummary().getMaxPrice());
        assertEquals((350000.0 + 200000.0 + 300000.0) / 3.0, response.getSummary().getAvgPrice());
    }

    @Test
    void getModelInfo_success() {
        ModelInfoResponse modelInfo = new ModelInfoResponse(
                "Ridge Regression",
                Map.of("square_footage", 150.0),
                50000.0,
                Map.of("r2_score", 0.85)
        );

        when(mlApiClient.getModelInfo()).thenReturn(modelInfo);

        ModelInfoResponse result = predictionService.getModelInfo();

        assertNotNull(result);
        assertEquals("Ridge Regression", result.getModelType());
        assertEquals(50000.0, result.getIntercept());
        assertEquals(150.0, result.getCoefficients().get("square_footage"));
        assertEquals(0.85, result.getMetrics().get("r2_score"));

        verify(mlApiClient).getModelInfo();
    }
}
