# 🌤️ SkySense: Weather Prediction

<div align="center">

  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-009485?style=for-the-badge&logo=fastapi&logoColor=white" />

  <p><strong>Modern weather dashboard with real-time data, ML predictions, and glassmorphic UI.</strong></p>
</div>

---

## 📖 Overview

SkySense is a **predictive weather intelligence tool**. It combines **real-time OpenWeatherMap data** with a custom **RandomForest ML model** to deliver "Best/Likely/Worst" case scenarios. Designed with a **glassmorphic Bento-style dashboard**, it offers a premium experience for both casual users and industries like Agriculture and Construction.

---

## 🚀 Features

- 🌍 **Current Weather & 5-Day Forecast** (OpenWeatherMap)
- 🤖 **ML Predictions** (Rain probability, temperature forecasts)
- 📊 **Interactive Charts** (Hourly trends with Recharts)
- 🎨 **Glassmorphic UI** (Dark/Light theme toggle)
- ⚡ **Fast Development** (React 19 + Vite)
---

## 🛠 Quick Start

### Backend (Optional for ML)
```bash
cd backend
pip install -r requirements.txt
# Add OPENWEATHER_API_KEY to backend/.env
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 📂 Project Structure

```bash
SkySense/
├── 🐍 backend/                # FastAPI Application
│   ├── ml_model.py           # RandomForest Logic & Scenarios
│   ├── weather_service.py    # OpenWeather API Integration
│   └── main.py               # REST Endpoints
├── ⚛️ frontend/               # React Application
│   ├── src/components/       # Glassmorphic UI Components
│   ├── src/store/            # Zustand State Stores
│   └── src/lib/              # API Client & Mock Data
└── README.md
```

---

## 🔧 Tech Stack

### Frontend
- React 19 + Vite
- TypeScript
- Tailwind CSS + shadcn/ui
- Zustand (Global State)
- TanStack Query (Server State)

### Backend
- FastAPI (Python)
- Scikit-Learn (RandomForest Regressor)
- Pandas & NumPy
- OpenWeatherMap API

---

## 🎯 Usage

1. Search for a city in the top bar.  
2. Switch tabs: **Overview**, **Forecast**, **AI Prediction**.  
3. Enjoy smooth glassmorphism with real-time insights.  

---

## 🛣 Roadmap

- [ ] **Hyper-local Alerts:** Push notifications for sudden weather shifts.  
- [ ] **Satellite Overlays:** Mapbox integration for precipitation visualization.  
- [ ] **Historical Trends:** Compare current weather with 10-year averages.  

---

## 📄 License

MIT — Free to use and fork.

---

<div align="center">
  <p>Built with ❤️ by <strong>Abhijith Shetty</strong></p>
  <a href="https://github.com/abhijithshetty12">
    <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" />
  </a>
  <a href="https://www.linkedin.com/in/abhijithshetty12">
    <img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" />
  </a>
</div>