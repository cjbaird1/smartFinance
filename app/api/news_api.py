# api/news_api.py

from flask import Blueprint, jsonify, request
import yfinance as yf
import requests
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from ..ml.model import sentiment_analyzer

# Load environment variables
load_dotenv()

news_bp = Blueprint('news', __name__)

# News API configuration
NEWS_API_KEY = os.getenv('NEWS_API_KEY')
NEWS_API_URL = 'https://newsapi.org/v2/everything'

# Finnhub configuration
FINNHUB_API_KEY = os.getenv('FINN_HUB_API')
FINNHUB_API_URL = 'https://finnhub.io/api/v1/company-news'

@news_bp.route('/api/news', methods=['GET'])
def get_news():
    ticker = request.args.get('ticker')
    if not ticker:
        return jsonify({'error': 'Missing ticker parameter'}), 400

    try:
        # Get news from Finnhub for the last 7 days
        to_date = datetime.now().date()
        from_date = to_date - timedelta(days=7)
        finnhub_params = {
            'symbol': ticker.upper(),
            'from': from_date,
            'to': to_date,
            'token': FINNHUB_API_KEY
        }
        finnhub_response = requests.get(FINNHUB_API_URL, params=finnhub_params)
        finnhub_data = finnhub_response.json() if finnhub_response.status_code == 200 else []

        all_news = []
        for article in finnhub_data:
            headline = article.get('headline', '')
            summary = article.get('summary', '')
            published_at = article.get('datetime', 0)
            url = article.get('url', '')
            source = article.get('source', 'Finnhub')
            if not headline or not summary or not published_at:
                continue  # Skip articles with missing data
            all_news.append({
                'title': headline,
                'source': source,
                'publishedAt': datetime.fromtimestamp(published_at).isoformat(),
                'url': url,
                'summary': summary
            })

        # Analyze sentiment for each article
        for article in all_news:
            text_to_analyze = f"{article['title']} {article['summary']}"
            article['sentiment'] = sentiment_analyzer.analyze_sentiment(text_to_analyze)

        # Split articles by sentiment
        positive_articles = [a for a in all_news if a['sentiment'] > 0.3]
        negative_articles = [a for a in all_news if a['sentiment'] < -0.3]
        neutral_articles  = [a for a in all_news if -0.3 <= a['sentiment'] <= 0.3]

        # Sort each group
        positive_articles.sort(key=lambda x: x['sentiment'], reverse=True)
        negative_articles.sort(key=lambda x: x['sentiment'])
        neutral_articles.sort(key=lambda x: x['publishedAt'], reverse=True)

        # Select top N from each group
        top_positive = positive_articles[:4]
        top_negative = negative_articles[:4]
        top_neutral  = neutral_articles[:2]

        # Combine and (optionally) sort by date
        selected_articles = top_positive + top_negative + top_neutral
        selected_articles.sort(key=lambda x: x['publishedAt'], reverse=True)

        # Calculate overall sentiment metrics
        sentiments = [article['sentiment'] for article in selected_articles]
        overall_sentiment = sum(sentiments) / len(sentiments) if sentiments else 0

        # Calculate sentiment distribution
        positive_count = sum(1 for a in selected_articles if a['sentiment'] > 0.3)
        negative_count = sum(1 for a in selected_articles if a['sentiment'] < -0.3)
        neutral_count = len(selected_articles) - positive_count - negative_count

        # Calculate sentiment trend (comparing recent vs older articles)
        if len(sentiments) >= 2:
            recent_sentiments = sentiments[:len(sentiments)//2]
            older_sentiments = sentiments[len(sentiments)//2:]
            sentiment_trend = (sum(recent_sentiments) / len(recent_sentiments)) - \
                              (sum(older_sentiments) / len(older_sentiments))
        else:
            sentiment_trend = 0

        response_data = {
            'articles': selected_articles,
            'sentiment_analysis': {
                'overall_sentiment': overall_sentiment,
                'sentiment_trend': sentiment_trend,
                'social_media_sentiment': 0,  # To be implemented
                'news_sentiment': overall_sentiment,
                'technical_sentiment': 0,
                'sentiment_distribution': {
                    'positive': positive_count,
                    'neutral': neutral_count,
                    'negative': negative_count
                }
            }
        }
        print('REPONSE DATA:', response_data)
        return jsonify(response_data)

    except Exception as e:
        return jsonify({'error': str(e)}), 500
