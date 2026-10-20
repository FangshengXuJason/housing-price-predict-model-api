# ---- Stage 1: build ----
FROM python:3.12-slim AS builder

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /build

# Copy dependency specs first (layer caching)
COPY pyproject.toml uv.lock ./

# Install dependencies into a virtualenv
RUN uv venv /build/.venv && \
    uv sync --frozen --no-dev --no-install-project

# ---- Stage 2: runtime ----
FROM python:3.12-slim AS runtime

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser -d /app -s /sbin/nologin appuser

WORKDIR /app

# Copy the virtualenv from builder
COPY --from=builder /build/.venv /app/.venv

# Copy application code
COPY app/ /app/app/
COPY model/ /app/model/
COPY src/ /app/src/
COPY pyproject.toml /app/

# Make venv python available on PATH
ENV PATH="/app/.venv/bin:$PATH"

# Switch to non-root user
USER appuser

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
