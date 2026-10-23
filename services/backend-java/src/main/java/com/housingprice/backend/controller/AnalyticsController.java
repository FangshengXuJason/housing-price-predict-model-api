package com.housingprice.backend.controller;

import com.housingprice.backend.dto.response.AggregateStatisticsResponse;
import com.housingprice.backend.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/statistics")
    public ResponseEntity<AggregateStatisticsResponse> getStatistics() {
        return ResponseEntity.ok(analyticsService.getAggregateStatistics());
    }

    @GetMapping("/price-by-bedroom")
    public ResponseEntity<Map<Integer, Double>> getPriceByBedroom() {
        return ResponseEntity.ok(analyticsService.getPriceByBedroom());
    }

    @GetMapping("/correlation")
    public ResponseEntity<Map<String, Double>> getCorrelations() {
        return ResponseEntity.ok(analyticsService.getFeatureCorrelations());
    }
}
