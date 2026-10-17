// components/ErrorDisplay.jsx
import React from 'react';
import { AlertCircle } from 'lucide-react';

function ErrorDisplay({ error }) {
  if (!error) return null;

  return (
    <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start sm:items-center gap-2 sm:gap-3">
      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5 sm:mt-0" />
      <span className="text-sm sm:text-base text-red-800 break-words">{error}</span>
    </div>
  );
}

export default ErrorDisplay;

