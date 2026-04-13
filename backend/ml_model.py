"""
Weather prediction ML model using scikit-learn.

Trains a RandomForestRegressor to predict tomorrow's temperature
and a RandomForestClassifier to predict rain probability
using current weather features.
"""

import numpy as np
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.model_selection import cross_val_score
from sklearn.preprocessing import StandardScaler
import joblib
import os

FEATURE_NAMES = [
    "temp",
    "humidity",
    "pressure",
    "wind_speed",
    "clouds",
    "month",
    "hour",
]

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model_cache.joblib")


def _generate_training_data(n: int = 2000) -> tuple:
    """Generate synthetic weather training data with realistic correlations."""
    rng = np.random.default_rng(42)

    # Seasonal temperature baseline (month 1-12)
    months = rng.integers(1, 13, n)
    season_temp = 15 + 12 * np.sin((months - 4) * np.pi / 6)  # peaks in July

    # Current features
    temp = season_temp + rng.normal(0, 5, n)
    humidity = np.clip(60 + (20 - temp / 2) + rng.normal(0, 15, n), 10, 100)
    pressure = np.clip(1013 + rng.normal(0, 10, n) - 0.3 * (humidity - 60), 970, 1050)
    wind_speed = np.abs(rng.normal(5, 4, n))
    clouds = np.clip(
        40 + 0.3 * (humidity - 60) + rng.normal(0, 25, n), 0, 100
    )
    hours = rng.integers(0, 24, n)

    X = np.column_stack([temp, humidity, pressure, wind_speed, clouds, months, hours])

    # Target: next day temperature (temp + small drift, with seasonal pull)
    temp_next = (
        temp
        + rng.normal(0, 3, n)
        - 0.1 * (temp - season_temp)  # mean reversion
        + 0.5 * np.sin(months * np.pi / 6)  # seasonal trend
    )

    # Target: rain (1 if pop > 0.4) — driven by humidity, pressure, clouds
    rain_score = (
        0.4 * (humidity - 60) / 40
        + 0.3 * (1020 - pressure) / 50
        + 0.3 * (clouds - 40) / 60
        + rng.normal(0, 0.2, n)
    )
    rain = (rain_score > 0.2).astype(int)

    return X, temp_next, rain


def _get_condition(predicted_temp: float, rain_prob: float) -> str:
    if rain_prob > 0.7:
        return "rainy"
    if rain_prob > 0.4:
        return "cloudy with rain"
    if predicted_temp > 28:
        return "hot and sunny"
    if predicted_temp > 18:
        return "partly cloudy"
    if predicted_temp < 5:
        return "cold and clear"
    return "mild and clear"


class WeatherMLModel:
    def __init__(self):
        self.temp_model = RandomForestRegressor(
            n_estimators=120, max_depth=8, random_state=42, n_jobs=-1
        )
        self.rain_model = RandomForestClassifier(
            n_estimators=120, max_depth=8, random_state=42, n_jobs=-1
        )
        self.scaler = StandardScaler()
        self.temp_accuracy: float = 0.0
        self.rain_accuracy: float = 0.0
        self._trained = False

    def train(self):
        X, y_temp, y_rain = _generate_training_data()
        X_scaled = self.scaler.fit_transform(X)

        self.temp_model.fit(X_scaled, y_temp)
        self.rain_model.fit(X_scaled, y_rain)

        # Cross-validation accuracy
        temp_scores = cross_val_score(
            self.temp_model, X_scaled, y_temp, cv=5, scoring="r2"
        )
        rain_scores = cross_val_score(
            self.rain_model, X_scaled, y_rain, cv=5, scoring="accuracy"
        )
        self.temp_accuracy = float(np.clip(temp_scores.mean(), 0, 1))
        self.rain_accuracy = float(rain_scores.mean())
        self._trained = True

    def predict(self, weather: dict) -> dict:
        if not self._trained:
            self.train()

        import time
        month = int(time.strftime("%m"))
        hour = int(time.strftime("%H"))

        features = np.array(
            [[
                weather["temp"],
                weather["humidity"],
                weather["pressure"],
                weather["wind_speed"],
                weather["clouds"],
                month,
                hour,
            ]]
        )
        features_scaled = self.scaler.transform(features)

        predicted_temp = float(self.temp_model.predict(features_scaled)[0])
        rain_prob_arr = self.rain_model.predict_proba(features_scaled)[0]
        rain_probability = float(rain_prob_arr[1])

        condition = _get_condition(predicted_temp, rain_probability)

        # Feature importances (average of both models)
        imp_temp = self.temp_model.feature_importances_
        imp_rain = self.rain_model.feature_importances_
        importances = (imp_temp + imp_rain) / 2
        fi = sorted(
            zip(FEATURE_NAMES, importances), key=lambda x: x[1], reverse=True
        )

        # Confidence: how close rain_prob is to 0 or 1 (certainty)
        confidence = float(max(rain_probability, 1 - rain_probability))

        # Generate ensemble scenarios
        import random
        random.seed(int(weather.get("temp", 20) * 10 + weather.get("humidity", 50)))
        
        temp_std = max(2.5, abs(weather["temp"] - predicted_temp) * 0.3)
        rain_std = max(0.1, rain_probability * 0.25)
        
        scenarios = [
            {
                "id": "best-case",
                "name": "Best Case",
                "type": "best_case",
                "temp": round(predicted_temp - temp_std * 0.8, 1),
                "rain_probability": round(max(0, rain_probability - rain_std * 0.6), 2),
                "condition": _get_condition(predicted_temp - temp_std * 0.8, rain_probability - rain_std * 0.6),
                "probability": 0.25,
                "description": "Lower temperature with minimal rain chance - ideal outdoor conditions"
            },
            {
                "id": "likely",
                "name": "Likely",
                "type": "likely",
                "temp": round(predicted_temp, 1),
                "rain_probability": round(rain_probability, 2),
                "condition": condition,
                "probability": 0.5,
                "description": "Most probable outcome based on current weather patterns"
            },
            {
                "id": "worst-case",
                "name": "Worst Case",
                "type": "worst_case",
                "temp": round(predicted_temp + temp_std, 1),
                "rain_probability": round(min(0.95, rain_probability + rain_std * 0.8), 2),
                "condition": "rainy" if rain_probability > 0.5 else "cloudy",
                "probability": 0.25,
                "description": "Higher temperature with increased rain probability"
            }
        ]

        # Adjust scenario probabilities based on confidence
        if confidence > 0.8:
            scenarios[0]["probability"] = 0.15
            scenarios[1]["probability"] = 0.7
            scenarios[2]["probability"] = 0.15
        elif confidence < 0.5:
            scenarios[0]["probability"] = 0.3
            scenarios[1]["probability"] = 0.4
            scenarios[2]["probability"] = 0.3

        return {
            "predicted_temp": predicted_temp,
            "rain_probability": rain_probability,
            "predicted_condition": condition,
            "confidence": confidence,
            "model_accuracy": self.rain_accuracy,
            "feature_importance": [
                {"feature": name, "importance": float(imp)} for name, imp in fi
            ],
            "scenarios": scenarios
        }


# Singleton model instance
_model: WeatherMLModel | None = None


def get_model() -> WeatherMLModel:
    global _model
    if _model is None:
        _model = WeatherMLModel()
        _model.train()
        print("✓ ML model trained successfully")
        print(f"  Temp prediction R²:  {_model.temp_accuracy:.3f}")
        print(f"  Rain prediction Acc: {_model.rain_accuracy:.3f}")
    return _model
