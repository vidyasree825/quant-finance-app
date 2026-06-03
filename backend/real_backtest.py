import pandas as pd
import numpy as np
import yfinance as yf
import joblib
from ta.momentum import RSIIndicator
from ta.trend import MACD, SMAIndicator

model = joblib.load("model.pkl")

def get_data(ticker="AAPL", period="1y"):
    df = yf.download(ticker, period=period, auto_adjust=True)
    if df.empty:
        raise Exception(f"No data found for {ticker}")
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)
    df.dropna(inplace=True)
    return df

def add_features(df):
    close = df["Close"]
    high = df["High"]
    low = df["Low"]
    volume = df["Volume"]
    df["SMA_10"] = SMAIndicator(close, window=10).sma_indicator()
    df["SMA_50"] = SMAIndicator(close, window=50).sma_indicator()
    df["EMA_10"] = close.ewm(span=10, adjust=False).mean()
    df["RSI"] = RSIIndicator(close, window=14).rsi()
    macd = MACD(close)
    df["MACD"] = macd.macd()
    df["Returns"] = close.pct_change()
    sma20 = close.rolling(window=20).mean()
    std20 = close.rolling(window=20).std()
    df["BB_HIGH"] = sma20 + (std20 * 2)
    df["BB_LOW"] = sma20 - (std20 * 2)
    tr1 = high - low
    tr2 = (high - close.shift()).abs()
    tr3 = (low - close.shift()).abs()
    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    df["ATR"] = tr.rolling(window=14).mean()
    lowest_low = low.rolling(window=14).min()
    highest_high = high.rolling(window=14).max()
    df["STOCH"] = 100 * (close - lowest_low) / (highest_high - lowest_low)
    df["VOL_SMA"] = volume.rolling(window=20).mean()
    df.dropna(inplace=True)
    return df

def backtest(df):
    features = list(model.feature_names_in_)
    X = df[features]
    df["prediction"] = model.predict(X)
    df["strategy_return"] = df["prediction"] * df["Returns"]
    df["cumulative_strategy"] = (1 + df["strategy_return"]).cumprod()
    df["cumulative_market"] = (1 + df["Returns"]).cumprod()
    return df

def metrics(df):
    r = df["strategy_return"]
    sharpe = (r.mean() / r.std()) * np.sqrt(252)
    peak = df["cumulative_strategy"].cummax()
    drawdown = (df["cumulative_strategy"] - peak) / peak
    return {
        "Sharpe Ratio": sharpe,
        "Max Drawdown": drawdown.min(),
        "Win Rate": (r > 0).mean()
    }