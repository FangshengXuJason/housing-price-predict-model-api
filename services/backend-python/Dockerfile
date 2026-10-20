# ---- Stage 1: dependencies ----
FROM python:3.12-slim AS deps

WORKDIR /app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Copy dependency spec first for layer caching
COPY pyproject.toml ./
RUN uv pip install --system -r pyproject.toml

# ---- Stage 2: production image ----
FROM python:3.12-slim AS production

WORKDIR /app

# Copy installed packages from deps stage
COPY --from=deps /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=deps /usr/local/bin/uvicorn /usr/local/bin/uvicorn

# Copy application code
COPY app/ ./app/

# Create data directory for SQLite database
RUN mkdir -p /app/data

# Expose port
EXPOSE 8001

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
