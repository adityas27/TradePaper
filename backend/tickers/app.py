import asyncio
import json
import os
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import websockets

FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY", "")
TICKERS = ["AAPL", "GOOGL", "MSFT", "AMZN", "NVDA", "META", "TSLA", "JPM"]

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

prices = {}
clients = set()


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
                            prices[trade["s"]] = trade["p"]
        except:
            await asyncio.sleep(2)


async def broadcast():
    while True:
        await asyncio.sleep(2)
        if clients:
            msg = json.dumps(prices)
            for client in list(clients):
                try:
                    await client.send_text(msg)
                except:
                    clients.discard(client)


@app.on_event("startup")
async def startup():
    asyncio.create_task(listen_finnhub())
    asyncio.create_task(broadcast())


@app.websocket("/ws/prices")
async def ws_endpoint(websocket: WebSocket):
    await websocket.accept()
    clients.add(websocket)
    try:
        while True:
            await websocket.receive_text()
    except:
        clients.discard(websocket)


@app.get("/price/{ticker}")
async def get_price(ticker: str):
    return {"ticker": ticker, "price": prices.get(ticker, 0.0)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
