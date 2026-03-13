import asyncio
import json
import os
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
