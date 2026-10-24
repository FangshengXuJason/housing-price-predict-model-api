import type { Metadata } from "next";
import WhatIfAnalysis from "@/components/java/WhatIfAnalysis";

export const metadata: Metadata = {
  title: "What-If Analysis - Property Value Estimator",
  description: "Explore different property scenarios and compare predicted prices with interactive what-if analysis",
};

export default function WhatIfPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <header className="mb-8 sm:mb-12 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-secondary-900 dark:text-secondary-50 mb-3">
          What-If Analysis
        </h1>
        <p className="text-base sm:text-lg text-secondary-600 dark:text-secondary-400 leading-relaxed max-w-3xl mx-auto">
          Experiment with different property features and compare multiple scenarios side by side.
          Adjust sliders to see how changes impact predicted prices in real time.
        </p>
      </header>
      <WhatIfAnalysis />
    </div>
  );
}
