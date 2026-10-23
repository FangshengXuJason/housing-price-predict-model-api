package com.housingprice.backend.service;

import com.housingprice.backend.dto.response.AggregateStatisticsResponse;
import com.housingprice.backend.model.HousingData;
import com.housingprice.backend.repository.HousingDataRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock
    private HousingDataRepository housingDataRepository;

    @InjectMocks
    private AnalyticsService analyticsService;

    private List<HousingData> sampleData;

    @BeforeEach
    void setUp() {
        sampleData = List.of(
                new HousingData(1, 1500.0, 2, 1.0, 2000, 3000.0, 5.0, 7.0, 250000.0),
                new HousingData(2, 2000.0, 3, 2.0, 2010, 5000.0, 10.0, 8.0, 350000.0),
                new HousingData(3, 2500.0, 3, 2.5, 2015, 6000.0, 12.0, 9.0, 450000.0),
                new HousingData(4, 3000.0, 4, 3.0, 2020, 8000.0, 15.0, 10.0, 600000.0)
        );
    }

    @Test
    void getAggregateStatistics_success() {
        when(housingDataRepository.findAll()).thenReturn(sampleData);

        AggregateStatisticsResponse result = analyticsService.getAggregateStatistics();

        assertNotNull(result);
        assertEquals(4L, result.getCount());

        assertNotNull(result.getPriceStatistics());
        assertEquals(412500.0, result.getPriceStatistics().getMean());
        assertEquals(250000.0, result.getPriceStatistics().getMin());
        assertEquals(600000.0, result.getPriceStatistics().getMax());

        assertNotNull(result.getFeatureStatistics());
        assertTrue(result.getFeatureStatistics().containsKey("square_footage"));
        assertTrue(result.getFeatureStatistics().containsKey("bedrooms"));
        assertTrue(result.getFeatureStatistics().containsKey("bathrooms"));
        assertTrue(result.getFeatureStatistics().containsKey("year_built"));
        assertTrue(result.getFeatureStatistics().containsKey("lot_size"));
        assertTrue(result.getFeatureStatistics().containsKey("distance_to_city_center"));
        assertTrue(result.getFeatureStatistics().containsKey("school_rating"));

        assertNotNull(result.getPriceByBedroom());
        assertNotNull(result.getCorrelations());
    }

    @Test
    void getAggregateStatistics_priceStatisticsValues() {
        when(housingDataRepository.findAll()).thenReturn(sampleData);

        AggregateStatisticsResponse result = analyticsService.getAggregateStatistics();

        assertEquals(412500.0, result.getPriceStatistics().getMean());
        assertEquals(400000.0, result.getPriceStatistics().getMedian());
        assertTrue(result.getPriceStatistics().getStdDev() > 0);
        assertEquals(250000.0, result.getPriceStatistics().getMin());
        assertEquals(600000.0, result.getPriceStatistics().getMax());
    }

    @Test
    void getPriceByBedroom_success() {
        when(housingDataRepository.findAll()).thenReturn(sampleData);

        Map<Integer, Double> result = analyticsService.getPriceByBedroom();

        assertNotNull(result);
        assertEquals(3, result.size());
        assertEquals(250000.0, result.get(2));
        assertEquals(400000.0, result.get(3));
        assertEquals(600000.0, result.get(4));
    }

    @Test
    void getPriceByBedroom_groupingAndAveraging() {
        List<HousingData> dataWithDuplicates = List.of(
                new HousingData(1, 1500.0, 2, 1.0, 2000, 3000.0, 5.0, 7.0, 200000.0),
                new HousingData(2, 1800.0, 2, 1.5, 2005, 3500.0, 6.0, 7.5, 300000.0),
                new HousingData(3, 2500.0, 3, 2.0, 2010, 5000.0, 10.0, 8.0, 400000.0)
        );

        when(housingDataRepository.findAll()).thenReturn(dataWithDuplicates);

        Map<Integer, Double> result = analyticsService.getPriceByBedroom();

        assertEquals(2, result.size());
        assertEquals(250000.0, result.get(2));
        assertEquals(400000.0, result.get(3));
    }

    @Test
    void getFeatureCorrelations_success() {
        when(housingDataRepository.findAll()).thenReturn(sampleData);

        Map<String, Double> result = analyticsService.getFeatureCorrelations();

        assertNotNull(result);
        assertEquals(7, result.size());
        assertTrue(result.containsKey("square_footage"));
        assertTrue(result.containsKey("bedrooms"));
        assertTrue(result.containsKey("bathrooms"));
        assertTrue(result.containsKey("year_built"));
        assertTrue(result.containsKey("lot_size"));
        assertTrue(result.containsKey("distance_to_city_center"));
        assertTrue(result.containsKey("school_rating"));

        result.values().forEach(correlation -> {
            assertTrue(correlation >= -1.0 && correlation <= 1.0);
        });
    }

    @Test
    void getFeatureCorrelations_positiveCorrelation() {
        when(housingDataRepository.findAll()).thenReturn(sampleData);

        Map<String, Double> result = analyticsService.getFeatureCorrelations();

        assertTrue(result.get("square_footage") > 0, "Square footage should have positive correlation with price");
        assertTrue(result.get("bedrooms") > 0, "Bedrooms should have positive correlation with price");
    }

    @Test
    void getAggregateStatistics_emptyData() {
        when(housingDataRepository.findAll()).thenReturn(List.of());

        // The production code does not handle empty data gracefully (median crashes on empty list)
        assertThrows(IndexOutOfBoundsException.class,
                () -> analyticsService.getAggregateStatistics());
    }

    @Test
    void getPriceByBedroom_emptyData() {
        when(housingDataRepository.findAll()).thenReturn(List.of());

        Map<Integer, Double> result = analyticsService.getPriceByBedroom();

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void getFeatureCorrelations_emptyData() {
        when(housingDataRepository.findAll()).thenReturn(List.of());

        Map<String, Double> result = analyticsService.getFeatureCorrelations();

        assertNotNull(result);
        assertEquals(7, result.size());
        result.values().forEach(correlation -> assertEquals(0.0, correlation));
    }
}
