# # ml/model.py

# import tensorflow as tf
# from tensorflow.keras import layers, Model
# from transformers import TFBertModel, BertTokenizer
# import numpy as np
# from typing import List, Dict, Union
# import os
# from dotenv import load_dotenv

# class FinancialSentimentModel(Model):
#     def __init__(self, model_name: str = "bert-base-uncased"):
#         super(FinancialSentimentModel, self).__init__()
#         self.bert = TFBertModel.from_pretrained(model_name)
#         self.dropout = layers.Dropout(0.1)
#         self.classifier = layers.Dense(3, activation='softmax')  # 3 classes: negative, neutral, positive
        
#     def call(self, inputs):
#         input_ids, attention_mask = inputs
#         outputs = self.bert(input_ids=input_ids, attention_mask=attention_mask)
#         pooled_output = outputs[1]  # [CLS] token output
#         pooled_output = self.dropout(pooled_output)
#         logits = self.classifier(pooled_output)
#         return logits

# class SentimentAnalyzer:
#     def __init__(self):
#         self.model = FinancialSentimentModel()
#         self.tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
        
#     def preprocess_text(self, text: str) -> Dict[str, tf.Tensor]:
#         """Preprocess text for BERT model"""
#         inputs = self.tokenizer(
#             text,
#             padding=True,
#             truncation=True,
#             max_length=512,
#             return_tensors="tf"
#         )
#         return inputs
    
#     def analyze_sentiment(self, text: str) -> float:
#         """Analyze sentiment of a single text"""
#         inputs = self.preprocess_text(text)
#         input_ids = tf.convert_to_tensor(inputs['input_ids'])
#         attention_mask = tf.convert_to_tensor(inputs['attention_mask'])
        
#         # Get model predictions
#         probabilities = self.model([input_ids, attention_mask])
        
#         # Convert to sentiment score (-1 to 1)
#         # probabilities shape: [batch_size, 3] where 3 is [negative, neutral, positive]
#         sentiment_score = float(probabilities[0][2] - probabilities[0][0])
#         return sentiment_score
    
#     def analyze_batch(self, texts: List[str]) -> List[float]:
#         """Analyze sentiment of multiple texts"""
#         return [self.analyze_sentiment(text) for text in texts]
    
#     def get_sentiment_label(self, score: float) -> str:
#         """Convert sentiment score to label"""
#         if score > 0.3:
#             return "Positive"
#         elif score < -0.3:
#             return "Negative"
#         return "Neutral"

# # Initialize the analyzer
# sentiment_analyzer = SentimentAnalyzer()

from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from typing import Dict, List, Tuple

class SentimentAnalyzer:
    def __init__(self):
        self.analyzer = SentimentIntensityAnalyzer()
    
    def analyze_sentiment(self, text: str) -> float:
        """Analyze sentiment of a single text using VADER"""
        if not text:
            return 0.0
        
        # Get sentiment scores
        scores = self.analyzer.polarity_scores(text)
        
        # Return compound score (-1 to 1)
        return scores['compound']
    
    def analyze_batch(self, texts: list) -> list:
        """Analyze sentiment of multiple texts"""
        return [self.analyze_sentiment(text) for text in texts]
    
    def get_sentiment_label(self, score: float) -> str:
        """Convert sentiment score to label"""
        if score > 0.3:
            return "Positive"
        elif score < -0.3:
            return "Negative"
        return "Neutral"

class StockMovementPredictor:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        self.is_trained = False
        
    def calculate_technical_indicators(self, data: List[Dict]) -> pd.DataFrame:
        """Calculate technical indicators from stock data"""
        if len(data) < 20:
            return pd.DataFrame()
            
        df = pd.DataFrame(data)
        df['open'] = pd.to_numeric(df['open'])
        df['close'] = pd.to_numeric(df['close'])
        df['high'] = pd.to_numeric(df['high'])
        df['low'] = pd.to_numeric(df['low'])
        df['volume'] = pd.to_numeric(df['volume'])
        
        # Price-based features
        df['price_change'] = df['close'].pct_change()
        df['price_change_5'] = df['close'].pct_change(5)
        df['price_change_10'] = df['close'].pct_change(10)
        
        # Open-Close relationship features
        df['open_close_ratio'] = df['open'] / df['close']
        df['body_size'] = abs(df['close'] - df['open']) / df['open']
        df['gap_up'] = (df['open'] > df['close'].shift(1)).astype(int)
        df['gap_down'] = (df['open'] < df['close'].shift(1)).astype(int)
        
        # Volatility
        df['volatility'] = df['price_change'].rolling(10).std()
        
        # Moving averages
        df['sma_5'] = df['close'].rolling(5).mean()
        df['sma_10'] = df['close'].rolling(10).mean()
        df['sma_20'] = df['close'].rolling(20).mean()
        
        # Price vs moving averages
        df['price_vs_sma5'] = (df['close'] - df['sma_5']) / df['sma_5']
        df['price_vs_sma10'] = (df['close'] - df['sma_10']) / df['sma_10']
        df['price_vs_sma20'] = (df['close'] - df['sma_20']) / df['sma_20']
        
        # RSI
        delta = df['close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(14).mean()
        rs = gain / loss
        df['rsi'] = 100 - (100 / (1 + rs))
        
        # MACD
        exp1 = df['close'].ewm(span=12).mean()
        exp2 = df['close'].ewm(span=26).mean()
        df['macd'] = exp1 - exp2
        df['macd_signal'] = df['macd'].ewm(span=9).mean()
        df['macd_histogram'] = df['macd'] - df['macd_signal']
        
        # Volume indicators
        df['volume_sma'] = df['volume'].rolling(10).mean()
        df['volume_ratio'] = df['volume'] / df['volume_sma']
        
        # Bollinger Bands
        df['bb_middle'] = df['close'].rolling(20).mean()
        bb_std = df['close'].rolling(20).std()
        df['bb_upper'] = df['bb_middle'] + (bb_std * 2)
        df['bb_lower'] = df['bb_middle'] - (bb_std * 2)
        df['bb_position'] = (df['close'] - df['bb_lower']) / (df['bb_upper'] - df['bb_lower'])
        
        return df
    
    def create_labels(self, data: List[Dict], lookahead: int = 5) -> Tuple[pd.DataFrame, List[str]]:
        """Create labels based on future price movement"""
        df = self.calculate_technical_indicators(data)
        
        if len(df) < lookahead + 20:
            return pd.DataFrame(), []
        
        # Create labels based on future price movement
        future_returns = df['close'].shift(-lookahead) / df['close'] - 1
        
        labels = []
        for return_val in future_returns:
            if pd.isna(return_val):
                labels.append('Neutral')
            elif return_val > 0.02:  # 2% gain
                labels.append('Bullish')
            elif return_val < -0.02:  # 2% loss
                labels.append('Bearish')
            else:
                labels.append('Neutral')
        
        return df, labels
    
    def train_model(self, data: List[Dict]) -> bool:
        """Train the model on historical data"""
        try:
            df, labels = self.create_labels(data)
            
            if len(df) < 50 or len(labels) < 50:
                return False
            
            # Select features for training
            feature_columns = [
                'price_change', 'price_change_5', 'price_change_10',
                'open_close_ratio', 'body_size', 'gap_up', 'gap_down',
                'volatility', 'price_vs_sma5', 'price_vs_sma10', 'price_vs_sma20',
                'rsi', 'macd', 'macd_signal', 'macd_histogram',
                'volume_ratio', 'bb_position'
            ]
            
            # Remove rows with NaN values
            df_clean = df[feature_columns + ['close']].dropna()
            labels_clean = [labels[i] for i in df_clean.index if i < len(labels)]
            
            if len(df_clean) < 30:
                return False
            
            # Prepare training data
            X = df_clean[feature_columns].values
            y = labels_clean[:len(X)]
            
            # Scale features
            X_scaled = self.scaler.fit_transform(X)
            
            # Train model
            self.model.fit(X_scaled, y)
            self.is_trained = True
            
            return True
            
        except Exception as e:
            print(f"Error training model: {e}")
            return False
    
    def predict_movement(self, data: List[Dict]) -> Dict:
        """Predict stock movement for the latest data point"""
        if not self.is_trained or len(data) < 20:
            return {
                'prediction': 'Neutral',
                'confidence': 0.0,
                'probabilities': {'Bullish': 0.33, 'Bearish': 0.33, 'Neutral': 0.34},
                'features': []
            }
        
        try:
            df = self.calculate_technical_indicators(data)
            
            if len(df) == 0:
                return {
                    'prediction': 'Neutral',
                    'confidence': 0.0,
                    'probabilities': {'Bullish': 0.33, 'Bearish': 0.33, 'Neutral': 0.34},
                    'features': []
                }
            
            # Get latest data point
            latest = df.iloc[-1:]
            
            feature_columns = [
                'price_change', 'price_change_5', 'price_change_10',
                'open_close_ratio', 'body_size', 'gap_up', 'gap_down',
                'volatility', 'price_vs_sma5', 'price_vs_sma10', 'price_vs_sma20',
                'rsi', 'macd', 'macd_signal', 'macd_histogram',
                'volume_ratio', 'bb_position'
            ]
            
            # Check if all features are available
            missing_features = [col for col in feature_columns if col not in latest.columns or pd.isna(latest[col].iloc[0])]
            if missing_features:
                return {
                    'prediction': 'Neutral',
                    'confidence': 0.0,
                    'probabilities': {'Bullish': 0.33, 'Bearish': 0.33, 'Neutral': 0.34},
                    'features': []
                }
            
            X = latest[feature_columns].values
            X_scaled = self.scaler.transform(X)
            
            # Get prediction and probabilities
            prediction = self.model.predict(X_scaled)[0]
            probabilities = self.model.predict_proba(X_scaled)[0]
            
            # Map probabilities to labels
            classes = self.model.classes_
            prob_dict = {classes[i]: float(probabilities[i]) for i in range(len(classes))}
            
            # Calculate confidence (max probability)
            confidence = float(max(probabilities))
            
            # Extract feature values for the latest data point
            features = []
            for i, col in enumerate(feature_columns):
                if col in latest.columns and not pd.isna(latest[col].iloc[0]):
                    features.append({
                        'name': col,
                        'value': float(latest[col].iloc[0])
                    })
            
            return {
                'prediction': prediction,
                'confidence': confidence,
                'probabilities': prob_dict,
                'features': features
            }
            
        except Exception as e:
            print(f"Error predicting movement: {e}")
            return {
                'prediction': 'Neutral',
                'confidence': 0.0,
                'probabilities': {'Bullish': 0.33, 'Bearish': 0.33, 'Neutral': 0.34},
                'features': []
            }
    
    def get_feature_columns(self):
        """Return the list of feature columns used by the model"""
        return [
            'price_change', 'price_change_5', 'price_change_10',
            'open_close_ratio', 'body_size', 'gap_up', 'gap_down',
            'volatility', 'price_vs_sma5', 'price_vs_sma10', 'price_vs_sma20',
            'rsi', 'macd', 'macd_signal', 'macd_histogram',
            'volume_ratio', 'bb_position'
        ]

# Initialize the analyzers
sentiment_analyzer = SentimentAnalyzer()
stock_predictor = StockMovementPredictor()
