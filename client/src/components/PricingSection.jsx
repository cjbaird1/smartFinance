import React, { useState } from "react";

const pricingTiers = [
  {
    name: "Beginner",
    price: { monthly: "Free", yearly: "Free" },
    description: "Start improving your trading skills",
    features: [
      "1 Backtesting Session",
      "1 Indicator",
      "1 Week Data Retention",
    ],
    button: "Get started",
  },
  {
    name: "Intermediate",
    price: { monthly: "$15", yearly: "$180" },
    description: "Optimize and scale your trading game",
    features: [
      "10 Backtesting Sessions",
      "3 Indicators",
      "6 Months Data Retention",
      "2 Charts",
    ],
    savings: { monthly: null, yearly: "Save $35.88 a year!" },
    button: "Get started",
  },
  {
    name: "Pro",
    price: { monthly: "$29.16", yearly: "$350" },
    description: "Everything you need to achieve profitability",
    features: [
      "Unlimited Backtesting Sessions",
      "Unlimited Indicators",
      "Unlimited Data Retention",
      "Unlimited Charts",
    ],
    savings: { monthly: null, yearly: "Save $70 a year!" },
    button: "Get started",
  },
];

const PricingSection = () => {
  const [billing, setBilling] = useState("yearly");

  return (
    <section className="w-full bg-gradient-to-b from-[#050d1a] to-[#10182a] py-20 px-4 flex flex-col items-center" id="pricing">
      <h2 className="text-5xl font-bold text-white mb-2 text-center">Pricing</h2>
      <p className="text-lg text-gray-300 mb-8 text-center max-w-xl">
        What is the price of making your trading dreams a reality?
      </p>
      <div className="flex justify-center mb-12">
        <div className="bg-[#0d1524] rounded-full p-1 flex gap-2">
          <button
            className={`px-6 py-2 rounded-full text-white transition-colors duration-200 ${billing === "monthly" ? "bg-[#181f2e]" : "hover:bg-[#181f2e]"}`}
            onClick={() => setBilling("monthly")}
          >
            Monthly
          </button>
          <button
            className={`px-6 py-2 rounded-full text-white transition-colors duration-200 ${billing === "yearly" ? "bg-[#181f2e]" : "hover:bg-[#181f2e]"}`}
            onClick={() => setBilling("yearly")}
          >
            Yearly
          </button>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl justify-center items-stretch">
        {pricingTiers.map((tier, idx) => (
          <div
            key={tier.name}
            className={`flex flex-col bg-[#0d1524] rounded-2xl shadow-lg p-8 flex-1 min-w-[260px] max-w-md mx-auto border transition-all duration-200 ${
              idx === 2 ? "border-blue-600" : "border-transparent"
            }`}
          >
            <div className="mb-2 text-gray-300 text-sm font-medium">{tier.name}</div>
            <div className="text-4xl font-bold text-white mb-1">
              {tier.price[billing]}
              {tier.name !== "Beginner" && (
                <span className="text-lg font-normal text-gray-400 align-middle ml-1">
                  {billing === "monthly" ? "/monthly" : "/yearly"}
                </span>
              )}
            </div>
            {tier.name !== "Beginner" && (
              <div className="text-gray-400 text-sm mb-2">
                {billing === "monthly"
                  ? billing === "monthly" && tier.name === "Intermediate"
                    ? "$15/monthly"
                    : "$29.16/monthly"
                  : tier.price.yearly + "/yearly"}
              </div>
            )}
            {tier.savings && tier.savings[billing] && (
              <div className="mb-3">
                <span className="block bg-blue-600 text-white text-center rounded-md py-2 font-semibold">
                  {tier.savings[billing]}
                </span>
              </div>
            )}
            <div className="text-gray-300 mb-4 text-center min-h-[40px]">{tier.description}</div>
            <ul className="mb-8 flex-1">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-white mb-2">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button
              className="mt-auto w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-full transition-colors duration-200"
              disabled
            >
              {tier.button}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PricingSection; 