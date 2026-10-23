package com.housingprice.backend.dto.response;

import java.util.Map;

public class AggregateStatisticsResponse {

    private long count;
    private FeatureStatistics priceStatistics;
    private Map<String, FeatureStatistics> featureStatistics;
    private Map<Integer, Double> priceByBedroom;
    private Map<String, Double> correlations;

    public AggregateStatisticsResponse() {
    }

    public AggregateStatisticsResponse(long count, FeatureStatistics priceStatistics,
                                       Map<String, FeatureStatistics> featureStatistics,
                                       Map<Integer, Double> priceByBedroom,
                                       Map<String, Double> correlations) {
        this.count = count;
        this.priceStatistics = priceStatistics;
        this.featureStatistics = featureStatistics;
        this.priceByBedroom = priceByBedroom;
        this.correlations = correlations;
    }

    public long getCount() {
        return count;
    }

    public void setCount(long count) {
        this.count = count;
    }

    public FeatureStatistics getPriceStatistics() {
        return priceStatistics;
    }

    public void setPriceStatistics(FeatureStatistics priceStatistics) {
        this.priceStatistics = priceStatistics;
    }

    public Map<String, FeatureStatistics> getFeatureStatistics() {
        return featureStatistics;
    }

    public void setFeatureStatistics(Map<String, FeatureStatistics> featureStatistics) {
        this.featureStatistics = featureStatistics;
    }

    public Map<Integer, Double> getPriceByBedroom() {
        return priceByBedroom;
    }

    public void setPriceByBedroom(Map<Integer, Double> priceByBedroom) {
        this.priceByBedroom = priceByBedroom;
    }

    public Map<String, Double> getCorrelations() {
        return correlations;
    }

    public void setCorrelations(Map<String, Double> correlations) {
        this.correlations = correlations;
    }

    @Override
    public String toString() {
        return "AggregateStatisticsResponse{" +
                "count=" + count +
                '}';
    }

    public static class FeatureStatistics {

        private double mean;
        private double median;
        private double stdDev;
        private double min;
        private double max;
        private double q25;
        private double q50;
        private double q75;

        public FeatureStatistics() {
        }

        public FeatureStatistics(double mean, double median, double stdDev, double min,
                                 double max, double q25, double q50, double q75) {
            this.mean = mean;
            this.median = median;
            this.stdDev = stdDev;
            this.min = min;
            this.max = max;
            this.q25 = q25;
            this.q50 = q50;
            this.q75 = q75;
        }

        public double getMean() {
            return mean;
        }

        public void setMean(double mean) {
            this.mean = mean;
        }

        public double getMedian() {
            return median;
        }

        public void setMedian(double median) {
            this.median = median;
        }

        public double getStdDev() {
            return stdDev;
        }

        public void setStdDev(double stdDev) {
            this.stdDev = stdDev;
        }

        public double getMin() {
            return min;
        }

        public void setMin(double min) {
            this.min = min;
        }

        public double getMax() {
            return max;
        }

        public void setMax(double max) {
            this.max = max;
        }

        public double getQ25() {
            return q25;
        }

        public void setQ25(double q25) {
            this.q25 = q25;
        }

        public double getQ50() {
            return q50;
        }

        public void setQ50(double q50) {
            this.q50 = q50;
        }

        public double getQ75() {
            return q75;
        }

        public void setQ75(double q75) {
            this.q75 = q75;
        }

        @Override
        public String toString() {
            return "FeatureStatistics{" +
                    "mean=" + mean +
                    ", median=" + median +
                    ", stdDev=" + stdDev +
                    ", min=" + min +
                    ", max=" + max +
                    '}';
        }
    }
}
