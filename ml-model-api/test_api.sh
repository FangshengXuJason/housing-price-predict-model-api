#!/bin/bash
# Housing Price Prediction API - Test Script
# Usage: ./test_api.sh [base_url]
# Default base_url: http://localhost:8000

set -e

BASE_URL="${1:-http://localhost:8000}"
PASS=0
FAIL=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================"
echo "  Housing Price API Test Suite"
echo "  Target: $BASE_URL"
echo "========================================"
echo ""

# Helper function to test endpoint
test_endpoint() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_status="${5:-200}"
    
    printf "Testing %-40s " "$name..."
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" -d "$data")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}PASS${NC} (HTTP $http_code)"
        PASS=$((PASS + 1))
        return 0
    else
        echo -e "${RED}FAIL${NC} (HTTP $http_code, expected $expected_status)"
        echo "Response: $body" | head -c 200
        echo ""
        FAIL=$((FAIL + 1))
        return 1
    fi
}

# Test 1: Health check
test_endpoint "Health Check" "GET" "/health" || true

# Test 2: Model info
test_endpoint "Model Info" "GET" "/model-info" || true

# Test 3: Single prediction - normal case
test_endpoint "Single Prediction (2000sqft, 4br)" "POST" "/predict" \
    '{"square_footage":2000,"bedrooms":4,"bathrooms":2.5,"year_built":2005,"lot_size":8500,"distance_to_city_center":6.0,"school_rating":8.5}' || true

# Test 4: Single prediction - small house
test_endpoint "Single Prediction (1200sqft, 2br)" "POST" "/predict" \
    '{"square_footage":1200,"bedrooms":2,"bathrooms":1,"year_built":1980,"lot_size":4500,"distance_to_city_center":2.0,"school_rating":6.5}' || true

# Test 5: Batch prediction
test_endpoint "Batch Prediction (3 houses)" "POST" "/predict/batch" \
    '{"features":[{"square_footage":1500,"bedrooms":3,"bathrooms":2,"year_built":1995,"lot_size":6500,"distance_to_city_center":4.0,"school_rating":7.5},{"square_footage":2500,"bedrooms":5,"bathrooms":3,"year_built":2015,"lot_size":10000,"distance_to_city_center":8.0,"school_rating":9.0},{"square_footage":1000,"bedrooms":2,"bathrooms":1,"year_built":1978,"lot_size":4000,"distance_to_city_center":2.5,"school_rating":6.0}]}' || true

# Test 6: Validation - missing fields (expect 422)
test_endpoint "Validation: Missing Fields" "POST" "/predict" \
    '{"square_footage":2000,"bedrooms":4}' "422" || true

# Test 7: Validation - invalid value (expect 422)
test_endpoint "Validation: Negative Value" "POST" "/predict" \
    '{"square_footage":-100,"bedrooms":4,"bathrooms":2.5,"year_built":2005,"lot_size":8500,"distance_to_city_center":6.0,"school_rating":8.5}' "422" || true

# Test 8: Validation - empty batch (expect 422)
test_endpoint "Validation: Empty Batch" "POST" "/predict/batch" \
    '{"features":[]}' "422" || true

# Test 9: OpenAPI docs
test_endpoint "OpenAPI Docs (/docs)" "GET" "/docs" || true

# Test 10: OpenAPI schema
test_endpoint "OpenAPI Schema (/openapi.json)" "GET" "/openapi.json" || true

echo ""
echo "========================================"
echo "  Test Summary"
echo "========================================"
echo -e "  Passed: ${GREEN}$PASS${NC}"
echo -e "  Failed: ${RED}$FAIL${NC}"
echo "  Total:  $((PASS + FAIL))"
echo "========================================"

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed.${NC}"
    exit 1
fi
