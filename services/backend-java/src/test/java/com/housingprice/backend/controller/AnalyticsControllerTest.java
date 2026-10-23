package com.housingprice.backend.controller;

import com.housingprice.backend.dto.response.AggregateStatisticsResponse;
import com.housingprice.backend.dto.response.AggregateStatisticsResponse.FeatureStatistics;
import com.housingprice.backend.service.AnalyticsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.LinkedHashMap;
import java.util.Map;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AnalyticsController.class)
class AnalyticsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AnalyticsService analyticsService;

    @Test
    void getStatistics_success() throws Exception {
        FeatureStatistics priceStats = new FeatureStatistics(350000.0, 345000.0, 50000.0, 200000.0, 500000.0, 300000.0, 345000.0, 400000.0);
        Map<String, FeatureStatistics> featureStats = new LinkedHashMap<>();
        featureStats.put("square_footage", new FeatureStatistics(2000.0, 2000.0, 500.0, 1000.0, 3000.0, 1500.0, 2000.0, 2500.0));

        Map<Integer, Double> priceByBedroom = Map.of(2, 250000.0, 3, 350000.0, 4, 450000.0);
        Map<String, Double> correlations = Map.of("square_footage", 0.85, "bedrooms", 0.72);

        AggregateStatisticsResponse response = new AggregateStatisticsResponse(
                100L, priceStats, featureStats, priceByBedroom, correlations
        );

        when(analyticsService.getAggregateStatistics()).thenReturn(response);

        mockMvc.perform(get("/api/analytics/statistics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(100))
                .andExpect(jsonPath("$.price_statistics.mean").value(350000.0))
                .andExpect(jsonPath("$.price_statistics.median").value(345000.0))
                .andExpect(jsonPath("$.price_statistics.min").value(200000.0))
                .andExpect(jsonPath("$.price_statistics.max").value(500000.0))
                .andExpect(jsonPath("$.feature_statistics.square_footage.mean").value(2000.0))
                .andExpect(jsonPath("$.price_by_bedroom.2").value(250000.0))
                .andExpect(jsonPath("$.price_by_bedroom.3").value(350000.0))
                .andExpect(jsonPath("$.correlations.square_footage").value(0.85));
    }

    @Test
    void getPriceByBedroom_success() throws Exception {
        Map<Integer, Double> priceByBedroom = new LinkedHashMap<>();
        priceByBedroom.put(1, 150000.0);
        priceByBedroom.put(2, 250000.0);
        priceByBedroom.put(3, 350000.0);

        when(analyticsService.getPriceByBedroom()).thenReturn(priceByBedroom);

        mockMvc.perform(get("/api/analytics/price-by-bedroom"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.1").value(150000.0))
                .andExpect(jsonPath("$.2").value(250000.0))
                .andExpect(jsonPath("$.3").value(350000.0));
    }

    @Test
    void getCorrelations_success() throws Exception {
        Map<String, Double> correlations = new LinkedHashMap<>();
        correlations.put("square_footage", 0.85);
        correlations.put("bedrooms", 0.72);
        correlations.put("bathrooms", 0.68);

        when(analyticsService.getFeatureCorrelations()).thenReturn(correlations);

        mockMvc.perform(get("/api/analytics/correlation"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.square_footage").value(0.85))
                .andExpect(jsonPath("$.bedrooms").value(0.72))
                .andExpect(jsonPath("$.bathrooms").value(0.68));
    }
}
