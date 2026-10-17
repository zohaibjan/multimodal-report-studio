// components/GenerateReportSection.jsx
import React from 'react';
import { Loader, Download } from 'lucide-react';

function GenerateReportSection({
  includeRawTranscript,
  setIncludeRawTranscript,
  isProcessing,
  setCurrentSection,
  handleGenerateReport,
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-REFERENCE-navy border-l-4 border-REFERENCE-navy pl-3 sm:pl-4 mb-4 sm:mb-6 break-words">
        Generate Compliant Site Report
      </h2>
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
        <p className="text-xs sm:text-sm text-green-800 break-words">
          This site is marked as compliant. The report will include your transcript and site photos without defect mapping.
        </p>
      </div>
      {/* Raw Transcript Checkbox */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={includeRawTranscript}
            onChange={(e) => setIncludeRawTranscript(e.target.checked)}
            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            data-tour="step-12"
          />
          <div>
            <span className="text-sm font-medium text-blue-900">Include Raw Transcript</span>
            <p className="text-xs text-blue-700 mt-1">
              Check this to include the full audio transcript in the report.
            </p>
          </div>
        </label>
      </div>
      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 mt-6 sm:mt-8">
        <button
          type="button"
          onClick={() => setCurrentSection('transcript')}
          className="w-full sm:w-auto px-4 sm:px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base select-none"
        >
          Back to Transcript
        </button>
        <button
          type="button"
          onClick={handleGenerateReport}
          disabled={isProcessing}
          aria-busy={isProcessing}
          className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors text-sm sm:text-base select-none"
          data-tour="generate-report-button"
        >
          {isProcessing ? (
            <>
              <Loader className="w-5 h-5 animate-spin flex-shrink-0" />
              <span className="whitespace-nowrap">Generating Report (Compliant)...</span>
            </>
          ) : (
            <>
              <span className="whitespace-nowrap">Generate Report</span>
              <Download className="w-5 h-5 flex-shrink-0" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default GenerateReportSection;

