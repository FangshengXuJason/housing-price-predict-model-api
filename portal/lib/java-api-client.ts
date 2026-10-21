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
} from "@/types";

/**
 * Java Backend API Client (Stub)
 * This client will connect to the Java/Spring Boot backend when implemented.
 * Currently all methods throw a "not implemented" error.
 */
class JavaApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = "/java-api") {
    this.baseUrl = baseUrl;
  }

  private notImplemented(method: string): never {
    throw new Error(
      `Java backend method '${method}' is not yet implemented. The Spring Boot backend is under development.`
    );
  }

  async createPrediction(
    _request: SinglePredictionRequest
  ): Promise<SinglePredictionResponse> {
    this.notImplemented("createPrediction");
  }

  async createBatchPredictions(
    _request: BatchPredictionRequest
  ): Promise<BatchPredictionResponse> {
    this.notImplemented("createBatchPredictions");
  }

  async getPredictions(
    _params: PaginationParams
  ): Promise<PredictionHistoryResponse> {
    this.notImplemented("getPredictions");
  }

  async getPredictionById(_id: number): Promise<SinglePredictionResponse> {
    this.notImplemented("getPredictionById");
  }

  async deletePrediction(_id: number): Promise<void> {
    this.notImplemented("deletePrediction");
  }

  async deleteAllPredictions(): Promise<void> {
    this.notImplemented("deleteAllPredictions");
  }

  async comparePredictions(
    _request: ComparisonRequest
  ): Promise<ComparisonResponse> {
    this.notImplemented("comparePredictions");
  }

  async getModelInfo(): Promise<ModelInfoResponse> {
    this.notImplemented("getModelInfo");
  }

  async healthCheck(): Promise<HealthResponse> {
    this.notImplemented("healthCheck");
  }
}

export const javaApiClient = new JavaApiClient();
