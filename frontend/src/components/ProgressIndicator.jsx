// components/ProgressIndicator.jsx
import React from 'react';
import { CheckCircle } from 'lucide-react';

function ProgressIndicator({ currentSection, reportReady }) {
  const isBasicDone = ['transcript', 'defects', 'generate'].includes(currentSection);
  const isTranscriptDone = ['defects', 'generate'].includes(currentSection);
  const isDefectsDone = currentSection === 'generate';
  const isReportActive = currentSection === 'generate' && !reportReady;
  const isReportDone = currentSection === 'generate' && reportReady;
  return (
    <div className="mb-6 sm:mb-8 flex items-center justify-between overflow-x-auto pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
      {/* Step 1: Basic Info */}
      <div className={`flex items-center gap-1 sm:gap-2 flex-shrink-0 ${currentSection === 'basic' ? 'text-REFERENCE-navy font-semibold' : isBasicDone ? 'text-gray-600' : 'text-gray-400'}`}>
        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm ${currentSection === 'basic' ? 'bg-REFERENCE-navy text-white' : isBasicDone ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
          {isBasicDone ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> : '1'}
        </div>
        <span className="text-xs sm:text-sm md:text-base whitespace-nowrap">Basic Info</span>
      </div>
      {/* Connector 1 */}
      <div className={`flex-1 h-1 mx-2 sm:mx-4 min-w-[20px] ${isBasicDone ? 'bg-REFERENCE-navy' : 'bg-gray-200'}`} />
      {/* Step 2: Transcript */}
      <div className={`flex items-center gap-1 sm:gap-2 flex-shrink-0 ${currentSection === 'transcript' ? 'text-REFERENCE-navy font-semibold' : currentSection === 'basic' ? 'text-gray-400' : 'text-gray-600'}`}>
        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm ${currentSection === 'transcript' ? 'bg-REFERENCE-navy text-white' : isTranscriptDone ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
          {isTranscriptDone ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> : '2'}
        </div>
        <span className="text-xs sm:text-sm md:text-base whitespace-nowrap">Transcript</span>
      </div>
      {/* Connector 2 */}
      <div className={`flex-1 h-1 mx-2 sm:mx-4 min-w-[20px] ${isTranscriptDone ? 'bg-REFERENCE-navy' : 'bg-gray-200'}`} />
      {/* Step 3: Defects */}
      <div className={`flex items-center gap-1 sm:gap-2 flex-shrink-0 ${currentSection === 'defects' ? 'text-REFERENCE-navy font-semibold' : ['basic', 'transcript'].includes(currentSection) ? 'text-gray-400' : 'text-gray-600'}`}>
        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm ${currentSection === 'defects' ? 'bg-REFERENCE-navy text-white' : isDefectsDone ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
          {isDefectsDone ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> : '3'}
        </div>
        <span className="text-xs sm:text-sm md:text-base whitespace-nowrap">Defects</span>
      </div>
      {/* Connector 3 */}
      <div className={`flex-1 h-1 mx-2 sm:mx-4 min-w-[20px] ${currentSection === 'generate' ? 'bg-REFERENCE-navy' : 'bg-gray-200'}`} />
      {/* Step 4: Report */}
      <div className={`flex items-center gap-1 sm:gap-2 flex-shrink-0 ${isReportActive ? 'text-REFERENCE-navy font-semibold' : isReportDone ? 'text-gray-600' : 'text-gray-400'}`}>
        <div
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm ${
            isReportDone
              ? 'bg-green-500 text-white'       // completed & checked
              : isReportActive
              ? 'bg-REFERENCE-navy text-white'        // active but not yet ready
              : 'bg-gray-200'                    // pending
          }`}
        >
          {isReportDone ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> : '4'}
        </div>
        <span className="text-xs sm:text-sm md:text-base whitespace-nowrap">Report</span>
      </div>
    </div>
  );
}

export default ProgressIndicator;

