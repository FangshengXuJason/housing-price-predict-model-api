"use client";

import { useState } from "react";
import { usePredictionForm } from "@/hooks/usePredictionForm";
import { pythonApiClient } from "@/lib/api-client";
import { FEATURE_CONSTRAINTS } from "@/lib/constants";
import { SinglePredictionResponse, ApiError } from "@/types";
import FormResults from "./FormResults";
import { Button, Input, Card, CardBody, Alert, Spinner } from "@/components/ui";

export default function PredictionForm() {
  const [predictionResult, setPredictionResult] = useState<SinglePredictionResponse | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = usePredictionForm();

  const onSubmit = async (data: Record<string, number>) => {
    try {
      setSubmitError(null);
      const response = await pythonApiClient.createPrediction({
        features: {
          square_footage: data.square_footage,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          year_built: data.year_built,
          lot_size: data.lot_size,
          distance_to_city_center: data.distance_to_city_center,
          school_rating: data.school_rating,
        },
      });
      setPredictionResult(response);
    } catch (error) {
      const apiError = error as ApiError;
      setSubmitError(apiError.detail || "Failed to get prediction. Please try again.");
    }
  };

  const handleReset = () => {
    reset();
    setPredictionResult(null);
    setSubmitError(null);
  };

  const handleNewPrediction = () => {
    handleReset();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (predictionResult) {
    return (
      <FormResults
        prediction={predictionResult}
        onNewPrediction={handleNewPrediction}
      />
    );
  }

  return (
    <Card>
      <CardBody>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {submitError && (
            <Alert variant="error" title="Error">
              {submitError}
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Square Footage */}
            <div className="md:col-span-2">
              <Input
                id="square_footage"
                type="number"
                label={FEATURE_CONSTRAINTS.square_footage.label}
                placeholder="e.g. 1500"
                helpText="Living area in square feet"
                error={errors.square_footage?.message}
                disabled={isSubmitting}
                {...register("square_footage", {
                  valueAsNumber: true,
                })}
                aria-describedby={errors.square_footage ? "square_footage-error" : undefined}
              />
            </div>

            {/* Bedrooms */}
            <div>
              <Input
                id="bedrooms"
                type="number"
                label={FEATURE_CONSTRAINTS.bedrooms.label}
                min={FEATURE_CONSTRAINTS.bedrooms.min}
                max={FEATURE_CONSTRAINTS.bedrooms.max}
                step={FEATURE_CONSTRAINTS.bedrooms.step}
                placeholder="e.g. 3"
                error={errors.bedrooms?.message}
                disabled={isSubmitting}
                {...register("bedrooms", {
                  valueAsNumber: true,
                })}
                aria-describedby={errors.bedrooms ? "bedrooms-error" : undefined}
              />
            </div>

            {/* Bathrooms */}
            <div>
              <Input
                id="bathrooms"
                type="number"
                label={FEATURE_CONSTRAINTS.bathrooms.label}
                min={FEATURE_CONSTRAINTS.bathrooms.min}
                max={FEATURE_CONSTRAINTS.bathrooms.max}
                step={FEATURE_CONSTRAINTS.bathrooms.step}
                placeholder="e.g. 2"
                error={errors.bathrooms?.message}
                disabled={isSubmitting}
                {...register("bathrooms", {
                  valueAsNumber: true,
                })}
                aria-describedby={errors.bathrooms ? "bathrooms-error" : undefined}
              />
            </div>

            {/* Year Built */}
            <div>
              <Input
                id="year_built"
                type="number"
                label={FEATURE_CONSTRAINTS.year_built.label}
                min={FEATURE_CONSTRAINTS.year_built.min}
                max={FEATURE_CONSTRAINTS.year_built.max}
                step={FEATURE_CONSTRAINTS.year_built.step}
                placeholder="e.g. 2000"
                error={errors.year_built?.message}
                disabled={isSubmitting}
                {...register("year_built", {
                  valueAsNumber: true,
                })}
                aria-describedby={errors.year_built ? "year_built-error" : undefined}
              />
            </div>

            {/* Lot Size */}
            <div>
              <Input
                id="lot_size"
                type="number"
                label={FEATURE_CONSTRAINTS.lot_size.label}
                placeholder="e.g. 5000"
                helpText="Total lot area in square feet"
                error={errors.lot_size?.message}
                disabled={isSubmitting}
                {...register("lot_size", {
                  valueAsNumber: true,
                })}
                aria-describedby={errors.lot_size ? "lot_size-error" : undefined}
              />
            </div>

            {/* Distance to City Center */}
            <div>
              <Input
                id="distance_to_city_center"
                type="number"
                label={FEATURE_CONSTRAINTS.distance_to_city_center.label}
                min={FEATURE_CONSTRAINTS.distance_to_city_center.min}
                max={FEATURE_CONSTRAINTS.distance_to_city_center.max}
                step={FEATURE_CONSTRAINTS.distance_to_city_center.step}
                placeholder="e.g. 5"
                error={errors.distance_to_city_center?.message}
                disabled={isSubmitting}
                {...register("distance_to_city_center", {
                  valueAsNumber: true,
                })}
                aria-describedby={errors.distance_to_city_center ? "distance_to_city_center-error" : undefined}
              />
            </div>

            {/* School Rating */}
            <div>
              <Input
                id="school_rating"
                type="number"
                label={FEATURE_CONSTRAINTS.school_rating.label}
                min={FEATURE_CONSTRAINTS.school_rating.min}
                max={FEATURE_CONSTRAINTS.school_rating.max}
                step={FEATURE_CONSTRAINTS.school_rating.step}
                placeholder="e.g. 7"
                helpText="Rating from 1 to 10"
                error={errors.school_rating?.message}
                disabled={isSubmitting}
                {...register("school_rating", {
                  valueAsNumber: true,
                })}
                aria-describedby={errors.school_rating ? "school_rating-error" : undefined}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button type="submit" variant="primary" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Calculating...
                </>
              ) : (
                "Get Price Estimation"
              )}
            </Button>
            <Button type="button" variant="secondary" onClick={handleReset} disabled={isSubmitting}>
              Reset Form
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
