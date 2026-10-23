#!/bin/bash

# Housing Price Prediction - Java Backend API Test Script
# Usage: ./test_api.sh [BASE_URL]

BASE_URL="${1:-http://localhost:8002}"

echo "============================================"
echo "  Java Backend API Test"
echo "  Target: $BASE_URL"
echo "============================================"

echo -e "\n=== Health Check ==="
curl -s "$BASE_URL/health" | python3 -m json.tool 2>/dev/null || curl -s "$BASE_URL/health"

echo -e "\n=== Model Info ==="
curl -s "$BASE_URL/api/model-info" | python3 -m json.tool 2>/dev/null || curl -s "$BASE_URL/api/model-info"

echo -e "\n=== Single Prediction ==="
curl -s -X POST "$BASE_URL/api/predictions" \
  -H "Content-Type: application/json" \
  -d '{
    "square_footage": 1500,
    "bedrooms": 3,
    "bathrooms": 2.0,
    "year_built": 2000,
    "lot_size": 7500,
    "distance_to_city_center": 5.0,
    "school_rating": 8.0
  }' | python3 -m json.tool 2>/dev/null

echo -e "\n=== Batch Prediction ==="
curl -s -X POST "$BASE_URL/api/predictions/batch" \
  -H "Content-Type: application/json" \
  -d '{
    "features_list": [
      {
        "square_footage": 1500,
        "bedrooms": 3,
        "bathrooms": 2.0,
        "year_built": 2000,
        "lot_size": 7500,
        "distance_to_city_center": 5.0,
        "school_rating": 8.0
      },
      {
        "square_footage": 2000,
        "bedrooms": 4,
        "bathrooms": 2.5,
        "year_built": 2005,
        "lot_size": 8500,
        "distance_to_city_center": 3.0,
        "school_rating": 9.0
      }
    ]
  }' | python3 -m json.tool 2>/dev/null

echo -e "\n=== Prediction History (first 10) ==="
curl -s "$BASE_URL/api/predictions?skip=0&limit=10" | python3 -m json.tool 2>/dev/null

echo -e "\n=== Aggregate Statistics ==="
curl -s "$BASE_URL/api/analytics/statistics" | python3 -m json.tool 2>/dev/null

echo -e "\n=== Price by Bedroom ==="
curl -s "$BASE_URL/api/analytics/price-by-bedroom" | python3 -m json.tool 2>/dev/null

echo -e "\n=== Feature Correlations ==="
curl -s "$BASE_URL/api/analytics/correlation" | python3 -m json.tool 2>/dev/null

echo -e "\n=== Create Predictions for Comparison ==="
# Create first prediction
PRED1=$(curl -s -X POST "$BASE_URL/api/predictions" \
  -H "Content-Type: application/json" \
  -d '{
    "square_footage": 1500,
    "bedrooms": 3,
    "bathrooms": 2.0,
    "year_built": 2000,
    "lot_size": 7500,
    "distance_to_city_center": 5.0,
    "school_rating": 8.0
  }')
echo "$PRED1" | python3 -m json.tool 2>/dev/null
ID1=$(echo "$PRED1" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])" 2>/dev/null)

# Create second prediction
PRED2=$(curl -s -X POST "$BASE_URL/api/predictions" \
  -H "Content-Type: application/json" \
  -d '{
    "square_footage": 2500,
    "bedrooms": 4,
    "bathrooms": 3.0,
    "year_built": 2010,
    "lot_size": 10000,
    "distance_to_city_center": 2.0,
    "school_rating": 9.5
  }')
echo "$PRED2" | python3 -m json.tool 2>/dev/null
ID2=$(echo "$PRED2" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])" 2>/dev/null)

echo -e "\n=== Compare Predictions (IDs: $ID1, $ID2) ==="
curl -s -X POST "$BASE_URL/api/predictions/compare" \
  -H "Content-Type: application/json" \
  -d "{\"prediction_ids\": [$ID1, $ID2]}" | python3 -m json.tool 2>/dev/null

echo -e "\n=== Delete All Predictions ==="
curl -s -X DELETE "$BASE_URL/api/predictions" -w "\nHTTP Status: %{http_code}\n"

echo -e "\n============================================"
echo "  Tests complete."
echo "============================================"
