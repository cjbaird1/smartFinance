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

# Initialize the analyzer
sentiment_analyzer = SentimentAnalyzer()
