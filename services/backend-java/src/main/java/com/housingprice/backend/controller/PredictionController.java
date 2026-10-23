package com.housingprice.backend.controller;

import com.housingprice.backend.dto.request.BatchPredictionRequest;
import com.housingprice.backend.dto.request.ComparisonRequest;
import com.housingprice.backend.dto.request.SinglePredictionRequestDTO;
import com.housingprice.backend.dto.response.BatchPredictionResponse;
import com.housingprice.backend.dto.response.ComparisonResponse;
import com.housingprice.backend.dto.response.ModelInfoResponse;
import com.housingprice.backend.dto.response.PredictionHistoryResponse;
import com.housingprice.backend.dto.response.PredictionResponse;
import com.housingprice.backend.service.PredictionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class PredictionController {

    private final PredictionService predictionService;

    public PredictionController(PredictionService predictionService) {
        this.predictionService = predictionService;
    }

    @PostMapping("/predictions")
    public ResponseEntity<PredictionResponse> createPrediction(
            @Valid @RequestBody SinglePredictionRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(predictionService.createPrediction(request));
    }

    @PostMapping("/predictions/batch")
    public ResponseEntity<BatchPredictionResponse> batchPredict(
            @Valid @RequestBody BatchPredictionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(predictionService.createBatchPrediction(request));
    }

    @GetMapping("/predictions")
    public ResponseEntity<PredictionHistoryResponse> getHistory(
            @RequestParam(defaultValue = "0") int skip,
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(predictionService.getPredictionHistory(skip, limit));
    }

    @GetMapping("/predictions/{id}")
    public ResponseEntity<PredictionResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(predictionService.getPredictionById(id));
    }

    @DeleteMapping("/predictions/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        predictionService.deletePrediction(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/predictions")
    public ResponseEntity<Void> clearAll() {
        predictionService.clearAllPredictions();
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/predictions/compare")
    public ResponseEntity<ComparisonResponse> compare(
            @Valid @RequestBody ComparisonRequest request) {
        return ResponseEntity.ok(predictionService.comparePredictions(request));
    }

    @GetMapping("/model-info")
    public ResponseEntity<ModelInfoResponse> getModelInfo() {
        return ResponseEntity.ok(predictionService.getModelInfo());
    }
}
