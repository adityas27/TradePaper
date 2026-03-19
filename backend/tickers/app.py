import asyncio
import json
import os
from datetime import datetime
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import websockets
import httpx
import yfinance as yf

FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY", "d6tvb4hr01qjm9brslvgd6tvb4hr01qjm9brsm00")
TICKERS = ["AAPL", "GOOGL", "MSFT", "AMZN", "NVDA", "META", "TSLA", "JPM"]

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

prices = {}
candles = {}
clients = set()


def get_bucket(timestamp_ms, interval_minutes=1):
    dt = datetime.utcfromtimestamp(timestamp_ms / 1000)
    minute = (dt.minute // interval_minutes) * interval_minutes
    return dt.replace(minute=minute, second=0, microsecond=0)


def update_candle(symbol, price, timestamp):
    bucket = get_bucket(timestamp)

    symbol_data = candles.setdefault(symbol, {}).setdefault("1m", {
        "current": None,
        "history": []
    })

    current = symbol_data["current"]

    if current is None:
        symbol_data["current"] = {
            "time": bucket.isoformat(),
            "open": price,
            "high": price,
            "low": price,
            "close": price
        }
        return

    if current["time"] == bucket.isoformat():
        current["high"] = max(current["high"], price)
        current["low"] = min(current["low"], price)
        current["close"] = price
    else:
        symbol_data["history"].append(current)
        symbol_data["history"] = symbol_data["history"][-100:]
        symbol_data["current"] = {
            "time": bucket.isoformat(),
            "open": price,
            "high": price,
            "low": price,
            "close": price
        }


async def fetch_initial_prices():
    async with httpx.AsyncClient() as client:
        tasks = [
            client.get(
                f"https://finnhub.io/api/v1/quote",
                params={"symbol": ticker, "token": FINNHUB_API_KEY}
            )
            for ticker in TICKERS
        ]
        responses = await asyncio.gather(*tasks, return_exceptions=True)

        for ticker, res in zip(TICKERS, responses):
            try:
                if res.status_code == 200:
                    data = res.json()
                    price = data.get("c")
                    if price:
                        prices[ticker] = price
            except:
                pass


async def listen_finnhub():
    while True:
        try:
            async with websockets.connect(f"wss://ws.finnhub.io?token={FINNHUB_API_KEY}") as ws:
                for ticker in TICKERS:
                    await ws.send(json.dumps({"type": "subscribe", "symbol": ticker}))

                async for msg in ws:
                    data = json.loads(msg)
                    if data.get("type") == "trade":
                        for trade in data.get("data", []):
                            symbol = trade["s"]
                            price = trade["p"]
                            timestamp = trade["t"]

                            prices[symbol] = price
                            update_candle(symbol, price, timestamp)
        except:
            await asyncio.sleep(2)


async def broadcast():
    while True:
        await asyncio.sleep(2)
        if clients and prices:
            msg = json.dumps(prices)
            for client in list(clients):
                try:
                    await client.send_text(msg)
                except:
                    clients.discard(client)


@app.on_event("startup")
async def startup():
    await fetch_initial_prices()
    asyncio.create_task(listen_finnhub())
    asyncio.create_task(broadcast())


@app.websocket("/ws/prices")
async def ws_endpoint(websocket: WebSocket):
    await websocket.accept()
    clients.add(websocket)
    try:
        if prices:
            await websocket.send_text(json.dumps(prices))
        while True:
            await websocket.receive_text()
    except:
        pass
    finally:
        clients.discard(websocket)


@app.get("/price/{ticker}")
async def get_price(ticker: str):
    return {"ticker": ticker, "price": prices.get(ticker.upper(), 0.0)}


@app.get("/candles/{ticker}")
async def get_candles(ticker: str):
    symbol_data = candles.get(ticker.upper(), {}).get("1m", {})
    history = symbol_data.get("history", [])
    current = symbol_data.get("current")
    result = history.copy()
    if current:
        result.append(current)
    return result


@app.get("/yf-history/{ticker}")
async def get_yf_history(ticker: str, interval: str = "1m", period: str = "1d"):
    symbol = ticker.upper().strip()

    intervals_to_try = []
    for candidate in [interval, "5m", "1d"]:
        if candidate and candidate not in intervals_to_try:
            intervals_to_try.append(candidate)

    for selected_interval in intervals_to_try:
        try:
            data = await asyncio.to_thread(
                lambda: yf.Ticker(symbol).history(
                    period=period,
                    interval=selected_interval,
                    actions=False,
                )
            )
        except Exception:
            continue

        if data is None or data.empty or "Close" not in data.columns:
            continue

        close_series = data["Close"].dropna()
        response = []

        for timestamp, price in close_series.items():
            if hasattr(timestamp, "to_pydatetime"):
                iso_time = timestamp.to_pydatetime().isoformat()
            else:
                iso_time = str(timestamp)

            response.append({
                "time": iso_time,
                "price": float(price),
            })

        return response

    return []


@app.get("/")
async def root():
    return {
        "status": "running",
        "clients": len(clients),
        "prices": prices,
        "finnhub_connected": bool(FINNHUB_API_KEY)
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="info")