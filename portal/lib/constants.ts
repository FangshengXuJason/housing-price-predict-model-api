export const API_BASE_URL =
  process.env.NEXT_PUBLIC_PYTHON_API_URL || "http://localhost:8001";

export const JAVA_API_BASE_URL =
  process.env.NEXT_PUBLIC_JAVA_API_URL || "http://localhost:8002";

export const FEATURE_CONSTRAINTS = {
  square_footage: {
    min: 0,
    max: 50000,
    step: 1,
    label: "Square Footage",
    exclusiveMin: true,
  },
  bedrooms: {
    min: 1,
    max: 20,
    step: 1,
    label: "Bedrooms",
  },
  bathrooms: {
    min: 0.5,
    max: 10,
    step: 0.5,
    label: "Bathrooms",
  },
  year_built: {
    min: 1900,
    max: 2026,
    step: 1,
    label: "Year Built",
  },
  lot_size: {
    min: 0,
    max: 100000,
    step: 1,
    label: "Lot Size (sq ft)",
    exclusiveMin: true,
  },
  distance_to_city_center: {
    min: 0,
    max: 100,
    step: 0.1,
    label: "Distance to City Center (miles)",
  },
  school_rating: {
    min: 1,
    max: 10,
    step: 0.5,
    label: "School Rating",
  },
} as const;

export const PAGINATION_DEFAULTS = {
  skip: 0,
  limit: 10,
};

export const NAV_ITEMS = [
  {
    href: "/estimator",
    label: "Estimator",
    group: "python" as const,
  },
  {
    href: "/history",
    label: "History",
    group: "python" as const,
  },
  {
    href: "/compare",
    label: "Comparison",
    group: "python" as const,
  },
  {
    href: "/java",
    label: "Java API",
    group: "java" as const,
  },
];
