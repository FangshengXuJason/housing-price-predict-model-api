"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { javaApiClient } from "@/lib/java-api-client";
import { FEATURE_CONSTRAINTS } from "@/lib/constants";
import type {
  HousingFeatures,
  SinglePredictionResponse,
  ModelInfoResponse,
  ApiError,
} from "@/types";
import { Button, Card, CardBody, Badge, Alert, Spinner, Skeleton } from "@/components/ui";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui";
import ComparisonChart from "@/components/charts/ComparisonChart";
import ComparisonSummary from "@/components/ComparisonSummary";
import FeatureContributionChart from "@/components/charts/FeatureContributionChart";
import AnalyticsSidebar from "./AnalyticsSidebar";

interface Scenario {
  id: string;
  name: string;
  features: HousingFeatures;
  prediction: SinglePredictionResponse;
}

const DEFAULT_FEATURES: HousingFeatures = {
  square_footage: 1500,
  bedrooms: 3,
  bathrooms: 2,
  year_built: 2000,
  lot_size: 5000,
  distance_to_city_center: 5,
  school_rating: 7,
};

const FEATURE_KEYS = Object.keys(DEFAULT_FEATURES) as (keyof HousingFeatures)[];

const FEATURE_LABELS: Record<string, string> = {
  square_footage: "Square Footage",
  bedrooms: "Bedrooms",
  bathrooms: "Bathrooms",
  year_built: "Year Built",
  lot_size: "Lot Size",
  distance_to_city_center: "Distance to City",
  school_rating: "School Rating",
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format an API error into a user-friendly message.
 * Detects network/proxy failures (status 0 or 5xx) and shows actionable guidance.
 */
function formatApiError(err: ApiError): string {
  // Network error: fetch failed entirely (backend not running, DNS, CORS, etc.)
  if (!err.status || err.status === 0) {
    return "Prediction service is unavailable. Please ensure the Java backend and ML API are running.";
  }
  // Proxy / gateway errors from Next.js rewrite
  if (err.status >= 500) {
    return "Prediction service is unavailable (server error). Please ensure the Java backend and ML API are running.";
  }
  // Business-level errors from the backend
  return err.detail || "Prediction failed. Please try again.";
}

export default function WhatIfAnalysis() {
  const [features, setFeatures] = useState<HousingFeatures>(DEFAULT_FEATURES);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionError, setPredictionError] = useState<string | null>(null);
  const [currentPrediction, setCurrentPrediction] = useState<SinglePredictionResponse | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [modelInfo, setModelInfo] = useState<ModelInfoResponse | null>(null);
  const [activeFeatureTab, setActiveFeatureTab] = useState(0);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch model info on mount for FeatureContributionChart
  useEffect(() => {
    const fetchModelInfo = async () => {
      try {
        const info = await javaApiClient.getModelInfo();
        setModelInfo(info);
      } catch {
        // Use defaults if model info fails
      }
    };
    fetchModelInfo();
  }, []);

  // Debounced prediction when features change
  const debouncedPredict = useCallback(
    (featureValues: HousingFeatures) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        setIsPredicting(true);
        setPredictionError(null);
        try {
          const result = await javaApiClient.createPrediction({ features: featureValues });
          setCurrentPrediction(result);
        } catch (err) {
          const apiError = err as ApiError;
          setPredictionError(formatApiError(apiError));
        } finally {
          setIsPredicting(false);
        }
      }, 300);
    },
    []
  );

  const handleFeatureChange = (key: keyof HousingFeatures, value: number) => {
    const newFeatures = { ...features, [key]: value };
    setFeatures(newFeatures);
    debouncedPredict(newFeatures);
  };

  const handleReset = () => {
    setFeatures(DEFAULT_FEATURES);
    setCurrentPrediction(null);
    setPredictionError(null);
    debouncedPredict(DEFAULT_FEATURES);
  };

  const handlePredict = async () => {
    setIsPredicting(true);
    setPredictionError(null);
    try {
      const result = await javaApiClient.createPrediction({ features });
      setCurrentPrediction(result);
    } catch (err) {
      const apiError = err as ApiError;
      setPredictionError(formatApiError(apiError));
    } finally {
      setIsPredicting(false);
    }
  };

  const handleSaveScenario = () => {
    if (!currentPrediction) return;
    if (scenarios.length >= 5) return;
    const newScenario: Scenario = {
      id: `scenario-${Date.now()}`,
      name: `Scenario ${scenarios.length + 1}`,
      features: { ...features },
      prediction: currentPrediction,
    };
    setScenarios((prev) => [...prev, newScenario]);
  };

  const handleRemoveScenario = (id: string) => {
    setScenarios((prev) => prev.filter((s) => s.id !== id));
    setActiveFeatureTab(0);
  };

  // Compute comparison summary from scenarios
  const comparisonSummary = (() => {
    if (scenarios.length < 2) return null;
    const prices = scenarios.map((s) => s.prediction.predicted_price);
    return {
      min_price: Math.min(...prices),
      max_price: Math.max(...prices),
      avg_price: prices.reduce((a, b) => a + b, 0) / prices.length,
    };
  })();

  // Feature difference stats for table
  const featureAverages = (() => {
    if (scenarios.length < 2) return null;
    const avgs: Record<string, number> = {};
    FEATURE_KEYS.forEach((key) => {
      const values = scenarios.map((s) => s.features[key]);
      avgs[key] = values.reduce((a, b) => a + b, 0) / values.length;
    });
    return avgs;
  })();

  const getFeatureValueClass = (key: string, value: number): string => {
    if (!featureAverages) return "";
    const avg = featureAverages[key];
    if (value > avg * 1.1) return "text-primary-700 dark:text-primary-400 font-semibold";
    if (value < avg * 0.9) return "text-rose-600 dark:text-rose-400 font-semibold";
    return "text-secondary-700 dark:text-secondary-300";
  };

  const scenarioPredictions: SinglePredictionResponse[] = scenarios.map((s) => s.prediction);

  return (
    <>
      {/* Analytics toggle button */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={() => setShowAnalytics(!showAnalytics)}
          className="bg-amber-500 hover:bg-amber-600 text-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-105"
          aria-label={showAnalytics ? "Hide analytics" : "Show analytics"}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
        </button>
      </div>

      <AnalyticsSidebar
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
        currentPredictionPrice={currentPrediction?.predicted_price}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Inputs & Scenarios */}
        <div className="space-y-6">
          {/* Feature Inputs */}
          <Card>
            <CardBody>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-secondary-900 dark:text-secondary-100">
                  Property Features
                </h2>
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  Reset to Defaults
                </Button>
              </div>

              <div className="space-y-5">
                {FEATURE_KEYS.map((key) => {
                  const constraint = FEATURE_CONSTRAINTS[key];
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <label
                          htmlFor={`slider-${key}`}
                          className="text-sm font-medium text-secondary-700 dark:text-secondary-300"
                        >
                          {constraint.label}
                        </label>
                        <input
                          type="number"
                          id={`input-${key}`}
                          value={features[key]}
                          min={constraint.min}
                          max={constraint.max}
                          step={constraint.step}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val) && val >= constraint.min && val <= constraint.max) {
                              handleFeatureChange(key, val);
                            }
                          }}
                          className="w-24 px-2 py-1 text-sm text-right border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-secondary-800 dark:border-secondary-600 dark:text-secondary-100 tabular-nums"
                          aria-label={`${constraint.label} value`}
                        />
                      </div>
                      <input
                        type="range"
                        id={`slider-${key}`}
                        value={features[key]}
                        min={constraint.min}
                        max={constraint.max}
                        step={constraint.step}
                        onChange={(e) => handleFeatureChange(key, parseFloat(e.target.value))}
                        className="w-full h-2 bg-secondary-200 dark:bg-secondary-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        aria-label={`${constraint.label} slider`}
                      />
                      <div className="flex justify-between text-xs text-secondary-400 mt-0.5">
                        <span>{constraint.min}</span>
                        <span>{constraint.max}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>

          {/* Prediction Result */}
          <Card>
            <CardBody>
              <h2 className="text-lg font-bold text-secondary-900 dark:text-secondary-100 mb-4">
                Prediction
              </h2>

              {/* Empty state: no prediction yet, no error, not loading */}
              {!currentPrediction && !predictionError && !isPredicting && (
                <div className="text-center py-10">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <svg className="w-7 h-7 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
                    No Prediction Yet
                  </h3>
                  <ul className="text-sm text-secondary-500 dark:text-secondary-400 space-y-1.5 max-w-sm mx-auto mb-6">
                    <li>Adjust the property features using the sliders above</li>
                    <li>Click <span className="font-medium text-secondary-700 dark:text-secondary-300">&quot;Predict&quot;</span> to estimate the price</li>
                    <li>Save results as scenarios to compare side-by-side</li>
                  </ul>
                  <Button
                    variant="primary"
                    onClick={handlePredict}
                    disabled={isPredicting}
                    className="bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 px-8"
                  >
                    Predict Price
                  </Button>
                </div>
              )}

              {/* Error state */}
              {predictionError && (
                <Alert variant="error" title="Prediction failed">
                  {predictionError}
                </Alert>
              )}

              {/* Loading state (only when we already have a prediction or explicit predict) */}
              {isPredicting && !currentPrediction && (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-8 w-3/4" />
                </div>
              )}

              {/* Prediction result */}
              {currentPrediction && (
                <div className="mb-4">
                  <div className="text-center py-6 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/10 rounded-lg border border-amber-200 dark:border-amber-800">
                    <p className="text-sm text-amber-700 dark:text-amber-400 font-medium mb-1">
                      Predicted Value
                    </p>
                    <p className="text-4xl font-bold text-amber-700 dark:text-amber-300">
                      {formatCurrency(currentPrediction.predicted_price)}
                    </p>
                    <Badge variant="primary" size="sm" className="mt-2">
                      ID: #{currentPrediction.id}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Action buttons (shown after first prediction or alongside error) */}
              {(currentPrediction || predictionError) && (
                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    onClick={handlePredict}
                    disabled={isPredicting}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 focus:ring-amber-500"
                  >
                    {isPredicting ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Predicting...
                      </>
                    ) : (
                      "Predict Again"
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleSaveScenario}
                    disabled={!currentPrediction || scenarios.length >= 5}
                    className="flex-1"
                  >
                    Save as Scenario
                  </Button>
                </div>
              )}
              {scenarios.length >= 5 && (currentPrediction || predictionError) && (
                <p className="text-xs text-secondary-500 mt-2 text-center">
                  Maximum of 5 scenarios reached
                </p>
              )}
            </CardBody>
          </Card>

          {/* Scenario Cards */}
          {scenarios.length > 0 && (
            <Card>
              <CardBody>
                <h2 className="text-lg font-bold text-secondary-900 dark:text-secondary-100 mb-4">
                  Saved Scenarios ({scenarios.length}/5)
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                  {scenarios.map((scenario) => (
                    <div
                      key={scenario.id}
                      className="border border-secondary-200 dark:border-secondary-700 rounded-lg p-4 hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-secondary-900 dark:text-secondary-100 text-sm">
                            {scenario.name}
                          </h3>
                          <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                            {formatCurrency(scenario.prediction.predicted_price)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveScenario(scenario.id)}
                          className="text-secondary-400 hover:text-rose-500 transition-colors p-1"
                          aria-label={`Remove ${scenario.name}`}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                        {FEATURE_KEYS.map((key) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-secondary-500 dark:text-secondary-400 truncate">
                              {FEATURE_LABELS[key]}:
                            </span>
                            <span className="font-medium text-secondary-700 dark:text-secondary-300 ml-1 tabular-nums">
                              {scenario.features[key].toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Right Column: Comparison & Charts */}
        <div className="space-y-6">
          {scenarios.length === 0 && (
            <Card>
              <CardBody className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary-100 dark:bg-secondary-800 flex items-center justify-center">
                  <svg className="w-8 h-8 text-secondary-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
                  No Scenarios Yet
                </h3>
                <p className="text-sm text-secondary-500 dark:text-secondary-400 max-w-sm mx-auto">
                  Adjust the features, click &quot;Predict&quot;, then &quot;Save as Scenario&quot; to start comparing different what-if scenarios.
                </p>
              </CardBody>
            </Card>
          )}

          {/* Summary Statistics */}
          {comparisonSummary && scenarios.length >= 2 && (
            <ComparisonSummary summary={comparisonSummary} />
          )}

          {/* Price Comparison Chart */}
          {scenarios.length >= 2 && (
            <Card>
              <CardBody>
                <h3 className="text-base font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
                  Price Comparison
                </h3>
                <ComparisonChart predictions={scenarioPredictions} />
              </CardBody>
            </Card>
          )}

          {/* Feature Differences Table */}
          {scenarios.length >= 2 && featureAverages && (
            <Card>
              <CardBody className="p-0 overflow-x-auto">
                <div className="px-6 pt-4 pb-2">
                  <h3 className="text-base font-semibold text-secondary-900 dark:text-secondary-100">
                    Feature Differences
                  </h3>
                </div>
                <Table aria-label="Feature differences across scenarios">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Feature</TableHead>
                      {scenarios.map((s) => (
                        <TableHead key={s.id} className="text-center">
                          {s.name}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {FEATURE_KEYS.map((key) => (
                      <TableRow key={key}>
                        <TableCell className="font-medium text-secondary-700 dark:text-secondary-300">
                          {FEATURE_LABELS[key]}
                        </TableCell>
                        {scenarios.map((s) => (
                          <TableCell
                            key={s.id}
                            className={`text-center tabular-nums ${getFeatureValueClass(key, s.features[key])}`}
                          >
                            {s.features[key].toLocaleString()}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                    <TableRow className="bg-secondary-50 dark:bg-secondary-800/50 font-bold">
                      <TableCell className="font-bold text-secondary-900 dark:text-secondary-100">
                        Predicted Price
                      </TableCell>
                      {scenarios.map((s) => (
                        <TableCell key={s.id} className="text-center tabular-nums font-bold text-amber-600 dark:text-amber-400">
                          {formatCurrency(s.prediction.predicted_price)}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          )}

          {/* Feature Contribution Charts */}
          {scenarios.length >= 1 && modelInfo && (
            <Card>
              <CardBody>
                <h3 className="text-base font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
                  Feature Contribution Breakdown
                </h3>
                {scenarios.length > 1 && (
                  <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                    {scenarios.map((s, idx) => (
                      <button
                        key={s.id}
                        onClick={() => setActiveFeatureTab(idx)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                          activeFeatureTab === idx
                            ? "bg-amber-500 text-white"
                            : "bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-200 dark:hover:bg-secondary-700"
                        }`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                )}
                {scenarios[activeFeatureTab] && (
                  <FeatureContributionChart
                    features={scenarios[activeFeatureTab].features}
                    modelInfo={modelInfo}
                  />
                )}
              </CardBody>
            </Card>
          )}

          {/* Single scenario summary */}
          {scenarios.length === 1 && (
            <Card>
              <CardBody>
                <h3 className="text-base font-semibold text-secondary-900 dark:text-secondary-100 mb-3">
                  Scenario Summary
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-secondary-50 dark:bg-secondary-800/50 rounded-lg">
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 mb-1">Predicted Price</p>
                    <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                      {formatCurrency(scenarios[0].prediction.predicted_price)}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-secondary-50 dark:bg-secondary-800/50 rounded-lg">
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 mb-1">Scenarios Saved</p>
                    <p className="text-xl font-bold text-secondary-900 dark:text-secondary-100">1</p>
                  </div>
                </div>
                <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-3 text-center">
                  Save more scenarios to enable comparison charts and feature difference analysis.
                </p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
