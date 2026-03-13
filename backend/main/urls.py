from django.urls import path
from . import views

urlpatterns = [
    # Ticker endpoints
    path('tickers/', views.ticker_list, name='ticker-list'),
    path('tickers/<str:symbol>/', views.ticker_detail, name='ticker-detail'),
    
    # Watchlist endpoints
    path('watchlist/', views.watchlist_list, name='watchlist-list'),
    path('watchlist/toggle/', views.watchlist_toggle, name='watchlist-toggle'),
    
    # Portfolio endpoints
    path('portfolios/', views.portfolio_list, name='portfolio-list'),
    path('portfolios/<int:pk>/', views.portfolio_detail, name='portfolio-detail'),
    path('portfolios/<int:pk>/holdings/', views.portfolio_holdings, name='portfolio-holdings'),
    
    # Transaction endpoints
    path('transactions/', views.transaction_list, name='transaction-list'),
    
    # Trading endpoints
    path('trade/buy/', views.trade_buy, name='trade-buy'),
    path('trade/sell/', views.trade_sell, name='trade-sell'),
]
