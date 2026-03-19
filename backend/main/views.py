from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.db.models import Sum  # kept for potential future use
from decimal import Decimal
from .models import Ticker, Portfolio, Position, TradeTransaction, Watchlist
from .serializers import (
    TickerSerializer,
    TickerDetailSerializer,
    PositionSerializer,
    PortfolioSerializer,
    PortfolioDetailSerializer,
    TradeTransactionSerializer,
    WatchlistSerializer,
)
from .services.market import get_live_price, get_ohlc_data


# ============================================================================
# TICKER VIEWS
# ============================================================================

@api_view(['GET'])
@permission_classes([AllowAny])
def ticker_list(request):
    """Get all tickers"""
    tickers = Ticker.objects.all()
    serializer = TickerSerializer(tickers, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def ticker_detail(request, symbol):
    """Get ticker details including watchlist status and user position"""
    ticker = get_object_or_404(Ticker, symbol=symbol)
    serializer = TickerDetailSerializer(ticker, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def ticker_price(request, symbol):
    """Get live price for ticker from FastAPI service"""
    ticker = get_object_or_404(Ticker, symbol=symbol)
    price_data = get_live_price(symbol)
    return Response(price_data)


@api_view(['GET'])
@permission_classes([AllowAny])
def ticker_ohlc(request, symbol):
    """Get OHLC data for ticker from FastAPI service"""
    ticker = get_object_or_404(Ticker, symbol=symbol)
    ohlc_data = get_ohlc_data(symbol)
    return Response(ohlc_data, status=status.HTTP_200_OK if ohlc_data else status.HTTP_204_NO_CONTENT)


# ============================================================================
# WATCHLIST VIEWS
# ============================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def watchlist_list(request):
    """Get user's watchlist"""
    watchlist = Watchlist.objects.filter(user=request.user).select_related('ticker')
    serializer = WatchlistSerializer(watchlist, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def watchlist_toggle(request):
    """Add or remove ticker from watchlist"""
    symbol = request.data.get('symbol')
    if not symbol:
        return Response({'error': 'Symbol required'}, status=status.HTTP_400_BAD_REQUEST)

    ticker = get_object_or_404(Ticker, symbol=symbol)
    watchlist_item = Watchlist.objects.filter(user=request.user, ticker=ticker).first()

    if watchlist_item:
        watchlist_item.delete()
        return Response({'message': 'Removed from watchlist', 'in_watchlist': False})
    else:
        Watchlist.objects.create(user=request.user, ticker=ticker)
        return Response({'message': 'Added to watchlist', 'in_watchlist': True})


# ============================================================================
# PORTFOLIO VIEWS
# ============================================================================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def portfolio_list(request):
    """List user's portfolios or create a new one"""
    if request.method == 'GET':
        portfolios = Portfolio.objects.filter(user=request.user).prefetch_related('positions', 'transactions')
        serializer = PortfolioSerializer(portfolios, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = PortfolioSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def portfolio_detail(request, pk):
    """Get portfolio details"""
    portfolio = get_object_or_404(Portfolio, id=pk, user=request.user)
    portfolio = Portfolio.objects.prefetch_related('positions', 'transactions').get(id=pk)
    serializer = PortfolioDetailSerializer(portfolio)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def portfolio_holdings(request, pk):
    """Get current stock holdings in portfolio"""
    portfolio = get_object_or_404(Portfolio, id=pk, user=request.user)
    positions = portfolio.positions.select_related('ticker')
    serializer = PositionSerializer(positions, many=True)
    return Response(serializer.data)


# ============================================================================
# TRANSACTION VIEWS
# ============================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def transaction_list(request):
    """Get user's transactions"""
    transactions = TradeTransaction.objects.filter(
        portfolio__user=request.user
    ).select_related('portfolio', 'ticker').order_by('-timestamp')
    serializer = TradeTransactionSerializer(transactions, many=True)
    return Response(serializer.data)


# ============================================================================
# TRADING VIEWS
# ============================================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def trade_buy(request):
    """Buy stocks"""
    portfolio_id = request.data.get('portfolio_id')
    symbol = request.data.get('symbol')
    quantity = request.data.get('quantity')
    price = request.data.get('price')

    if not all([portfolio_id, symbol, quantity, price]):
        return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        quantity = int(quantity)
        price = Decimal(str(price))
        if quantity <= 0 or price <= 0:
            return Response({'error': 'Quantity and price must be positive'}, status=status.HTTP_400_BAD_REQUEST)
    except (ValueError, TypeError):
        return Response({'error': 'Invalid quantity or price'}, status=status.HTTP_400_BAD_REQUEST)

    portfolio = get_object_or_404(Portfolio, id=portfolio_id, user=request.user)
    ticker = get_object_or_404(Ticker, symbol=symbol)

    total_amount = Decimal(quantity) * price

    with transaction.atomic():
        # Check balance
        if portfolio.balance < total_amount:
            return Response({'error': 'Insufficient balance'}, status=status.HTTP_400_BAD_REQUEST)

        # Update portfolio balance
        portfolio.balance -= total_amount
        portfolio.save()

        # Update or create position
        position, created = Position.objects.get_or_create(
            portfolio=portfolio,
            ticker=ticker,
            defaults={'quantity': 0, 'avg_buy_price': Decimal('0')}
        )

        old_quantity = position.quantity
        new_quantity = old_quantity + quantity
        new_avg_price = (
            (position.avg_buy_price * old_quantity + price * quantity) / new_quantity
        )

        position.quantity = new_quantity
        position.avg_buy_price = new_avg_price
        position.save()

        # Create transaction
        trans = TradeTransaction.objects.create(
            portfolio=portfolio,
            ticker=ticker,
            transaction_type='BUY',
            quantity=quantity,
            price=price,
        )

    return Response(
        {
            'message': 'Buy order executed',
            'transaction': TradeTransactionSerializer(trans).data,
            'position': PositionSerializer(position).data,
            'portfolio_balance': str(portfolio.balance),
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def trade_sell(request):
    """Sell stocks"""
    portfolio_id = request.data.get('portfolio_id')
    symbol = request.data.get('symbol')
    quantity = request.data.get('quantity')
    price = request.data.get('price')

    if not all([portfolio_id, symbol, quantity, price]):
        return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        quantity = int(quantity)
        price = Decimal(str(price))
        if quantity <= 0 or price <= 0:
            return Response({'error': 'Quantity and price must be positive'}, status=status.HTTP_400_BAD_REQUEST)
    except (ValueError, TypeError):
        return Response({'error': 'Invalid quantity or price'}, status=status.HTTP_400_BAD_REQUEST)

    portfolio = get_object_or_404(Portfolio, id=portfolio_id, user=request.user)
    ticker = get_object_or_404(Ticker, symbol=symbol)

    position = get_object_or_404(Position, portfolio=portfolio, ticker=ticker)

    if position.quantity < quantity:
        return Response({'error': 'Insufficient holdings'}, status=status.HTTP_400_BAD_REQUEST)

    total_amount = Decimal(quantity) * price

    with transaction.atomic():
        # Update portfolio balance
        portfolio.balance += total_amount
        portfolio.save()

        # Update position
        position.quantity -= quantity
        if position.quantity == 0:
            position.delete()
        else:
            position.save()

        # Create transaction
        trans = TradeTransaction.objects.create(
            portfolio=portfolio,
            ticker=ticker,
            transaction_type='SELL',
            quantity=quantity,
            price=price,
        )

    return Response(
        {
            'message': 'Sell order executed',
            'transaction': TradeTransactionSerializer(trans).data,
            'portfolio_balance': str(portfolio.balance),
        },
        status=status.HTTP_201_CREATED,
    )


# ============================================================================
# LEADERBOARD VIEW
# ============================================================================

@api_view(['GET'])
@permission_classes([AllowAny])
def leaderboard(request):
    """
    Leaderboard ranked by total portfolio value:
      total_value = cash balance + sum(position.quantity * live_price)
      net_profit  = total_value - 10,000 (starting balance per portfolio)
    """
    STARTING_BALANCE = Decimal('10000')

    # Use each user's primary (oldest) portfolio only
    portfolios = (
        Portfolio.objects
        .select_related('user')
        .prefetch_related('positions__ticker')
        .order_by('user', 'created_at')
    )

    # Keep only the first portfolio per user
    seen_users = set()
    primary_portfolios = []
    for portfolio in portfolios:
        if portfolio.user_id not in seen_users:
            seen_users.add(portfolio.user_id)
            primary_portfolios.append(portfolio)

    # Cache live prices so we only call the service once per symbol
    price_cache = {}

    def live_price(symbol):
        if symbol not in price_cache:
            data = get_live_price(symbol)
            price_cache[symbol] = Decimal(str(data.get('price') or 0))
        return price_cache[symbol]

    results = []
    for portfolio in primary_portfolios:
        holdings_value = sum(
            pos.quantity * live_price(pos.ticker.symbol)
            for pos in portfolio.positions.all()
        )
        total_value = portfolio.balance + holdings_value
        net_profit = total_value - STARTING_BALANCE
        results.append({
            'username': portfolio.user.username,
            'portfolio_value': float(round(total_value, 2)),
            'net_profit': float(round(net_profit, 2)),
        })

    # Sort by total value descending and assign ranks
    results.sort(key=lambda x: x['portfolio_value'], reverse=True)
    for idx, row in enumerate(results, start=1):
        row['rank'] = idx

    return Response(results)
