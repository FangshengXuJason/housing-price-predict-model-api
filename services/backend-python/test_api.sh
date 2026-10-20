#!/usr/bin/env bash
#
# Integration test script for the Housing Price Prediction Backend API.
#
# Usage:
#   ./test_api.sh                      # Uses default http://localhost:8001
#   BASE_URL=http://host:port ./test_api.sh
#
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8001}"
PASS=0
FAIL=0

# ---------- helpers ----------

green() { printf "\033[32m%s\033[0m\n" "$*"; }
red()   { printf "\033[31m%s\033[0m\n" "$*"; }
bold()  { printf "\033[1m%s\033[0m\n" "$*"; }

run_test() {
    local description="$1"
    shift
    bold "▶ $description"
    if "$@"; then
        green "  ✓ PASS"
        ((PASS++))
    else
        red "  ✗ FAIL"
        ((FAIL++))
    fi
    echo
}

# ---------- tests ----------

bold "============================================"
bold " Housing Price Prediction API - Integration Tests"
bold " Base URL: $BASE_URL"
bold "============================================"
echo

# 1. Health check
run_test "GET /health" \
    curl -sf -o /dev/null -w "%{http_code}" "$BASE_URL/health" | grep -q "200"

# 2. Model info
run_test "GET /api/model-info" \
    curl -sf -o /dev/null -w "%{http_code}" "$BASE_URL/api/model-info" | grep -q "200"

# 3. Create single prediction
PREDICTION_RESPONSE=$(curl -sf -X POST "$BASE_URL/api/predictions" \
    -H "Content-Type: application/json" \
    -d '{
        "features": {
            "square_footage": 2000,
            "bedrooms": 3,
            "bathrooms": 2,
            "year_built": 2000,
            "lot_size": 5000,
            "distance_to_city_center": 10,
            "school_rating": 7
        }
    }')

run_test "POST /api/predictions (single)" \
    test -n "$PREDICTION_RESPONSE"

PREDICTION_ID=$(echo "$PREDICTION_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null || echo "")

# 4. Create batch predictions
run_test "POST /api/predictions/batch" \
    curl -sf -X POST "$BASE_URL/api/predictions/batch" \
        -H "Content-Type: application/json" \
        -d '{
            "features_list": [
                {
                    "square_footage": 1500,
                    "bedrooms": 2,
                    "bathrooms": 1.5,
                    "year_built": 1995,
                    "lot_size": 4000,
                    "distance_to_city_center": 15,
                    "school_rating": 6
                },
                {
                    "square_footage": 3000,
                    "bedrooms": 4,
                    "bathrooms": 3,
                    "year_built": 2010,
                    "lot_size": 8000,
                    "distance_to_city_center": 5,
                    "school_rating": 9
                }
            ]
        }' -o /dev/null -w "%{http_code}" | grep -q "201"

# 5. Get prediction history
run_test "GET /api/predictions (history)" \
    curl -sf -o /dev/null -w "%{http_code}" "$BASE_URL/api/predictions" | grep -q "200"

# 6. Get specific prediction by ID
if [ -n "$PREDICTION_ID" ]; then
    run_test "GET /api/predictions/$PREDICTION_ID" \
        curl -sf -o /dev/null -w "%{http_code}" "$BASE_URL/api/predictions/$PREDICTION_ID" | grep -q "200"
else
    red "▶ SKIP: GET /api/predictions/{id} (no prediction ID captured)"
    echo
fi

# 7. Compare predictions
run_test "POST /api/predictions/compare" \
    curl -sf -X POST "$BASE_URL/api/predictions/compare" \
        -H "Content-Type: application/json" \
        -d '{"prediction_ids": [1, 2]}' \
        -o /dev/null -w "%{http_code}" | grep -q "200"

# 8. Delete single prediction
if [ -n "$PREDICTION_ID" ]; then
    run_test "DELETE /api/predictions/$PREDICTION_ID" \
        curl -sf -X DELETE -o /dev/null -w "%{http_code}" "$BASE_URL/api/predictions/$PREDICTION_ID" | grep -q "204"
else
    red "▶ SKIP: DELETE /api/predictions/{id} (no prediction ID captured)"
    echo
fi

# 9. Delete all predictions
run_test "DELETE /api/predictions (all)" \
    curl -sf -X DELETE -o /dev/null -w "%{http_code}" "$BASE_URL/api/predictions" | grep -q "204"

# ---------- summary ----------

bold "============================================"
bold " Results: $PASS passed, $FAIL failed"
bold "============================================"

if [ "$FAIL" -gt 0 ]; then
    exit 1
fi
