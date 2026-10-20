// components/ReportReadySection.jsx
import React from 'react';
import { CheckCircle, Download } from 'lucide-react';

function ReportReadySection({
  handleDownloadReport,
  handleStartNewInspection,
}) {
  return (
    <div className="text-center py-8 sm:py-12 px-4">
      <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-green-600 mb-4 sm:mb-6" />
      <h2 className="text-2xl sm:text-3xl font-bold text-REFERENCE-navy mb-3 sm:mb-4 break-words">Report Generated Successfully!</h2>
      <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 break-words">Your report is ready to download.</p>
      <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
        <button
          onClick={handleDownloadReport}
          className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-REFERENCE-navy text-white rounded-lg hover:bg-REFERENCE-navy-dark flex items-center justify-center gap-2 transition-colors text-sm sm:text-base"
          data-tour="download-report-button"
        >
          <Download className="w-5 h-5 flex-shrink-0" />
          <span className="whitespace-nowrap">Download Report</span>
        </button>
        <button
          onClick={handleStartNewInspection}
          className="w-full sm:w-auto px-6 sm:px-8 py-3 border border-REFERENCE-navy text-REFERENCE-navy rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base whitespace-nowrap"
        >
          Start New Report
        </button>
      </div>
    </div>
  );
}

export default ReportReadySection;

