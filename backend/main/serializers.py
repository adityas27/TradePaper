from rest_framework import serializers
from .models import Ticker, Portfolio, Position, TradeTransaction, Watchlist


class TickerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticker
        fields = ['id', 'symbol', 'company_name', 'exchange', 'sector', 'industry', 'parent_company', 'description', 'website', 'logo_url', 'created_at']


class PositionSerializer(serializers.ModelSerializer):
    ticker_symbol = serializers.CharField(source='ticker.symbol', read_only=True)

    class Meta:
        model = Position
        fields = ['id', 'ticker', 'ticker_symbol', 'quantity', 'avg_buy_price', 'updated_at']


class TradeTransactionSerializer(serializers.ModelSerializer):
    ticker_symbol = serializers.CharField(source='ticker.symbol', read_only=True)

    class Meta:
        model = TradeTransaction
        fields = ['id', 'portfolio', 'ticker', 'ticker_symbol', 'transaction_type', 'quantity', 'price', 'total_amount', 'timestamp']
        read_only_fields = ['total_amount', 'timestamp']


class PortfolioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Portfolio
        fields = ['id', 'name', 'balance', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class PortfolioDetailSerializer(serializers.ModelSerializer):
    positions = PositionSerializer(many=True, read_only=True)
    transactions = TradeTransactionSerializer(many=True, read_only=True)

    class Meta:
        model = Portfolio
        fields = ['id', 'name', 'balance', 'positions', 'transactions', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class WatchlistSerializer(serializers.ModelSerializer):
    ticker_symbol = serializers.CharField(source='ticker.symbol', read_only=True)

    class Meta:
        model = Watchlist
        fields = ['id', 'ticker', 'ticker_symbol', 'added_at']
        read_only_fields = ['id', 'added_at', 'ticker_symbol']


class TickerDetailSerializer(serializers.ModelSerializer):
    in_watchlist = serializers.SerializerMethodField()
    position = serializers.SerializerMethodField()

    class Meta:
        model = Ticker
        fields = ['id', 'symbol', 'company_name', 'exchange', 'sector', 'industry', 'parent_company', 'description', 'website', 'logo_url', 'created_at', 'in_watchlist', 'position']

    def get_in_watchlist(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Watchlist.objects.filter(user=request.user, ticker=obj).exists()
        return False

    def get_position(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            portfolio = Portfolio.objects.filter(user=request.user).first()
            if portfolio:
                position = Position.objects.filter(portfolio=portfolio, ticker=obj).first()
                if position:
                    return PositionSerializer(position).data
        return None
