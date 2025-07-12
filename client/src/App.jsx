// src/App.js

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import SearchPage from "./pages/SearchPage";
import EducationCenter from "./pages/EducationCenter";
import NewsPage from "./pages/NewsPage";
import TradeSimulatorPage from "./pages/TradeSimulatorPage";
import PredictionsPage from "./pages/PredictionsPage";
import "./styles/app.css";

function App() {
  return (
    <Router>
      <div className="app-layout">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/search" element={<SearchPage />} />
            <Route path="/charts" element={<div>Technical Charts Page</div>} />
            <Route path="/trade-simulator" element={<TradeSimulatorPage />} />
            <Route path="/predictions" element={<PredictionsPage />} />
            <Route path="/strategy" element={<div>Strategy Tester Page</div>} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/education" element={<EducationCenter />} />
            <Route path="/alerts" element={<div>Alerts Page</div>} />
            <Route path="*" element={<Navigate to="/search" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
