SmartFinance Project Requirements 
Document 
SmartFinance 
Caden Baird 
Project Description 

SmartFinance is a full-stack web application designed to help new and retail 
investors visualize stock data, understand key financial concepts, and use predictive 
modeling to better inform their investment decisions. It includes educational content, 
real-time data visualization, and machine learning-powered predictions. 

Section 1: Introduction – Purpose of Project 
The stock market can be overwhelming for new investors due to its complexity and 
the abundance of raw data. I remember when I first started to learn how to invest 
and trade, there was a wide plethora of information, almost too much to handle. 
Additionally, many platforms offer limited context or education for their users. 
SmartFinance solves this by integrating clean data visualizations, educational 
content, and predictive tools into a single web interface. The goal is to help users 
learn, explore, and make sense of market activity in a way that builds intuition and 
confidence. 

Section 2a: Must Have Requirements 
1. Ticker Input and OHLC Retrieval 
● Success Measure: User can input a valid ticker symbol and retrieve OHLC 
data via candlestick chart 
● Demonstration: Verified by rendering a candlestick chart after user input 

2. Timeframe and Bar Selection Controls 
● Success Measure: Users can choose time intervals and number of bars (up 
to 999) 
● Demonstration: Chart and table update accordingly based on selection 

3. Data Visualization via Candlestick Chart 
● Success Measure: Display stock OHLC data in a readable candlestick chart 
● Demonstration: Chart renders using lightweight-charts with accurate values 

4. Frontend Navigation Sidebar 
● Success Measure: Sidebar provides working navigation between core pages 
● Demonstration: Routes update correctly without errors 

5. Education Center with Expandable Content 
● Success Measure: Users can view educational content in dropdown 
accordion format 
● Demonstration: Content is displayed properly, and users can open and 
collapse the dropdowns 

6. Error Handling for Invalid Input 
● Success Measure: Application displays appropriate error messages for 
missing or invalid input throughout all of the pages within the application 
● Demonstration: Verified by submitting messages in red font of what the user 
has done wrong or is missing 

Section 2b: Stretch Requirements 
1. ML-Based Stock Movement Prediction (Bullish, Bearish, Neutral) 
● Success Measure: User inputs a ticker, and app returns a classification label 
(Neutral, Bullish, Bearish) 
● Demonstration: Verified by model output as well as visual display 

2. Feature Engineering for Prediction 
● Success Measure: Automatically generate features (rolling averages, 
earnings proximity, etc.) 
● Demonstration: Display feature dictionary and values used by the model 

3. Data Dictionary Visualization 
● Success Measure: Show human-readable table explaining model features 
● Demonstration: Table updates after prediction is run 

4. News Integration 
● Success Measure: Fetch recent news headlines related to the queried stock 
● Demonstration: Clickable links render on News and Sentiment page. Links 
are recent and relevant 

Section 3: Overview of the Product 

Workflow 
● User enters a stock ticker and selects a timeframe and number of bars 
● Backend fetches OHLC data and returns it to the frontend 
● Frontend renders a candlestick chart with accurate data (timestamps, OHLC 
values, etc.) 
● Users can explore educational resources from the sidebar explaining how to 
use the application as well as relevant stock information 
● On the News and Sentiment page, users can easily find news regarding that 
stock, and a sentiment output 
Resources 

Frontend 
● React.js (UI, routing, interactivity) 
● TailwindCSS (styling) 
● Additional libraries: 
○ react-router-dom (routing) 
○ axios (HTTP requests) 
○ recharts (data visualization) 
○ @headlessui/react (UI components) 

Backend 
● Flask (API endpoints, data processing, ML model serving) 
● Additional packages: 
○ flask-cors (CORS support) 
○ yfinance (stock data fetching) 
○ pandas (data manipulation) 
○ scikit-learn (machine learning) 
○ requests (HTTP requests) 
○ python-dotenv (environment variables) 
○ tensorflow (deep learning) 
○ transformers (NLP models) 
○ newsapi-python (news data) 
○ tvdatafeed (technical analysis data) 
○ numpy (numerical computations) 
○ joblib (model persistence) 
Architecture 
● Multi-tier client/server model 
● React frontend (port 3000) 
● Flask backend (port 5000) 
● RESTful API design 
● Asynchronous data fetching 

Data at Rest 
● Currently, no persistent user login or profile data is stored 
● Potential future implementation: SQLite or PostgreSQL for storing user history 
or model training results 
Data on the Wire 
● REST API endpoints: 
○ /api/stock (stock data) 
○ /api/predict (predictions) 
○ /api/news (news data) 
○ /api/technical (technical indicators) 
● Data format: JSON 
● Asynchronous communication between frontend and backend 
● Error handling and rate limiting implemented 

Data State 
Data flows from: 
User Input → Frontend Request → Backend API → External Data Source → ML 
Model (if used) → Frontend Display 
HMI/HCI/GUI 
UI includes: 
● Navigation sidebar with responsive design 
● Stock search and input forms 
● Interactive candlestick charts 
● Technical indicators display 
● News feed section 
● Predictions dashboard 
● Educational content section 

Section 4: Verification 
Demo 
Live demonstration will include: 
1. Stock Data Visualization 
● Retrieving and displaying stock data for multiple tickers (e.g., AAPL, MSFT, 
GOOGL) 
● Interactive candlestick charts (HOPEFULLY) with technical indicators 
● Real-time data updates and timeframe selection 
● Error handling for invalid ticker symbols 

2. Machine Learning Predictions 
● Running predictions on selected stocks 
● Displaying prediction results with confidence scores 
● Visualizing prediction trends 
● Handling edge cases and data limitations 

3. Application Navigation 
● Demonstrating the responsive navigation sidebar 
● Showcasing all main pages: 
○ Dashboard 
○ Stock Analysis 
○ Predictions 
○ Educational Resources 
● Mobile responsiveness demonstration 

4. Educational Features 
● Accessing the educational resources section 
● Demonstrating interactive learning components 
● Showing error handling and user feedback 

Testing 
1. Unit Tests 
● Backend API endpoints 
○ Stock data retrieval 
○ Prediction model outputs 
● Data processing functions 
○ Technical indicator calculations 
○ Data normalization 
● ML model components 
○ Model loading 
○ Prediction accuracy 

2. Integration Tests 
● API endpoint integration 
○ Frontend-backend communication 
○ Data flow validation 
● Data pipeline testing 
○ End-to-end data processing 
○ Model integration 

3. UI/UX Tests 
● Component rendering 
○ Chart components 
○ Navigation elements 
○ Form inputs 
● User interactions 
○ Stock search functionality 
○ Timeframe selection 
● Responsive design 
○ Mobile layout 
○ Desktop layout 

Example Test Cases 
1. Stock Data Retrieval 
● Requirement: Application shall retrieve and display stock data for valid ticker 
symbols 
● Test: Submit valid ticker (AAPL) 
● Pass Criteria: 
○ Candlestick chart renders correctly 
○ Data points match expected timeframe 
● Fail Criteria: 
○ Chart fails to render 
○ Error shown for valid input 
2. Prediction System 
● Requirement: Application shall provide stock price predictions 
● Test: Request prediction for AAPL 
● Pass Criteria: 
○ Prediction results display 
○ Confidence score shown 
● Fail Criteria: 
○ No prediction generated 
○ Invalid confidence scores 
3. Error Handling 
● Requirement: Application shall handle invalid inputs gracefully 
● Test: Submit invalid ticker symbol 
● Pass Criteria: 
○ Clear error message displayed 
○ UI remains responsive 
● Fail Criteria: 
○ Application crashes 
○ Unclear error message 