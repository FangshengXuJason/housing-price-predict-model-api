"use client";

import { SinglePredictionResponse } from "@/types";
import { Card, CardBody, CardFooter, Badge, Button } from "@/components/ui";
import { FEATURE_CONSTRAINTS } from "@/lib/constants";

interface FormResultsProps {
  prediction: SinglePredictionResponse;
  onAddToComparison?: () => void;
  onNewPrediction?: () => void;
}

export default function FormResults({
  prediction,
  onAddToComparison,
  onNewPrediction,
}: FormResultsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const featureLabels: Record<string, string> = {
    square_footage: FEATURE_CONSTRAINTS.square_footage.label,
    bedrooms: FEATURE_CONSTRAINTS.bedrooms.label,
    bathrooms: FEATURE_CONSTRAINTS.bathrooms.label,
    year_built: FEATURE_CONSTRAINTS.year_built.label,
    lot_size: FEATURE_CONSTRAINTS.lot_size.label,
    distance_to_city_center: FEATURE_CONSTRAINTS.distance_to_city_center.label,
    school_rating: FEATURE_CONSTRAINTS.school_rating.label,
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardBody className="text-center py-12">
          <div className="mb-4">
            <Badge variant="primary" size="sm">
              Prediction #{prediction.id}
            </Badge>
          </div>
          <h2 className="text-lg font-medium text-secondary-600 dark:text-secondary-400 mb-2">
            Estimated Property Value
          </h2>
          <div className="text-5xl sm:text-6xl font-bold text-primary-600 dark:text-primary-400 mb-4">
            {formatCurrency(prediction.predicted_price)}
          </div>
          <p className="text-sm text-secondary-500 dark:text-secondary-500">
            Based on AI analysis of property features
          </p>
        </CardBody>
        <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center">
          {onAddToComparison && (
            <Button variant="secondary" onClick={onAddToComparison}>
              Add to Comparison
            </Button>
          )}
          {onNewPrediction && (
            <Button variant="primary" onClick={onNewPrediction}>
              New Estimation
            </Button>
          )}
        </CardFooter>
      </Card>

      <Card>
        <CardBody>
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            Property Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(prediction.features).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center py-2 border-b border-secondary-100 dark:border-secondary-800">
                <span className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                  {featureLabels[key] || key}
                </span>
                <span className="text-sm font-semibold text-secondary-900 dark:text-secondary-100">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
