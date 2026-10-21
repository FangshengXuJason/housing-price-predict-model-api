import Link from 'next/link';

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link
                href="/"
                className="text-secondary-600 hover:text-primary-600 transition-colors"
              >
                Home
              </Link>
            </li>
            <li className="text-secondary-400">/</li>
            <li className="text-secondary-900 font-medium">Compare</li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Compare Predictions
          </h1>
          <p className="text-secondary-600">
            Analyze and compare multiple property predictions side by side
          </p>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
}
