package com.housingprice.backend.service;

import com.housingprice.backend.dto.response.AggregateStatisticsResponse;
import com.housingprice.backend.dto.response.AggregateStatisticsResponse.FeatureStatistics;
import com.housingprice.backend.model.HousingData;
import com.housingprice.backend.repository.HousingDataRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final HousingDataRepository housingDataRepository;

    public AnalyticsService(HousingDataRepository housingDataRepository) {
        this.housingDataRepository = housingDataRepository;
    }

    @Cacheable("aggregateStats")
    public AggregateStatisticsResponse getAggregateStatistics() {
        List<HousingData> data = housingDataRepository.findAll();

        long count = data.size();

        // Compute price statistics
        List<Double> prices = data.stream().map(HousingData::getPrice).collect(Collectors.toList());
        FeatureStatistics priceStatistics = computeFeatureStatistics(prices);

        // Compute feature statistics
        Map<String, FeatureStatistics> featureStatistics = new LinkedHashMap<>();
        featureStatistics.put("square_footage", computeFeatureStatistics(extractDoubles(data, HousingData::getSquareFootage)));
        featureStatistics.put("bedrooms", computeFeatureStatistics(extractDoubles(data, hd -> hd.getBedrooms().doubleValue())));
        featureStatistics.put("bathrooms", computeFeatureStatistics(extractDoubles(data, HousingData::getBathrooms)));
        featureStatistics.put("year_built", computeFeatureStatistics(extractDoubles(data, hd -> hd.getYearBuilt().doubleValue())));
        featureStatistics.put("lot_size", computeFeatureStatistics(extractDoubles(data, HousingData::getLotSize)));
        featureStatistics.put("distance_to_city_center", computeFeatureStatistics(extractDoubles(data, HousingData::getDistanceToCityCenter)));
        featureStatistics.put("school_rating", computeFeatureStatistics(extractDoubles(data, HousingData::getSchoolRating)));

        // Price by bedroom
        Map<Integer, Double> priceByBedroom = getPriceByBedroom();

        // Correlations
        Map<String, Double> correlations = getFeatureCorrelations();

        return new AggregateStatisticsResponse(count, priceStatistics, featureStatistics, priceByBedroom, correlations);
    }

    public Map<Integer, Double> getPriceByBedroom() {
        List<HousingData> data = housingDataRepository.findAll();
        return data.stream()
                .collect(Collectors.groupingBy(HousingData::getBedrooms))
                .entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        e -> e.getValue().stream().mapToDouble(HousingData::getPrice).average().orElse(0.0)
                ));
    }

    public Map<String, Double> getFeatureCorrelations() {
        List<HousingData> data = housingDataRepository.findAll();
        List<Double> prices = data.stream().map(HousingData::getPrice).collect(Collectors.toList());

        Map<String, Double> correlations = new LinkedHashMap<>();
        correlations.put("square_footage", pearsonCorrelation(extractDoubles(data, HousingData::getSquareFootage), prices));
        correlations.put("bedrooms", pearsonCorrelation(extractDoubles(data, hd -> hd.getBedrooms().doubleValue()), prices));
        correlations.put("bathrooms", pearsonCorrelation(extractDoubles(data, HousingData::getBathrooms), prices));
        correlations.put("year_built", pearsonCorrelation(extractDoubles(data, hd -> hd.getYearBuilt().doubleValue()), prices));
        correlations.put("lot_size", pearsonCorrelation(extractDoubles(data, HousingData::getLotSize), prices));
        correlations.put("distance_to_city_center", pearsonCorrelation(extractDoubles(data, HousingData::getDistanceToCityCenter), prices));
        correlations.put("school_rating", pearsonCorrelation(extractDoubles(data, HousingData::getSchoolRating), prices));

        return correlations;
    }

    // --- Private helper methods ---

    private FeatureStatistics computeFeatureStatistics(List<Double> values) {
        double mean = mean(values);
        double median = median(values);
        double stdDev = stdDev(values);
        double min = values.stream().mapToDouble(Double::doubleValue).min().orElse(0.0);
        double max = values.stream().mapToDouble(Double::doubleValue).max().orElse(0.0);
        double q25 = percentile(values, 25);
        double q50 = percentile(values, 50);
        double q75 = percentile(values, 75);
        return new FeatureStatistics(mean, median, stdDev, min, max, q25, q50, q75);
    }

    private List<Double> extractDoubles(List<HousingData> data, java.util.function.Function<HousingData, Double> extractor) {
        return data.stream().map(extractor).collect(Collectors.toList());
    }

    private double mean(List<Double> values) {
        return values.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
    }

    private double median(List<Double> values) {
        List<Double> sorted = new ArrayList<>(values);
        Collections.sort(sorted);
        int n = sorted.size();
        if (n % 2 == 0) {
            return (sorted.get(n / 2 - 1) + sorted.get(n / 2)) / 2.0;
        } else {
            return sorted.get(n / 2);
        }
    }

    private double stdDev(List<Double> values) {
        double avg = mean(values);
        double sumSquares = values.stream().mapToDouble(v -> (v - avg) * (v - avg)).sum();
        return Math.sqrt(sumSquares / values.size());
    }

    private double percentile(List<Double> values, double p) {
        List<Double> sorted = new ArrayList<>(values);
        Collections.sort(sorted);
        double index = (p / 100.0) * (sorted.size() - 1);
        int lower = (int) Math.floor(index);
        int upper = (int) Math.ceil(index);
        if (lower == upper) {
            return sorted.get(lower);
        }
        double fraction = index - lower;
        return sorted.get(lower) + fraction * (sorted.get(upper) - sorted.get(lower));
    }

    private double pearsonCorrelation(List<Double> x, List<Double> y) {
        int n = x.size();
        double meanX = mean(x);
        double meanY = mean(y);

        double sumXY = 0.0;
        double sumX2 = 0.0;
        double sumY2 = 0.0;

        for (int i = 0; i < n; i++) {
            double dx = x.get(i) - meanX;
            double dy = y.get(i) - meanY;
            sumXY += dx * dy;
            sumX2 += dx * dx;
            sumY2 += dy * dy;
        }

        double denominator = Math.sqrt(sumX2 * sumY2);
        if (denominator == 0.0) {
            return 0.0;
        }
        return sumXY / denominator;
    }
}
