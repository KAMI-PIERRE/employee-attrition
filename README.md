# Employee Attrition Prediction System

Full-stack machine learning application that predicts whether an employee is likely to leave the company (`LeaveOrNot`).

**Stack:** Flask (REST API) · React + Vite (frontend) · scikit-learn / XGBoost (models)

---

## Project Structure

```
employee-attrition-system/
├── data/
│   └── Employee.csv                 # Dataset
├── notebooks/
│   └── exploration_and_training.ipynb
├── backend/
│   ├── app.py                       # Flask API
│   ├── requirements.txt
│   └── model/
│       ├── pipeline.pkl             # Preprocessor + best model
│       └── metrics.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── PredictionForm.jsx
│   │   │   ├── ResultCard.jsx
│   │   │   └── ModelInfo.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── train_model.py                   # Standalone training script
└── README.md
```

---

## Quick Start (VS Code)

### 1. Prerequisites

- Python 3.9+
- Node.js 18+ and npm
- (Optional) VS Code with Python & ESLint extensions

### 2. Backend

```bash
cd employee-attrition-system/backend

# Create virtual environment (recommended)
python -m venv venv

# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt

# Start the API (port 5000)
python app.py
```

You should see:
```
 * Running on http://0.0.0.0:5000
```

Test endpoints:
- Health: http://localhost:5000/health
- Model info: http://localhost:5000/model-info

### 3. Frontend

Open a **new terminal**:

```bash
cd employee-attrition-system/frontend

npm install
npm run dev
```

Open the app at: **http://localhost:5173**

The Vite dev server proxies `/api/*` to the Flask backend, but the frontend is configured to call `http://localhost:5000` directly (CORS is enabled).

### 4. (Optional) Retrain the model

```bash
cd employee-attrition-system
python train_model.py
```

This overwrites `backend/model/pipeline.pkl` and `metrics.json`.

---

## API Reference

### `POST /predict`

**Request body:**
```json
{
  "Education": "Bachelors",
  "JoiningYear": 2017,
  "City": "Bangalore",
  "PaymentTier": 3,
  "Age": 28,
  "Gender": "Male",
  "EverBenched": "No",
  "ExperienceInCurrentDomain": 3
}
```

**Response:**
```json
{
  "prediction": 0,
  "probability": 0.3124,
  "message": "Employee is likely to stay"
}
```

### `GET /health`
```json
{ "status": "healthy", "model_loaded": true }
```

### `GET /model-info`
Returns best model name, metrics (accuracy, precision, recall, F1, ROC-AUC, confusion matrix), and feature importance.

---

## Dataset Features

| Feature | Type | Values |
|---------|------|--------|
| Education | Categorical | Bachelors, Masters, PHD |
| JoiningYear | Numeric | 2012–2018 |
| City | Categorical | Bangalore, Pune, New Delhi |
| PaymentTier | Numeric | 1, 2, 3 |
| Age | Numeric | 22–41 |
| Gender | Categorical | Male, Female |
| EverBenched | Categorical | Yes, No |
| ExperienceInCurrentDomain | Numeric | 0–7 |
| **LeaveOrNot** (target) | Binary | 0 = Stay, 1 = Leave |

---

## Models Trained

At least two models are trained and compared:

1. **Logistic Regression** (baseline, class-weighted)
2. **Random Forest**
3. **XGBoost** (if installed)

The model with the highest ROC-AUC on the test set is saved together with the preprocessing pipeline (`ColumnTransformer` + classifier) as a single `pipeline.pkl` file.

---

## Notes

- Class imbalance is handled via `class_weight='balanced'` / `scale_pos_weight`.
- The frontend shows real-time prediction with colour-coded visual feedback (green = stay, red = leave) and a probability bar.
- Model performance metrics and feature importance are displayed on the right panel.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS errors | Make sure Flask is running with `flask-cors` and you started `app.py` (not a different WSGI). |
| `ModuleNotFoundError` | Activate the virtualenv and re-run `pip install -r requirements.txt`. |
| Frontend cannot reach API | Confirm backend is on port 5000 and no firewall is blocking localhost. |
| Model not loaded | Run `python train_model.py` from the project root. |

---

**Good luck!** Focus on clean code, solid evaluation, and a polished user experience.
