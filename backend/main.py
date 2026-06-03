from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib
from real_backtest import get_data, add_features, backtest, metrics

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = joblib.load("model.pkl")

COMPANIES = [
    {"ticker": "RELIANCE", "name": "Reliance Industries", "sector": "Energy"},
    {"ticker": "TCS", "name": "Tata Consultancy Services", "sector": "IT"},
    {"ticker": "INFY", "name": "Infosys", "sector": "IT"},
    {"ticker": "HDFCBANK", "name": "HDFC Bank", "sector": "Banking"},
    {"ticker": "ICICIBANK", "name": "ICICI Bank", "sector": "Banking"},
    {"ticker": "SBIN", "name": "State Bank of India", "sector": "Banking"},
    {"ticker": "WIPRO", "name": "Wipro", "sector": "IT"},
    {"ticker": "TATAMOTORS", "name": "Tata Motors", "sector": "Auto"},
    {"ticker": "BAJFINANCE", "name": "Bajaj Finance", "sector": "Finance"},
    {"ticker": "HCLTECH", "name": "HCL Technologies", "sector": "IT"},
]

class InputData(BaseModel):
    SMA_10: float
    SMA_50: float
    RSI: float
    MACD: float
    Returns: float

@app.get("/")
def home():
    return {"message": "Quant Finance API Running"}

@app.get("/companies")
def get_companies():
    return {"companies": COMPANIES}

@app.post("/predict")
def predict(data: InputData):
    df = pd.DataFrame([data.dict()])
    expected_features = list(model.feature_names_in_)
    for col in expected_features:
        if col not in df.columns:
            df[col] = 0
    df = df[expected_features]
    prediction = model.predict(df)[0]
    signal = "BUY" if prediction == 1 else "SELL" if prediction == -1 else "HOLD"
    return {"prediction": int(prediction), "signal": signal}

@app.get("/backtest/{ticker}")
def run_stock_backtest(ticker: str):
    stock = f"{ticker}.NS"
    df = get_data(stock, "1y")
    df = add_features(df)
    result = backtest(df)
    perf = metrics(result)
    final_return = (result["cumulative_strategy"].iloc[-1] - 1) * 100
    return {
        "ticker": ticker,
        "final_return": round(float(final_return), 2),
        "sharpe_ratio": round(float(perf["Sharpe Ratio"]), 2),
        "max_drawdown": round(float(perf["Max Drawdown"]) * 100, 2),
        "win_rate": round(float(perf["Win Rate"]) * 100, 2),
    }