import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white">
        <div className="max-w-5xl mx-auto px-6 py-20 sm:py-28">
          <div className="text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Property Value Estimator
            </h1>
            <p className="text-lg sm:text-xl text-primary-100 max-w-2xl mx-auto leading-relaxed">
              Predict housing prices with confidence using our machine learning
              model. Get instant estimates based on property characteristics,
              view prediction history, and compare multiple properties
              side-by-side.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                href="/estimator"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-primary-700 font-semibold rounded-lg shadow-lg hover:bg-primary-50 transition-all duration-200 hover:shadow-xl"
              >
                Start Estimating
              </Link>
              <Link
                href="/history"
                className="inline-flex items-center justify-center px-8 py-3 bg-primary-500/30 text-white font-semibold rounded-lg border border-primary-400/50 hover:bg-primary-500/50 transition-all duration-200"
              >
                View History
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Backend Services Section */}
      <section className="max-w-5xl mx-auto px-6 py-16 sm:py-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 text-center mb-4">
          Backend Services
        </h2>
        <p className="text-secondary-600 text-center mb-12 max-w-2xl mx-auto">
          Our platform is powered by two backend services. The Python backend is
          fully operational with ML predictions, while the Java backend is
          currently in development.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Python Backend Card */}
          <div className="bg-white rounded-xl shadow-md border border-secondary-200 p-8 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-secondary-900">
                  Python Backend
                </h3>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                Active
              </span>
            </div>
            <p className="text-secondary-600 mb-6 leading-relaxed">
              Estimate property values using our ML model. Built with FastAPI,
              featuring real-time predictions, historical data tracking, and
              property comparison tools.
            </p>
            <div className="space-y-2 mb-6">
              <div className="flex items-center text-sm text-secondary-700">
                <svg
                  className="w-4 h-4 mr-2 text-success-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                ML-powered predictions
              </div>
              <div className="flex items-center text-sm text-secondary-700">
                <svg
                  className="w-4 h-4 mr-2 text-success-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Prediction history
              </div>
              <div className="flex items-center text-sm text-secondary-700">
                <svg
                  className="w-4 h-4 mr-2 text-success-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Property comparison
              </div>
            </div>
            <Link
              href="/estimator"
              className="inline-flex items-center justify-center w-full px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors duration-200"
            >
              Go to Estimator
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>

          {/* Java Backend Card */}
          <div className="bg-white rounded-xl shadow-md border border-secondary-200 p-8 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-accent-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-secondary-900">
                  Java Backend
                </h3>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-100 text-accent-800">
                Coming Soon
              </span>
            </div>
            <p className="text-secondary-600 mb-6 leading-relaxed">
              Spring Boot backend currently under development. Will provide
              additional API endpoints and enterprise-grade features for
              property valuation.
            </p>
            <div className="space-y-2 mb-6">
              <div className="flex items-center text-sm text-secondary-500">
                <svg
                  className="w-4 h-4 mr-2 text-secondary-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 100-2H9V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Spring Boot framework
              </div>
              <div className="flex items-center text-sm text-secondary-500">
                <svg
                  className="w-4 h-4 mr-2 text-secondary-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 100-2H9V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Enterprise features
              </div>
              <div className="flex items-center text-sm text-secondary-500">
                <svg
                  className="w-4 h-4 mr-2 text-secondary-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 100-2H9V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Additional endpoints
              </div>
            </div>
            <div className="inline-flex items-center justify-center w-full px-6 py-3 bg-secondary-100 text-secondary-500 font-semibold rounded-lg cursor-not-allowed">
              Under Development
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-secondary-200 mt-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <p className="text-center text-sm text-secondary-500">
            Property Value Estimator — Housing Price Prediction Portal
          </p>
        </div>
      </footer>
    </div>
  );
}
