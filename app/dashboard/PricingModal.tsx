"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

type Props = {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string;
};

export default function PricingModal({ isOpen, onClose, currentPlan }: Props) {
  const [loading, setLoading] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpgrade = async (plan: "pro" | "business") => {
    setLoading(plan);

    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "エラーが発生しました");
      }

      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripeの初期化に失敗しました");

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (error) {
        throw error;
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "エラーが発生しました");
    } finally {
      setLoading(null);
    }
  };

  const plans = [
    {
      id: "pro",
      name: "Pro",
      price: "¥4,800",
      features: ["5サイトまで", "毎日チェック", "Slack通知", "優先サポート"],
    },
    {
      id: "business",
      name: "Business",
      price: "¥9,800",
      features: [
        "20サイトまで",
        "毎日チェック",
        "Slack通知",
        "専任サポート",
      ],
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b sticky top-0 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                プランをアップグレード
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                現在のプラン:{" "}
                <span className="font-semibold">{currentPlan.toUpperCase()}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="border-2 border-gray-200 rounded-lg p-6 hover:border-primary-500 transition"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="text-3xl font-bold text-primary-600 mb-6">
                  {plan.price}
                  <span className="text-lg text-gray-500">/月</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-gray-600">
                      <svg
                        className="w-5 h-5 text-green-500 mr-2 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleUpgrade(plan.id as "pro" | "business")}
                  disabled={loading !== null || currentPlan === plan.id}
                  className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading === plan.id
                    ? "処理中..."
                    : currentPlan === plan.id
                    ? "現在のプラン"
                    : "このプランにする"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

