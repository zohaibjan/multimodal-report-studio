// components/AIDisclaimer.jsx
import React from 'react';

function AIDisclaimer() {
  return (
    <div className="mb-6 p-4 bg-blue-50 border-l-4 border-abi-primary rounded-r-lg">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg className="w-6 h-6 text-abi-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">AI-Assisted Inspection Report Notice</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>
              This application uses artificial intelligence (AI) to assist with audio transcription and defect identification.
              <strong> All AI-generated content must be reviewed and approved by a qualified field reviewer before finalization.</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>AI is used as an <strong>advisory tool only</strong> — not for autonomous decision-making</li>
              <li>You must verify all transcripts, defects, and recommendations</li>
              <li>Final inspection decisions and enforcement actions remain your responsibility</li>
              <li>All data is processed securely within your configured region</li>
            </ul>
            <p className="text-xs pt-2 border-t border-blue-200 mt-3">
              By using this application, you acknowledge that AI assistance requires human oversight and that you are responsible
              for the accuracy and completeness of all inspection reports generated.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIDisclaimer;

