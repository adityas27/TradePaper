import requests
from django.conf import settings

FASTAPI_BASE_URL = "http://localhost:8001"


def get_live_price(symbol):
    """Fetch live price from FastAPI microservice"""
    try:
        response = requests.get(f"{FASTAPI_BASE_URL}/price/{symbol}", timeout=5)
        if response.status_code == 200:
            data = response.json()
            return {
                "symbol": symbol,
                "price": data.get("price", 0)
            }
    except Exception as e:
        print(f"Error fetching live price for {symbol}: {e}")
    
    return {"symbol": symbol, "price": 0}


def get_ohlc_data(symbol, limit=30):
    """Fetch OHLC data from FastAPI microservice"""
    try:
        response = requests.get(f"{FASTAPI_BASE_URL}/candles/{symbol}", timeout=5)
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                return data[:limit]
            return data.get("data", [])[:limit]
    except Exception as e:
        print(f"Error fetching OHLC data for {symbol}: {e}")
    
    return []
