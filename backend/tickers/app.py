import asyncio
import json
import os
from datetime import datetime, timedelta
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import websockets

FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY", "d6ev2ghr01qvn4o16mmgd6ev2ghr01qvn4o16mn0")
TICKERS = ["AAPL", "GOOGL", "MSFT", "AMZN", "NVDA", "META", "TSLA", "JPM"]

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Initialize with mock prices for testing
prices = {
    "AAPL": 178.25,
    "GOOGL": 141.80,
    "MSFT": 378.91,
    "AMZN": 178.50,
    "NVDA": 495.22,
    "META": 504.50,
    "TSLA": 242.18,
    "JPM": 195.40
}

# Mock OHLC data for testing
ohlc_data = {
    "AAPL": [
        {"time": "2024-03-14", "open": 175.50, "high": 180.00, "low": 174.25, "close": 178.25},
        {"time": "2024-03-13", "open": 177.00, "high": 179.50, "low": 176.00, "close": 175.80},
        {"time": "2024-03-12", "open": 174.75, "high": 178.00, "low": 173.50, "close": 176.90},
        {"time": "2024-03-11", "open": 173.25, "high": 175.50, "low": 172.00, "close": 175.10},
        {"time": "2024-03-10", "open": 175.80, "high": 176.50, "low": 172.75, "close": 173.50},
        {"time": "2024-03-09", "open": 176.50, "high": 178.00, "low": 175.00, "close": 176.20},
        {"time": "2024-03-08", "open": 174.00, "high": 177.25, "low": 173.00, "close": 176.75},
        {"time": "2024-03-07", "open": 172.50, "high": 174.75, "low": 171.50, "close": 174.25},
        {"time": "2024-03-06", "open": 170.75, "high": 173.50, "low": 170.00, "close": 172.80},
        {"time": "2024-03-05", "open": 169.25, "high": 171.75, "low": 168.50, "close": 171.00},
    ],
    "GOOGL": [
        {"time": "2024-03-14", "open": 139.00, "high": 143.00, "low": 138.50, "close": 141.80},
        {"time": "2024-03-13", "open": 142.00, "high": 143.50, "low": 140.75, "close": 139.50},
        {"time": "2024-03-12", "open": 140.50, "high": 142.75, "low": 140.00, "close": 141.90},
        {"time": "2024-03-11", "open": 139.75, "high": 141.25, "low": 138.50, "close": 140.75},
        {"time": "2024-03-10", "open": 141.50, "high": 142.00, "low": 139.25, "close": 140.00},
        {"time": "2024-03-09", "open": 142.25, "high": 143.00, "low": 140.50, "close": 141.75},
        {"time": "2024-03-08", "open": 140.00, "high": 142.50, "low": 139.50, "close": 142.00},
        {"time": "2024-03-07", "open": 138.75, "high": 140.50, "low": 138.00, "close": 140.25},
        {"time": "2024-03-06", "open": 137.50, "high": 139.25, "low": 137.00, "close": 139.00},
        {"time": "2024-03-05", "open": 136.25, "high": 138.00, "low": 135.75, "close": 137.75},
    ],
    "MSFT": [
        {"time": "2024-03-14", "open": 375.00, "high": 380.00, "low": 374.50, "close": 378.91},
        {"time": "2024-03-13", "open": 379.00, "high": 381.50, "low": 377.00, "close": 376.25},
        {"time": "2024-03-12", "open": 377.50, "high": 380.00, "low": 376.75, "close": 378.90},
        {"time": "2024-03-11", "open": 376.00, "high": 378.50, "low": 375.00, "close": 377.75},
        {"time": "2024-03-10", "open": 378.50, "high": 379.50, "low": 375.25, "close": 376.50},
        {"time": "2024-03-09", "open": 379.75, "high": 381.00, "low": 378.00, "close": 379.25},
        {"time": "2024-03-08", "open": 377.00, "high": 380.00, "low": 376.50, "close": 379.50},
        {"time": "2024-03-07", "open": 375.50, "high": 377.75, "low": 375.00, "close": 377.25},
        {"time": "2024-03-06", "open": 373.75, "high": 376.00, "low": 373.00, "close": 375.50},
        {"time": "2024-03-05", "open": 372.00, "high": 374.25, "low": 371.50, "close": 374.00},
    ],
    "AMZN": [
        {"time": "2024-03-14", "open": 176.00, "high": 180.00, "low": 175.50, "close": 178.50},
        {"time": "2024-03-13", "open": 179.00, "high": 180.50, "low": 177.00, "close": 176.75},
        {"time": "2024-03-12", "open": 177.50, "high": 179.50, "low": 176.75, "close": 178.90},
        {"time": "2024-03-11", "open": 176.00, "high": 178.25, "low": 175.50, "close": 177.75},
        {"time": "2024-03-10", "open": 178.00, "high": 179.00, "low": 175.50, "close": 176.50},
        {"time": "2024-03-09", "open": 179.00, "high": 180.00, "low": 177.50, "close": 178.75},
        {"time": "2024-03-08", "open": 177.00, "high": 179.50, "low": 176.50, "close": 178.50},
        {"time": "2024-03-07", "open": 175.50, "high": 177.50, "low": 175.00, "close": 177.00},
        {"time": "2024-03-06", "open": 173.75, "high": 176.00, "low": 173.00, "close": 175.50},
        {"time": "2024-03-05", "open": 172.00, "high": 174.50, "low": 171.50, "close": 173.75},
    ],
    "NVDA": [
        {"time": "2024-03-14", "open": 490.00, "high": 500.00, "low": 488.50, "close": 495.22},
        {"time": "2024-03-13", "open": 498.00, "high": 502.00, "low": 495.50, "close": 491.75},
        {"time": "2024-03-12", "open": 495.00, "high": 500.00, "low": 493.75, "close": 497.90},
        {"time": "2024-03-11", "open": 492.00, "high": 496.50, "low": 490.75, "close": 495.25},
        {"time": "2024-03-10", "open": 497.50, "high": 500.00, "low": 490.00, "close": 492.50},
        {"time": "2024-03-09", "open": 501.00, "high": 503.00, "low": 496.50, "close": 498.00},
        {"time": "2024-03-08", "open": 497.00, "high": 502.00, "low": 496.00, "close": 500.50},
        {"time": "2024-03-07", "open": 494.00, "high": 498.00, "low": 492.50, "close": 497.00},
        {"time": "2024-03-06", "open": 490.00, "high": 495.00, "low": 488.75, "close": 494.25},
        {"time": "2024-03-05", "open": 487.00, "high": 491.75, "low": 485.50, "close": 490.50},
    ],
    "META": [
        {"time": "2024-03-14", "open": 500.00, "high": 508.00, "low": 499.50, "close": 504.50},
        {"time": "2024-03-13", "open": 506.00, "high": 510.00, "low": 503.50, "close": 501.75},
        {"time": "2024-03-12", "open": 503.00, "high": 507.00, "low": 502.00, "close": 505.50},
        {"time": "2024-03-11", "open": 501.00, "high": 504.50, "low": 500.00, "close": 503.25},
        {"time": "2024-03-10", "open": 505.50, "high": 508.00, "low": 500.50, "close": 501.50},
        {"time": "2024-03-09", "open": 509.00, "high": 510.50, "low": 504.50, "close": 506.00},
        {"time": "2024-03-08", "open": 505.00, "high": 510.00, "low": 504.50, "close": 508.50},
        {"time": "2024-03-07", "open": 502.00, "high": 506.00, "low": 501.00, "close": 505.50},
        {"time": "2024-03-06", "open": 498.00, "high": 503.00, "low": 497.00, "close": 502.25},
        {"time": "2024-03-05", "open": 495.00, "high": 499.50, "low": 494.00, "close": 498.75},
    ],
    "TSLA": [
        {"time": "2024-03-14", "open": 240.00, "high": 245.00, "low": 238.50, "close": 242.18},
        {"time": "2024-03-13", "open": 244.00, "high": 246.00, "low": 241.50, "close": 240.50},
        {"time": "2024-03-12", "open": 241.00, "high": 245.00, "low": 240.00, "close": 243.90},
        {"time": "2024-03-11", "open": 239.00, "high": 242.50, "low": 238.00, "close": 241.75},
        {"time": "2024-03-10", "open": 243.00, "high": 244.50, "low": 238.50, "close": 239.50},
        {"time": "2024-03-09", "open": 245.00, "high": 247.00, "low": 242.50, "close": 243.00},
        {"time": "2024-03-08", "open": 242.00, "high": 245.50, "low": 241.50, "close": 244.50},
        {"time": "2024-03-07", "open": 240.00, "high": 243.00, "low": 239.50, "close": 242.25},
        {"time": "2024-03-06", "open": 237.50, "high": 240.75, "low": 237.00, "close": 240.00},
        {"time": "2024-03-05", "open": 235.75, "high": 238.50, "low": 235.00, "close": 237.75},
    ],
    "JPM": [
        {"time": "2024-03-14", "open": 192.00, "high": 197.00, "low": 191.50, "close": 195.40},
        {"time": "2024-03-13", "open": 196.00, "high": 198.00, "low": 193.50, "close": 192.75},
        {"time": "2024-03-12", "open": 193.00, "high": 197.00, "low": 192.50, "close": 196.00},
        {"time": "2024-03-11", "open": 191.00, "high": 194.50, "low": 190.50, "close": 193.25},
        {"time": "2024-03-10", "open": 195.00, "high": 196.50, "low": 190.50, "close": 191.75},
        {"time": "2024-03-09", "open": 197.00, "high": 198.50, "low": 194.50, "close": 195.00},
        {"time": "2024-03-08", "open": 194.00, "high": 197.50, "low": 193.50, "close": 196.50},
        {"time": "2024-03-07", "open": 192.00, "high": 195.00, "low": 191.50, "close": 194.25},
        {"time": "2024-03-06", "open": 189.50, "high": 192.75, "low": 189.00, "close": 192.00},
        {"time": "2024-03-05", "open": 187.75, "high": 190.50, "low": 187.00, "close": 189.75},
    ]
}

clients = set()


async def listen_finnhub():
    while True:
        try:
            print(f"Connecting to Finnhub with API key: {FINNHUB_API_KEY[:10]}...")
            async with websockets.connect(f"wss://ws.finnhub.io?token={FINNHUB_API_KEY}") as ws:
                print("Connected to Finnhub!")
                for ticker in TICKERS:
                    await ws.send(json.dumps({"type": "subscribe", "symbol": ticker}))
                    print(f"Subscribed to {ticker}")
                
                async for msg in ws:
                    data = json.loads(msg)
                    if data.get("type") == "trade":
                        for trade in data.get("data", []):
                            prices[trade["s"]] = trade["p"]
                            print(f"Updated {trade['s']}: ${trade['p']}")
        except Exception as e:
            print(f"Finnhub error: {e}")
            await asyncio.sleep(2)


async def broadcast():
    while True:
        await asyncio.sleep(2)
        if clients and prices:
            msg = json.dumps(prices)
            print(f"Broadcasting to {len(clients)} clients: {msg}")
            for client in list(clients):
                try:
                    await client.send_text(msg)
                except Exception as e:
                    print(f"Failed to send to client: {e}")
                    clients.discard(client)


@app.on_event("startup")
async def startup():
    asyncio.create_task(listen_finnhub())
    asyncio.create_task(broadcast())


@app.websocket("/ws/prices")
async def ws_endpoint(websocket: WebSocket):
    await websocket.accept()
    clients.add(websocket)
    print(f"Client connected. Total clients: {len(clients)}")
    try:
        # Send initial prices immediately
        if prices:
            await websocket.send_text(json.dumps(prices))
        
        # Keep connection alive
        while True:
            try:
                # Wait for any message from client (or just keep alive)
                await websocket.receive_text()
            except Exception as e:
                print(f"Error receiving: {e}")
                break
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        clients.discard(websocket)
        print(f"Client disconnected. Total clients: {len(clients)}")


@app.get("/price/{ticker}")
async def get_price(ticker: str):
    return {"ticker": ticker, "price": prices.get(ticker, 0.0)}


@app.get("/candles/{ticker}")
async def get_candles(ticker: str):
    """Get OHLC candlestick data for a ticker"""
    return ohlc_data.get(ticker.upper(), [])


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
    print("Starting FastAPI server on http://0.0.0.0:8001")
    print(f"WebSocket endpoint: ws://localhost:8001/ws/prices")
    print(f"Finnhub API Key configured: {bool(FINNHUB_API_KEY)}")
    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="info")
