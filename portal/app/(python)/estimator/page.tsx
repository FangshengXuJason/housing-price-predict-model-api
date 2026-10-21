import type { Metadata } from "next";
import PredictionForm from "@/components/forms/PredictionForm";

export const metadata: Metadata = {
  title: "Estimator - Property Value Estimator",
  description: "Estimate property values using our advanced ML model",
};

export default function EstimatorPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-secondary-900 dark:text-secondary-50 mb-3">
            Property Value Estimator
          </h1>
          <p className="text-base sm:text-lg text-secondary-600 dark:text-secondary-400 leading-relaxed">
            Enter the property details below to get an instant AI-powered price estimation based on our machine learning model.
          </p>
        </header>
        <PredictionForm />
      </div>
    </div>
  );
}
