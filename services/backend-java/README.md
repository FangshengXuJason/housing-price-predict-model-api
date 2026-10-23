# Housing Price Prediction - Java Backend Service

## Overview

Java 21 + Spring Boot 3.4.4 backend service for housing price prediction. Integrates with the ML Model API to provide prediction, analytics, and comparison features with built-in caching and persistent storage.

## Tech Stack

- **Java 21** (LTS)
- **Spring Boot 3.4.4**
- **Spring Data JPA** with SQLite (via Hibernate Community Dialects)
- **Caffeine Cache** for in-memory caching
- **Apache Commons CSV** for data loading
- **Maven** for build and dependency management

## Prerequisites

- Java 21+
- Maven 3.8+ (or use the included Maven Wrapper `./mvnw`)
- ML Model API running on port 8000

## Project Structure

```
backend-java/
├── .mvn/wrapper/            # Maven Wrapper files
├── src/
│   ├── main/
│   │   ├── java/com/housingprice/backend/
│   │   │   ├── config/
│   │   │   │   ├── CacheConfig.java          # Caffeine cache configuration
│   │   │   │   ├── DataLoaderConfig.java     # CSV data loader on startup
│   │   │   │   ├── GlobalExceptionHandler.java # Global error handling
│   │   │   │   └── RestTemplateConfig.java   # RestTemplate bean config
│   │   │   ├── controller/
│   │   │   │   ├── AnalyticsController.java  # Analytics endpoints
│   │   │   │   ├── HealthController.java     # Health check endpoint
│   │   │   │   └── PredictionController.java # Prediction CRUD endpoints
│   │   │   ├── dto/
│   │   │   │   ├── request/                  # Request DTOs
│   │   │   │   └── response/                 # Response DTOs
│   │   │   ├── model/
│   │   │   │   ├── HousingData.java          # Housing data entity
│   │   │   │   └── PredictionRecord.java     # Prediction record entity
│   │   │   ├── repository/
│   │   │   │   ├── HousingDataRepository.java # Housing data JPA repo
│   │   │   │   └── PredictionRepository.java  # Prediction JPA repo
│   │   │   ├── service/
│   │   │   │   ├── AnalyticsService.java     # Analytics business logic
│   │   │   │   ├── MLApiClient.java          # ML API HTTP client
│   │   │   │   └── PredictionService.java    # Prediction business logic
│   │   │   └── BackendApplication.java       # Main entry point
│   │   └── resources/
│   │       ├── data/                         # CSV data files
│   │       └── application.yml               # Application configuration
│   └── test/                                 # Unit and integration tests
├── target/                                   # Build output
├── .dockerignore
├── docker-compose.yml
├── Dockerfile
├── mvnw / mvnw.cmd                           # Maven Wrapper scripts
├── pom.xml                                   # Maven dependencies
├── README.md
└── test_api.sh                               # Manual API test script
```

## API Endpoints

### Prediction Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/predictions` | Single prediction |
| `POST` | `/api/predictions/batch` | Batch prediction |
| `GET` | `/api/predictions` | Paginated history (`?skip=0&limit=10`) |
| `GET` | `/api/predictions/{id}` | Get prediction by ID |
| `DELETE` | `/api/predictions/{id}` | Delete one prediction |
| `DELETE` | `/api/predictions` | Clear all prediction history |
| `POST` | `/api/predictions/compare` | Compare multiple predictions |

### Analytics Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/analytics/statistics` | Aggregate statistics |
| `GET` | `/api/analytics/price-by-bedroom` | Average price grouped by bedrooms |
| `GET` | `/api/analytics/correlation` | Feature correlations with price |

### System Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/model-info` | Proxy to ML model info |
| `GET` | `/health` | Health check |

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `ML_API_URL` | `http://localhost:8000` | ML Model API URL |
| Server Port | `8002` | Application listen port |
| `SPRING_PROFILES_ACTIVE` | — | Active Spring profile (e.g. `docker`) |

Configuration is managed in `src/main/resources/application.yml`.

## Running Locally

```bash
# Ensure ML Model API is running on port 8000
# Then start the Java service:
./mvnw spring-boot:run
```

The service starts on `http://localhost:8002`.

## Running Tests

```bash
./mvnw test
```

## Docker

### Build the image

```bash
docker build -t housing-backend-java .
```

### Run with docker-compose

```bash
docker-compose up -d
```

### View logs

```bash
docker-compose logs -f
```

### Stop the service

```bash
docker-compose down
```

## Caching

The service uses Caffeine in-memory caches to reduce latency and ML API calls:

| Cache Name | TTL | Purpose |
|------------|-----|---------|
| `modelInfo` | 10 minutes | ML model metadata |
| `aggregateStats` | 5 minutes | Analytics aggregate results |
| `predictionResult` | 2 minutes | Individual prediction results |

## Data

On startup, the service loads **50 housing records** from a CSV file (`src/main/resources/data/`) into the `housing_data` table. These records are used by the analytics endpoints for statistical computations and correlations.

Prediction results are persisted in the `prediction_record` table (SQLite at `./data/predictions.db`).

## Manual API Testing

A `test_api.sh` script is provided for quick manual testing:

```bash
chmod +x test_api.sh
./test_api.sh
```
