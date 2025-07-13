# main.py
from flask import Flask, jsonify, request
from flask_cors import CORS
# import yfinance as yf  # Commented out yFinance
from tvDatafeed import TvDatafeed, Interval
import os
from dotenv import load_dotenv
from app.api.news_api import news_bp
from app.ml.model import stock_predictor
import calendar

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

        # Add a 'time' field as UNIX timestamp (seconds, UTC) from the 'datetime' column
        if 'datetime' in data.columns:
            data['time'] = data['datetime'].apply(
                lambda x: int(calendar.timegm(x.timetuple())) if hasattr(x, 'timetuple') else int(calendar.timegm((
                    x if isinstance(x, str) else str(x)
                ) and __import__('dateutil.parser').parse(x).timetuple()))
            )

        # Convert DataFrame to list of dictionaries
        data_records = data.to_dict(orient="records")

        return jsonify({"ticker": ticker.upper(), "data": data_records})

    except Exception as e:
        return {"error": str(e)}, 500

@app.route("/api/predict", methods=["GET"])
def predict_stock_movement():
    """Predict stock movement using ML model"""
    ticker = request.args.get("ticker")
    n_bars = request.args.get("n_bars", default=100, type=int)  # Need more data for ML
    interval_str = request.args.get("interval", "1d")
    interval_enum = INTERVAL_MAP.get(interval_str)
    
    if not ticker:
        return {"error": "Missing ticker parameter"}, 400
    
    if not interval_enum:
        return {"error": "Invalid interval provided."}, 400
    
    try:
        # Initialize tvdatafeed with login credentials
        username = os.getenv("TV_USERNAME")
        password = os.getenv("TV_PASSWORD")
        tv = TvDatafeed(username=username, password=password)

        # Fetch historical data for ML training and prediction
        data = tv.get_hist(
            symbol=ticker.upper(),
            exchange='NASDAQ',
            interval=interval_enum,
            n_bars=n_bars
        )

        if data.empty or data is None:
            return {"error": "No data found for that ticker"}, 404

        # Reset index to convert DateTimeIndex to a column
        data.reset_index(inplace=True)

        # Add a 'time' field as UNIX timestamp
        if 'datetime' in data.columns:
            data['time'] = data['datetime'].apply(
                lambda x: int(calendar.timegm(x.timetuple())) if hasattr(x, 'timetuple') else int(calendar.timegm((
                    x if isinstance(x, str) else str(x)
                ) and __import__('dateutil.parser').parse(x).timetuple()))
            )

        # Convert DataFrame to list of dictionaries
        data_records = data.to_dict(orient="records")
        
        # Train the model on historical data
        training_success = stock_predictor.train_model(data_records)
        
        if not training_success:
            return {
                "error": "Insufficient data for ML prediction",
                "prediction": "Neutral",
                "confidence": 0.0,
                "probabilities": {"Bullish": 0.33, "Bearish": 0.33, "Neutral": 0.34}
            }, 200
        
        # Get prediction for the latest data point
        prediction_result = stock_predictor.predict_movement(data_records)
        
        return jsonify({
            "ticker": ticker.upper(),
            "prediction": prediction_result["prediction"],
            "confidence": prediction_result["confidence"],
            "probabilities": prediction_result["probabilities"],
            "features": prediction_result.get("features", []),
            "model_trained": True,
            "feature_count": len(stock_predictor.get_feature_columns()),
            "timeframe": interval_str,
            "prediction_horizon": 5
        })

    except Exception as e:
        return {"error": str(e)}, 500

@app.route("/api/features", methods=["GET"])
def get_all_features():
    """Get all available features for the ML model"""
    try:
        feature_columns = stock_predictor.get_feature_columns()
        
        # Create feature objects with metadata
        features = []
        for feature_name in feature_columns:
            features.append({
                'name': feature_name,
                'description': f'Technical indicator: {feature_name}',
                'category': 'technical_analysis'
            })
        
        return jsonify({
            "features": features,
            "total_count": len(features)
        })
        
    except Exception as e:
        return {"error": str(e)}, 500

if __name__ == "__main__":
    app.run(debug=True)

    # Debug: Print a sample output from the /api/stock endpoint see datetime formatt
    # with app.test_client() as c:
    #     response = c.get('/api/stock?ticker=AAPL&n_bars=1&interval=1m')
    #     print('Sample /api/stock output:', response.json)
    #     # Log the timestamp/date field of the first record if available
    #     if response.json and 'data' in response.json and len(response.json['data']) > 0:
    #         first_record = response.json['data'][0]
    #         # Print all keys and the value of any key that looks like a date/time
    #         for k, v in first_record.items():
    #             if 'date' in k.lower() or 'time' in k.lower():
    #                 print(f"Field: {k}, Value: {v}")
    #         # Print the whole record for reference
    #         print('First record:', first_record)
