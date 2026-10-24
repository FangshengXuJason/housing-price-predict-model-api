import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Java Backend - Housing Price Prediction",
  description:
    "Java 21 + Spring Boot backend for the housing price prediction portal",
};

const FEATURES = [
  {
    title: "Market Dashboard",
    description:
      "Interactive property market visualizations with price distributions, feature correlations, and market statistics.",
    href: "/java/dashboard",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
        />
      </svg>
    ),
  },
  {
    title: "What-If Analysis",
    description:
      "Adjust property features interactively and see real-time price predictions. Compare multiple scenarios side-by-side with visualizations.",
    href: "/java/what-if",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
        />
      </svg>
    ),
  },
];

export default function JavaLandingPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <header className="mb-10 sm:mb-14">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-secondary-900 dark:text-secondary-50">
              Java Backend
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 dark:bg-green-900/40 px-3.5 py-1 text-sm font-semibold text-green-700 dark:text-green-300 ring-1 ring-green-600/20 dark:ring-green-400/30 w-fit">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              Active
            </span>
          </div>
          <p className="text-base sm:text-lg text-secondary-600 dark:text-secondary-400 leading-relaxed">
            Powered by a{" "}
            <strong className="font-semibold text-secondary-800 dark:text-secondary-200">
              Java 21 + Spring Boot
            </strong>{" "}
            backend, providing the same prediction capabilities as the Python
            service with enterprise-grade performance, scalability, and
            additional analytics features.
          </p>
        </header>

        {/* Tech stack info */}
        <div className="rounded-xl bg-accent-50 dark:bg-accent-950/30 border border-accent-200 dark:border-accent-800/50 p-5 sm:p-6 mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-accent-700 dark:text-accent-400 mb-3">
            Planned Tech Stack
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Language", value: "Java 21" },
              { label: "Framework", value: "Spring Boot 3" },
              { label: "Build Tool", value: "Maven" },
              { label: "Port", value: "8002" },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xs text-accent-600 dark:text-accent-500 font-medium">
                  {item.label}
                </p>
                <p className="text-sm font-semibold text-accent-900 dark:text-accent-100 mt-0.5">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Feature cards */}
        <section aria-labelledby="features-heading">
          <h2
            id="features-heading"
            className="text-xl sm:text-2xl font-bold text-secondary-900 dark:text-secondary-50 mb-6"
          >
            Available Features
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <Link key={feature.title} href={feature.href}>
                <article
                  className="group relative rounded-xl border border-secondary-200 dark:border-secondary-700/60 bg-white dark:bg-secondary-800/50 p-5 sm:p-6 transition-all hover:border-accent-300 dark:hover:border-accent-600/50 hover:shadow-md cursor-pointer h-full"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 rounded-lg bg-accent-100 dark:bg-accent-900/40 p-2.5 text-accent-600 dark:text-accent-400">
                      {feature.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="text-base font-semibold text-secondary-900 dark:text-secondary-50 group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                          {feature.title}
                        </h3>
                        <svg
                          className="w-4 h-4 text-secondary-400 group-hover:text-primary-600 transition-colors transform group-hover:translate-x-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                          />
                        </svg>
                      </div>
                      <p className="text-sm text-secondary-600 dark:text-secondary-400 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA - Link to Python version */}
        <div className="mt-10 sm:mt-14 rounded-xl border border-secondary-200 dark:border-secondary-700/60 bg-secondary-50 dark:bg-secondary-800/30 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <h3 className="text-base font-semibold text-secondary-900 dark:text-secondary-50 mb-1">
                Also available in Python
              </h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                The Python backend offers the same features with additional
                ML model access.
              </p>
            </div>
            <Link
              href="/estimator"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 hover:bg-primary-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors whitespace-nowrap"
            >
              Try the Python version
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
