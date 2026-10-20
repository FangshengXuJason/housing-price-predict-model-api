"""Tests for Pydantic schema validation."""

import pytest
from pydantic import ValidationError

from app.schemas import (
    BatchPredictionRequest,
    ComparisonRequest,
    HousingFeatures,
)


# ---------------------------------------------------------------------------
# HousingFeatures – valid data
# ---------------------------------------------------------------------------

class TestHousingFeaturesValid:
    def test_valid_features(self, sample_features_data):
        features = HousingFeatures(**sample_features_data)
        assert features.square_footage == 2000.0
        assert features.bedrooms == 3
        assert features.bathrooms == 2.0
        assert features.year_built == 2005
        assert features.lot_size == 5000.0
        assert features.distance_to_city_center == 10.0
        assert features.school_rating == 7.5

    def test_boundary_min_values(self):
        features = HousingFeatures(
            square_footage=0.1,
            bedrooms=1,
            bathrooms=0.5,
            year_built=1900,
            lot_size=0.1,
            distance_to_city_center=0,
            school_rating=1,
        )
        assert features.bedrooms == 1
        assert features.bathrooms == 0.5
        assert features.year_built == 1900
        assert features.school_rating == 1

    def test_boundary_max_values(self):
        features = HousingFeatures(
            square_footage=99999.0,
            bedrooms=50,
            bathrooms=50.0,
            year_built=2026,
            lot_size=999999.0,
            distance_to_city_center=1000.0,
            school_rating=10,
        )
        assert features.year_built == 2026
        assert features.school_rating == 10


# ---------------------------------------------------------------------------
# HousingFeatures – field constraint violations
# ---------------------------------------------------------------------------

class TestHousingFeaturesConstraints:
    def test_square_footage_zero(self):
        with pytest.raises(ValidationError, match="square_footage"):
            HousingFeatures(
                square_footage=0, bedrooms=1, bathrooms=1, year_built=2000,
                lot_size=1000, distance_to_city_center=5, school_rating=5,
            )

    def test_square_footage_negative(self):
        with pytest.raises(ValidationError, match="square_footage"):
            HousingFeatures(
                square_footage=-100, bedrooms=1, bathrooms=1, year_built=2000,
                lot_size=1000, distance_to_city_center=5, school_rating=5,
            )

    def test_bedrooms_zero(self):
        with pytest.raises(ValidationError, match="bedrooms"):
            HousingFeatures(
                square_footage=1000, bedrooms=0, bathrooms=1, year_built=2000,
                lot_size=1000, distance_to_city_center=5, school_rating=5,
            )

    def test_bedrooms_negative(self):
        with pytest.raises(ValidationError, match="bedrooms"):
            HousingFeatures(
                square_footage=1000, bedrooms=-1, bathrooms=1, year_built=2000,
                lot_size=1000, distance_to_city_center=5, school_rating=5,
            )

    def test_bathrooms_below_minimum(self):
        with pytest.raises(ValidationError, match="bathrooms"):
            HousingFeatures(
                square_footage=1000, bedrooms=1, bathrooms=0, year_built=2000,
                lot_size=1000, distance_to_city_center=5, school_rating=5,
            )

    def test_year_built_too_old(self):
        with pytest.raises(ValidationError, match="year_built"):
            HousingFeatures(
                square_footage=1000, bedrooms=1, bathrooms=1, year_built=1899,
                lot_size=1000, distance_to_city_center=5, school_rating=5,
            )

    def test_year_built_future(self):
        with pytest.raises(ValidationError, match="year_built"):
            HousingFeatures(
                square_footage=1000, bedrooms=1, bathrooms=1, year_built=2027,
                lot_size=1000, distance_to_city_center=5, school_rating=5,
            )

    def test_lot_size_zero(self):
        with pytest.raises(ValidationError, match="lot_size"):
            HousingFeatures(
                square_footage=1000, bedrooms=1, bathrooms=1, year_built=2000,
                lot_size=0, distance_to_city_center=5, school_rating=5,
            )

    def test_distance_to_city_center_negative(self):
        with pytest.raises(ValidationError, match="distance_to_city_center"):
            HousingFeatures(
                square_footage=1000, bedrooms=1, bathrooms=1, year_built=2000,
                lot_size=1000, distance_to_city_center=-1, school_rating=5,
            )

    def test_school_rating_below_minimum(self):
        with pytest.raises(ValidationError, match="school_rating"):
            HousingFeatures(
                square_footage=1000, bedrooms=1, bathrooms=1, year_built=2000,
                lot_size=1000, distance_to_city_center=5, school_rating=0,
            )

    def test_school_rating_above_maximum(self):
        with pytest.raises(ValidationError, match="school_rating"):
            HousingFeatures(
                square_footage=1000, bedrooms=1, bathrooms=1, year_built=2000,
                lot_size=1000, distance_to_city_center=5, school_rating=11,
            )


# ---------------------------------------------------------------------------
# BatchPredictionRequest
# ---------------------------------------------------------------------------

class TestBatchPredictionRequest:
    def test_valid_batch(self, sample_features_data):
        req = BatchPredictionRequest(features_list=[sample_features_data])
        assert len(req.features_list) == 1

    def test_empty_list_fails(self):
        with pytest.raises(ValidationError, match="features_list"):
            BatchPredictionRequest(features_list=[])


# ---------------------------------------------------------------------------
# ComparisonRequest
# ---------------------------------------------------------------------------

class TestComparisonRequest:
    def test_valid_comparison(self):
        req = ComparisonRequest(prediction_ids=[1, 2, 3])
        assert req.prediction_ids == [1, 2, 3]

    def test_empty_ids_fails(self):
        with pytest.raises(ValidationError, match="prediction_ids"):
            ComparisonRequest(prediction_ids=[])
