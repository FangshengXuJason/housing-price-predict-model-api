package com.housingprice.backend.service;

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
import com.housingprice.backend.model.PredictionRecord;
import com.housingprice.backend.repository.PredictionRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.DoubleSummaryStatistics;
import java.util.List;

@Service
public class PredictionService {

    private final PredictionRepository predictionRepository;
    private final MLApiClientInterface mlApiClient;

    public PredictionService(PredictionRepository predictionRepository, MLApiClientInterface mlApiClient) {
        this.predictionRepository = predictionRepository;
        this.mlApiClient = mlApiClient;
    }

    @Cacheable(value = "predictionResult", key = "T(String).valueOf(#request.features.hashCode())")
    public PredictionResponse createPrediction(SinglePredictionRequestDTO request) {
        HousingFeaturesDTO features = request.getFeatures();
        double predictedPrice = mlApiClient.predict(features);

        PredictionRecord record = new PredictionRecord(
                LocalDateTime.now(),
                features.getSquareFootage(),
                features.getBedrooms(),
                features.getBathrooms(),
                features.getYearBuilt(),
                features.getLotSize(),
                features.getDistanceToCityCenter(),
                features.getSchoolRating(),
                predictedPrice
        );

        PredictionRecord saved = predictionRepository.save(record);
        return PredictionResponse.from(saved);
    }

    public BatchPredictionResponse createBatchPrediction(BatchPredictionRequest request) {
        List<Double> prices = mlApiClient.predictBatch(request.getFeatures());
        List<HousingFeaturesDTO> featuresList = request.getFeatures();

        List<PredictionResponse> responses = new ArrayList<>();
        for (int i = 0; i < featuresList.size(); i++) {
            HousingFeaturesDTO features = featuresList.get(i);
            double price = prices.get(i);

            PredictionRecord record = new PredictionRecord(
                    LocalDateTime.now(),
                    features.getSquareFootage(),
                    features.getBedrooms(),
                    features.getBathrooms(),
                    features.getYearBuilt(),
                    features.getLotSize(),
                    features.getDistanceToCityCenter(),
                    features.getSchoolRating(),
                    price
            );
            PredictionRecord saved = predictionRepository.save(record);
            responses.add(PredictionResponse.from(saved));
        }

        return new BatchPredictionResponse(responses);
    }

    public PredictionHistoryResponse getPredictionHistory(int skip, int limit) {
        PageRequest pageRequest = PageRequest.of(skip / Math.max(limit, 1), Math.max(limit, 1));
        Page<PredictionRecord> page = predictionRepository.findAllByOrderByTimestampDesc(pageRequest);
        List<PredictionResponse> predictions = page.getContent().stream()
                .map(PredictionResponse::from)
                .toList();
        return new PredictionHistoryResponse(predictions, page.getTotalElements());
    }

    public PredictionResponse getPredictionById(Long id) {
        PredictionRecord record = predictionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Prediction with id " + id + " not found"));
        return PredictionResponse.from(record);
    }

    public void deletePrediction(Long id) {
        if (!predictionRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Prediction with id " + id + " not found");
        }
        predictionRepository.deleteById(id);
    }

    @Transactional
    public void clearAllPredictions() {
        predictionRepository.deleteAll();
    }

    public ComparisonResponse comparePredictions(ComparisonRequest request) {
        List<Long> ids = request.getPredictionIds();

        // Look up all predictions by IDs
        List<PredictionRecord> records = predictionRepository.findAllById(ids);

        // Verify all IDs were found
        if (records.size() != ids.size()) {
            List<Long> foundIds = records.stream().map(PredictionRecord::getId).toList();
            List<Long> missingIds = ids.stream().filter(id -> !foundIds.contains(id)).toList();
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Predictions not found for ids: " + missingIds);
        }

        // Build response from stored predictions
        List<PredictionResponse> predictions = records.stream()
                .map(PredictionResponse::from)
                .toList();

        // Calculate summary from stored predicted prices
        List<Double> prices = records.stream()
                .map(PredictionRecord::getPredictedPrice)
                .toList();

        DoubleSummaryStatistics stats = prices.stream()
                .mapToDouble(Double::doubleValue)
                .summaryStatistics();

        ComparisonSummary summary = new ComparisonSummary(
                stats.getMin(),
                stats.getMax(),
                stats.getAverage()
        );

        return new ComparisonResponse(predictions, summary);
    }

    @Cacheable("modelInfo")
    public ModelInfoResponse getModelInfo() {
        return mlApiClient.getModelInfo();
    }
}
