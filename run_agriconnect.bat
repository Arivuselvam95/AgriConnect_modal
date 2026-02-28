@echo off
echo Starting AgriConnect Project...
echo.

REM ------------------------------
REM Start Backend
REM ------------------------------
echo Starting Backend Server...
start cmd /k "cd Backend && npm start"

REM ------------------------------
REM Start Frontend
REM ------------------------------
echo Starting Frontend Server...
start cmd /k "cd Frontend && npm run dev"

REM ------------------------------
REM Start ML Model (FastAPI)
REM ------------------------------
echo Starting ML Model Server...
start cmd /k "cd MyModal && venv\Scripts\activate && uvicorn app.main:app --reload"

echo.
echo All services are starting...
echo Backend -> http://localhost:5000
echo Frontend -> http://localhost:5173
echo ML API -> http://127.0.0.1:8000