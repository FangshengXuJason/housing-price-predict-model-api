// The 7 model features
export interface HousingFeatures {
  square_footage: number; // > 0
  bedrooms: number; // >= 1, integer
  bathrooms: number; // >= 0.5
  year_built: number; // 1900-2026, integer
  lot_size: number; // > 0
  distance_to_city_center: number; // >= 0
  school_rating: number; // 1-10
}

export interface SinglePredictionRequest {
  features: HousingFeatures;
}

export interface SinglePredictionResponse {
  id: number;
  timestamp: string;
  features: HousingFeatures;
  predicted_price: number;
}

export interface BatchPredictionRequest {
  features_list: HousingFeatures[];
}

export interface BatchPredictionResponse {
  predictions: SinglePredictionResponse[];
}

export interface PredictionHistoryResponse {
  predictions: SinglePredictionResponse[];
  total: number;
}

export interface ComparisonRequest {
  prediction_ids: number[];
}

export interface ComparisonSummary {
  min_price: number;
  max_price: number;
  avg_price: number;
}

export interface ComparisonResponse {
  predictions: SinglePredictionResponse[];
  summary: ComparisonSummary;
}

export interface ModelInfoResponse {
  model_type: string;
  coefficients: Record<string, number>;
  intercept: number;
  metrics: Record<string, number>;
  scaled_coefficients?: Record<string, number>;
  scaled_intercept?: number;
}

export interface HealthResponse {
  status: "ok" | "degraded";
  ml_api_status: "ok" | "unavailable";
}

export interface ApiError {
  detail: string;
  status?: number;
}

export interface PaginationParams {
  skip: number;
  limit: number;
}

export interface FeatureStatistics {
  mean: number;
  median: number;
  std_dev: number;
  min: number;
  max: number;
  q25: number;
  q50: number;
  q75: number;
}

export interface HousingRecord {
  id: number;
  square_footage: number;
  bedrooms: number;
  bathrooms: number;
  year_built: number;
  lot_size: number;
  distance_to_city_center: number;
  school_rating: number;
  price: number;
}

export interface AggregateStatisticsResponse {
  count: number;
  price_statistics: FeatureStatistics;
  feature_statistics: Record<string, FeatureStatistics>;
  price_by_bedroom: Record<number, number>;
  correlations: Record<string, number>;
}
