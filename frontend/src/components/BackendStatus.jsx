// components/BackendStatus.jsx
import React from 'react';
import { Loader, AlertCircle, RefreshCw } from 'lucide-react';

function BackendStatus({ isCheckingBackend, backendReady, backendStatusMessage, onRetry }) {
  if (isCheckingBackend) {
    return (
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start sm:items-center gap-2 sm:gap-3">
        <Loader className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0 mt-0.5 sm:mt-0" />
        <span className="text-sm sm:text-base text-blue-800 break-words">{backendStatusMessage}</span>
      </div>
    );
  }

  if (!backendReady) {
    const showRetryButton = backendStatusMessage?.includes('Retry') || backendStatusMessage?.includes('try again');
    return (
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
        <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5 sm:mt-0" />
          <span className="text-sm sm:text-base text-yellow-800 break-words">{backendStatusMessage}</span>
        </div>
        {showRetryButton && onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-yellow-800 bg-yellow-100 hover:bg-yellow-200 border border-yellow-300 rounded-md transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        )}
      </div>
    );
  }

  return null;
}

export default BackendStatus;

