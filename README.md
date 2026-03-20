
# 🌾 AgriConnect

AgriConnect is an intelligent agriculture platform that helps farmers and stakeholders with:
- 📈 Crop Price Prediction (using LSTM)
- 🌱 Crop Recommendation (using Machine Learning)
- 🌦️ Data-driven insights based on weather and soil parameters

---

## 🚀 Features

### 🔹 1. Crop Price Prediction
- Predicts **next month crop price**
- Supports multiple crops (paddy, turmeric, wheat, etc.)
- Uses:
  - LSTM (Deep Learning)
  - Time-series features (lag, rolling mean, seasonality)

---

### 🔹 2. Crop Recommendation
- Suggests **top 3 suitable crops**
- Based on:
  - Nitrogen (N)
  - Phosphorus (P)
  - Potassium (K)
  - Temperature
  - Humidity
  - Rainfall
  - pH value

---

### 🔹 3. Full Stack Architecture
- **Frontend**: React (Vite)
- **Backend**: Node.js + Express
- **ML API**: FastAPI (Python)

---

## 🏗️ Project Structure

```

AgriConnect/
│
├── Frontend/              # React App
├── Backend/               # Node.js API
├── MyModal/               # Machine Learning Models
│   ├── app/               # FastAPI routes
│   ├── data/raw/          # Crop datasets
│   ├── src/               # ML pipeline
│   ├── models/            # Trained models
│   └── requirements.txt
│
└── run_agriconnect.bat    # Run all services

````

---

## ⚙️ Installation

### 🔹 1. Clone Repository
```bash
git clone https://github.com/Arivuselvam95/AgriConnect.git
cd AgriConnect
````

---

### 🔹 2. Setup Backend

```bash
cd Backend
npm install
npm start
```

---

### 🔹 3. Setup Frontend

```bash
cd Frontend
npm install
npm run dev
```

---

### 🔹 4. Setup ML Model (FastAPI)

```bash
cd MyModal

# Create virtual environment
python -m venv venv

# Activate
venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn app.main:app --reload
```

---

## ▶️ Run Entire Project

You can directly run:

```bash
run_agriconnect.bat
```

---

## 📡 API Endpoints

### 🔹 Price Prediction

```http
GET /predict/{crop}
```

**Example:**

```
/predict/turmeric
```

---

### 🔹 Crop Recommendation

```http
POST /predict/crop
```

**Request Body:**

```json
{
  "Nitrogen": 90,
  "Phosphorus": 40,
  "Potassium": 40,
  "Temperature": 25,
  "Humidity": 70,
  "pH_Value": 6.5,
  "Rainfall": 200
}
```

---

## 🧠 ML Models Used

| Task                | Model                |
| ------------------- | -------------------- |
| Price Prediction    | LSTM                 |
| Feature Selection   | Random Forest        |
| Crop Recommendation | Classification Model |

---

## 📊 Features Used in Price Prediction

* Rainfall
* WPI (Wholesale Price Index)
* Month (sin & cos encoding)
* Lag Features:

  * Price_lag_1
  * Price_lag_2
  * Price_lag_3
* Rolling Mean

---

## 🔮 Future Enhancements

* Multi-month price prediction (3–6 months)
* Weather API integration
* Farmer dashboard with analytics
* Mobile app support
* Real-time market data

---


