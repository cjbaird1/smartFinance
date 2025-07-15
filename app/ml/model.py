from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from typing import Dict, List, Tuple
from sklearn.metrics import classification_report, accuracy_score, precision_score, recall_score, f1_score
from collections import Counter

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

    def evaluate_model(self, data, test_size=0.2):
        df, labels = self.create_labels(data)
        feature_columns = self.get_feature_columns()
        df_clean = df[feature_columns].dropna()
        labels_clean = [labels[i] for i in df_clean.index if i < len(labels)]
        if len(df_clean) < 30:
            print('Not enough data to evaluate model.')
            return None

        # Split into train/test
        split_idx = int(len(df_clean) * (1 - test_size))
        X_train, X_test = df_clean.iloc[:split_idx], df_clean.iloc[split_idx:]
        y_train, y_test = labels_clean[:split_idx], labels_clean[split_idx:]

        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        # Train model
        self.model.fit(X_train_scaled, y_train)

        # Predict
        y_pred = self.model.predict(X_test_scaled)

        # Print predictions vs actuals
        print("\n=== PREDICTIONS vs ACTUALS (test set) ===")
        for i in range(len(y_pred)):
            print(f"Predicted: {y_pred[i]} | Actual: {y_test[i]}")
        print(f"Total predictions: {len(y_pred)}")

        # Print train and test label distribution
        print("\nTrain label distribution:", Counter(y_train))
        print("Test label distribution:", Counter(y_test))

        # Metrics
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred, average='weighted', zero_division=0)
        recall = recall_score(y_test, y_pred, average='weighted', zero_division=0)
        f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)

        print(f"\nModel Evaluation Metrics:")
        print(f"  Accuracy:  {accuracy:.4f}")
        print(f"  Precision: {precision:.4f}")
        print(f"  Recall:    {recall:.4f}")
        print(f"  F1 Score:  {f1:.4f}")
        return {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1': f1
        }

# Initialize the analyzers
sentiment_analyzer = SentimentAnalyzer()
stock_predictor = StockMovementPredictor()
