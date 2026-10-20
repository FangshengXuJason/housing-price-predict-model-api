from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""
    pass


class PredictionRecord(Base):
    """Stores housing price prediction records."""

    __tablename__ = "prediction_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    square_footage: Mapped[float] = mapped_column(Float, nullable=False)
    bedrooms: Mapped[int] = mapped_column(Integer, nullable=False)
    bathrooms: Mapped[float] = mapped_column(Float, nullable=False)
    year_built: Mapped[int] = mapped_column(Integer, nullable=False)
    lot_size: Mapped[float] = mapped_column(Float, nullable=False)
    distance_to_city_center: Mapped[float] = mapped_column(Float, nullable=False)
    school_rating: Mapped[float] = mapped_column(Float, nullable=False)
    predicted_price: Mapped[float] = mapped_column(Float, nullable=False)

    def __repr__(self) -> str:
        return (
            f"<PredictionRecord(id={self.id}, "
            f"predicted_price={self.predicted_price:.2f}, "
            f"timestamp={self.timestamp})>"
        )
