import {
  SinglePredictionRequest,
  SinglePredictionResponse,
  BatchPredictionRequest,
  BatchPredictionResponse,
  PredictionHistoryResponse,
  ComparisonRequest,
  ComparisonResponse,
  ModelInfoResponse,
  HealthResponse,
  PaginationParams,
  ApiError,
  AggregateStatisticsResponse,
  HousingRecord,
} from "@/types";

class JavaApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = "/java-api") {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let errorDetail = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorDetail = errorData.detail || errorData.message || errorDetail;
        } catch {
          // Response is not JSON, use default error message
        }

        const error: ApiError = {
          detail: errorDetail,
          status: response.status,
        };
        throw error;
      }

      // Handle 204 No Content or empty responses
      if (response.status === 204) {
        return {} as T;
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      // If it's already an ApiError, rethrow it
      if (error && typeof error === "object" && "detail" in error) {
        throw error;
      }

      // Otherwise, wrap it in an ApiError
      const apiError: ApiError = {
        detail:
          error instanceof Error
            ? error.message
            : "An unknown error occurred",
        status: 0,
      };
      throw apiError;
    }
  }

  // Prediction endpoints
  async createPrediction(
    request: SinglePredictionRequest
  ): Promise<SinglePredictionResponse> {
    return this.request<SinglePredictionResponse>("/predictions", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async createBatchPredictions(
    request: BatchPredictionRequest
  ): Promise<BatchPredictionResponse> {
    return this.request<BatchPredictionResponse>("/predictions/batch", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async getPredictions(
    params: PaginationParams
  ): Promise<PredictionHistoryResponse> {
    const queryString = new URLSearchParams({
      skip: params.skip.toString(),
      limit: params.limit.toString(),
    }).toString();
    return this.request<PredictionHistoryResponse>(
      `/predictions?${queryString}`
    );
  }

  async getPredictionById(id: number): Promise<SinglePredictionResponse> {
    return this.request<SinglePredictionResponse>(`/predictions/${id}`);
  }

  async deletePrediction(id: number): Promise<void> {
    return this.request<void>(`/predictions/${id}`, {
      method: "DELETE",
    });
  }

  async deleteAllPredictions(): Promise<void> {
    return this.request<void>("/predictions", {
      method: "DELETE",
    });
  }

  // Comparison endpoints
  async comparePredictions(
    request: ComparisonRequest
  ): Promise<ComparisonResponse> {
    return this.request<ComparisonResponse>("/predictions/compare", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  // Model info
  async getModelInfo(): Promise<ModelInfoResponse> {
    return this.request<ModelInfoResponse>("/model-info");
  }

  // Health
  async healthCheck(): Promise<HealthResponse> {
    return this.request<HealthResponse>("/health");
  }

  // Analytics endpoints (Java backend only)
  async getStatistics(): Promise<AggregateStatisticsResponse> {
    return this.request<AggregateStatisticsResponse>("/analytics/statistics");
  }

  async getPriceByBedroom(): Promise<Record<number, number>> {
    return this.request<Record<number, number>>("/analytics/price-by-bedroom");
  }

  async getCorrelations(): Promise<Record<string, number>> {
    return this.request<Record<string, number>>("/analytics/correlation");
  }

  // Dashboard data endpoint
  async getHousingData(): Promise<HousingRecord[]> {
    return this.request<HousingRecord[]>("/dashboard/data");
  }
}

// Export singleton instance
export const javaApiClient = new JavaApiClient();
