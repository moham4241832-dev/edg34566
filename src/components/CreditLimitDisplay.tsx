import React from "react";

interface CreditLimitDisplayProps {
  creditLimit: number;
  goldDebt: number;
  isOverLimit: boolean;
  isNearLimit: boolean;
  creditUsagePercent: number;
}

export function CreditLimitDisplay({
  creditLimit,
  goldDebt,
  isOverLimit,
  isNearLimit,
  creditUsagePercent,
}: CreditLimitDisplayProps) {
  return (
    <div
      className={`rounded-lg p-3 border ${
        isOverLimit
          ? "bg-gradient-to-br from-red-50 to-rose-50 border-red-300"
          : isNearLimit
          ? "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-300"
          : "bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <svg
            className={`w-4 h-4 ${
              isOverLimit
                ? "text-red-600"
                : isNearLimit
                ? "text-orange-600"
                : "text-purple-600"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
          <span
            className={`text-xs font-medium ${
              isOverLimit
                ? "text-red-800"
                : isNearLimit
                ? "text-orange-800"
                : "text-purple-800"
            }`}
          >
            الحد الائتماني
          </span>
        </div>
        <p
          className={`text-sm font-bold ${
            isOverLimit
              ? "text-red-900"
              : isNearLimit
              ? "text-orange-900"
              : "text-purple-900"
          }`}
        >
          {creditLimit.toFixed(2)} جرام
        </p>
      </div>

      {/* شريط التقدم */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className={`h-2 rounded-full transition-all ${
            isOverLimit
              ? "bg-gradient-to-r from-red-500 to-rose-600"
              : isNearLimit
              ? "bg-gradient-to-r from-orange-500 to-amber-600"
              : "bg-gradient-to-r from-purple-500 to-indigo-600"
          }`}
          style={{ width: `${Math.min(creditUsagePercent, 100)}%` }}
        ></div>
      </div>

      <div className="flex items-center justify-between">
        <p
          className={`text-xs font-semibold ${
            isOverLimit
              ? "text-red-600"
              : isNearLimit
              ? "text-orange-600"
              : "text-green-600"
          }`}
        >
          {isOverLimit
            ? `⚠️ تجاوز بـ ${(goldDebt - creditLimit).toFixed(2)} جرام`
            : `متبقي ${(creditLimit - goldDebt).toFixed(2)} جرام`}
        </p>
        <p
          className={`text-xs font-medium ${
            isOverLimit
              ? "text-red-700"
              : isNearLimit
              ? "text-orange-700"
              : "text-purple-700"
          }`}
        >
          {creditUsagePercent.toFixed(0)}%
        </p>
      </div>
    </div>
  );
}
