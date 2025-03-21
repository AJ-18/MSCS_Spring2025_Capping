import React from 'react';

const MetricGauge = ({ title, value, color, subtitle, suffix = '' }) => {
  const circumference = 2 * Math.PI * 45; // radius = 45
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="bg-white rounded-lg p-4">
      <h3 className="text-xl font-medium mb-4">{title}</h3>
      <div className="relative w-32 h-32 mx-auto">
        <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            className="text-gray-200"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r="45"
            cx="50"
            cy="50"
          />
          {/* Progress circle */}
          <circle
            className="transition-all duration-300"
            strokeWidth="8"
            stroke={color}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            r="45"
            cx="50"
            cy="50"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold">
            {value.toFixed(0)}{suffix}
          </span>
        </div>
      </div>
      {subtitle && (
        <div className="text-center mt-2 text-gray-600">{subtitle}</div>
      )}
    </div>
  );
};

export default MetricGauge;