# main.py
from flask import Flask, jsonify, request
from flask_cors import CORS
# import yfinance as yf  # Commented out yFinance
from tvDatafeed import TvDatafeed, Interval
import os
from dotenv import load_dotenv
from app.api.news_api import news_bp

INTERVAL_MAP = {
    "1m": Interval.in_1_minute,
    "5m": Interval.in_5_minute,
    "15m": Interval.in_15_minute,
    "30m": Interval.in_30_minute,
    "1h": Interval.in_1_hour,
    "4h": Interval.in_4_hour,
    "1d": Interval.in_daily,
    "1w": Interval.in_weekly,
    "1M": Interval.in_monthly
}
# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

app.register_blueprint(news_bp)

@app.route("/api/stock", methods=["GET"])
def get_stock_data():
    ticker = request.args.get("ticker")
    n_bars = request.args.get("n_bars", default=5, type=int)  # 🔹 ADDED: Default to 5 if n_bars is not provided
    interval_str = request.args.get("interval", "1d")
    interval_enum = INTERVAL_MAP.get(interval_str)

    
    if not ticker:
        return {"error": "Missing ticker parameter"}, 400
    
    # Cap the number of bars at 999 as per request
    if n_bars > 999:
        n_bars = 999  # 🔹 ADDED: Limit to 999
    
    if not interval_enum:
        return {"error": "Invalid interval provided."}, 400
    try:
        # Initialize tvdatafeed with login credentials
        username = os.getenv("TV_USERNAME")
        password = os.getenv("TV_PASSWORD")
        tv = TvDatafeed(username=username, password=password)

        # Fetch historical data with the n_bars parameter
        data = tv.get_hist(
            symbol=ticker.upper(),
            exchange='NASDAQ',
            interval=interval_enum,
            n_bars=n_bars  # 🔹 ADDED: Use n_bars value from frontend
        )

        if data.empty or data is None:
            return {"error": "No data found for that ticker"}, 404

        # Reset index to convert DateTimeIndex to a column
        data.reset_index(inplace=True)

        # Convert DataFrame to list of dictionaries
        data_records = data.to_dict(orient="records")

        return jsonify({"ticker": ticker.upper(), "data": data_records})

    except Exception as e:
        return {"error": str(e)}, 500

if __name__ == "__main__":
    app.run(debug=True)
