from django.contrib import admin
from .models import Portfolio, TradeTransaction, Watchlist, Position, Ticker
# Register your models here.

admin.site.register(Portfolio)
admin.site.register(TradeTransaction)
admin.site.register(Watchlist)
admin.site.register(Ticker)
admin.site.register(Position)

