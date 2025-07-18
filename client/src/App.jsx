// src/App.js

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import SearchPage from "./pages/SearchPage";
import EducationCenter from "./pages/EducationCenter";
import NewsPage from "./pages/NewsPage";
import TradeSimulatorPage from "./pages/TradeSimulatorPage";
import PredictionsPage from "./pages/PredictionsPage";
import TailwindTest from "./components/TailwindTest";
import LandingPage from "./pages/LandingPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import RequireAuth from "./components/RequireAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebase";
import SettingsPage from "./pages/SettingsPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPageRedirector />} />
        {/* Public Auth Pages */}
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        {/* Protected App Shell */}
        <Route
          path="/*"
          element={
            <RequireAuth>
              <div className="flex min-h-screen bg-bg-main text-text-main">
                <Sidebar />
                <div className="flex-1 p-8 bg-bg-main min-w-0">
                  <Routes>
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="search" element={<SearchPage />} />
                    <Route path="charts" element={<div>Technical Charts Page</div>} />
                    <Route path="trade-simulator" element={<TradeSimulatorPage />} />
                    <Route path="predictions" element={<PredictionsPage />} />
                    <Route path="strategy" element={<div>Strategy Tester Page</div>} />
                    <Route path="news" element={<NewsPage />} />
                    <Route path="education" element={<EducationCenter />} />
                    <Route path="alerts" element={<LandingPage />} />
                    <Route path="tailwind-test" element={<TailwindTest />} />
                    <Route path="settings/*" element={<SettingsPage />} />
                    <Route path="*" element={<Navigate to="/dashboard" />} />
                  </Routes>
                </div>
              </div>
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  );
}

// Redirect authenticated users from / to /dashboard
function LandingPageRedirector() {
  const navigate = useNavigate();
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigate("/dashboard", { replace: true });
      }
    });
    return () => unsubscribe();
  }, [navigate]);
  return <LandingPage />;
}

export default App;
