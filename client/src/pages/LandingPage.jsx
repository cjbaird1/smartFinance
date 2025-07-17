import React from "react";
import PricingSection from "../components/PricingSection";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <nav className="w-full flex items-center justify-between px-8 py-4 border-b border-gray-800 bg-black">
        {/* Logo Placeholder */}
        <div className="flex items-center">
          <div className="w-32 h-8 bg-gray-700 rounded flex items-center justify-center font-bold text-lg tracking-widest">
            LOGO
          </div>
        </div>
        {/* Navigation Links */}
        <div className="flex items-center space-x-8">
          <a href="#features" className="hover:text-blue-400 transition">Features</a>
          <button
            className="hover:text-blue-400 transition bg-transparent border-none outline-none cursor-pointer"
            style={{ padding: 0 }}
            onClick={() => {
              const section = document.getElementById("pricing");
              if (section) {
                section.scrollIntoView({ behavior: "smooth" });
              }
            }}
          >
            Pricing
          </button>
          <a href="#resources" className="hover:text-blue-400 transition">Resources</a>
        </div>
        {/* Right Side: Auth Buttons */}
        <div className="flex items-center space-x-4">
          {/* Auth Buttons */}
          <button className="px-4 py-2 rounded bg-gray-800 hover:bg-gray-700 transition" onClick={() => navigate("/sign-in")}>Sign in</button>
          <button className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 transition font-semibold">Try Now</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-20 px-4 bg-black">
        {/* Sub-Banner */}
        <div className="mb-6">
          <span className="inline-block bg-blue-900 text-blue-200 text-sm font-medium px-6 py-2 rounded-full">
            Get 10+ proven trading strategies—tested and ready to use.
          </span>
        </div>
        {/* Main Headline */}
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-white">
          Trading with confidence<br />
          starts with backtesting
        </h1>
        {/* Subtext */}
        <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl">
          InsightReplay empowers you to validate your trading strategies with confidence.<br />
          Backtest, refine, and achieve your trading goals with greater clarity.
        </p>
        {/* CTA Button */}
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold px-8 py-4 rounded-full mb-4 transition">
          Get started
        </button>
        {/* Free Access Note */}
        <div className="text-gray-400 text-base">Start for free. No credit card required.</div>
      </section>

      {/* Features Row */}
      <section className="w-full bg-black border-t border-gray-800 py-12 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="text-lg font-semibold text-white mb-2">Simulate Trades & Backtest Strategies</div>
            <div className="text-gray-400 text-base">Practice and refine your trading ideas risk-free with our interactive simulator.</div>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="text-lg font-semibold text-white mb-2">News & Sentiment Dashboard</div>
            <div className="text-gray-400 text-base">Instantly gauge market mood and discover relevant news for any stock.</div>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="text-lg font-semibold text-white mb-2">Education Center for Investors</div>
            <div className="text-gray-400 text-base">Learn technical analysis, platform skills, and investing basics—all in one place.</div>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="text-lg font-semibold text-white mb-2">AI-Powered Market Predictions</div>
            <div className="text-gray-400 text-base">Leverage machine learning to forecast stock movements and spot opportunities.</div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* Floating Help Button */}
      <button
        className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-gray-800 hover:bg-blue-600 text-white flex items-center justify-center shadow-lg transition-colors text-3xl border-2 border-gray-700 hover:border-blue-400"
        aria-label="Help"
      >
        ?
      </button>
    </div>
  );
};

export default LandingPage; 