// components/TranscriptReviewSection.jsx
import React from 'react';
import { CheckCircle, Edit2, Save } from 'lucide-react';
import waitForElement from '../utils/waitForElement';

function TranscriptReviewSection({
  transcript,
  setTranscript,
  isEditingTranscript,
  setIsEditingTranscript,
  conversationTranscript,
  setConversationTranscript,
  isEditingConversationTranscript,
  setIsEditingConversationTranscript,
  defects,
  isCompliant,
  setCurrentSection,
  handleConfirmTranscript,
  stepIndex,
  setStepIndex,
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-REFERENCE-navy border-l-4 border-REFERENCE-navy pl-3 sm:pl-4 mb-4 sm:mb-6 break-words">
        Review Transcript
      </h2>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4">
        <p className="text-xs sm:text-sm text-blue-800 break-words">
          Review the transcript below. You can edit it if needed, then click "Confirm & Continue" to proceed to defect items.
        </p>
      </div>
      {/* Transcript editor - Step 9 target */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Transcript</label>
          <button
            onClick={async () => {
              setIsEditingTranscript(true);
              await waitForElement('[data-tour="transcript-textarea"]', 800, 20);
              setStepIndex((i) => i + 1);
            }}
            className="text-sm text-REFERENCE-navy hover:underline flex items-center gap-1"
            data-tour="transcript-edit-button"
            style={{ display: isEditingTranscript ? 'none' : 'inline-flex' }}
          >
            Edit Transcript
          </button>

          {/* Done Editing (Save) */}
          <button
            onClick={async () => {
              setIsEditingTranscript(false);
              await new Promise((r) => setTimeout(r, 0));
              setStepIndex((i) => i + 1);
            }}
            className="text-sm text-REFERENCE-navy hover:underline flex items-center gap-1"
            data-tour="transcript-save-button"
            style={{ display: isEditingTranscript ? 'inline-flex' : 'none' }}
          >
            Done Editing
          </button>
        </div>
        
        {isEditingTranscript ? (
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows="12"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-REFERENCE-navy focus:border-transparent font-mono text-sm"
            data-tour="transcript-textarea"
            placeholder="Edit the transcript text here…"
          />
        ) : (
          <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 whitespace-pre-wrap font-mono text-sm max-h-96 overflow-y-auto">
            {transcript}
          </div>
        )}

        {/* Conversation transcript (optional) - Step 10 target */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">Review Conversation (Optional)</label>
            
            <button
              onClick={async () => {
                setIsEditingConversationTranscript(true);
                await waitForElement('[data-tour="conversation-textarea"]', 800, 20);
                setStepIndex((i) => i + 1);
              }}
              className="text-sm text-REFERENCE-navy hover:underline flex items-center gap-1"
              data-tour="conversation-edit-button"
              style={{ display: isEditingConversationTranscript ? 'none' : 'inline-flex' }}
            >
              <Edit2 size={16} />
              {conversationTranscript ? 'Edit Conversation' : 'Add Conversation Transcript'}
            </button>
            {/* DONE EDITING (visible when editing) */}
            <button
              onClick={async () => {
                setIsEditingConversationTranscript(false);
                await new Promise((r) => setTimeout(r, 0));
                setStepIndex((i) => i + 1);
              }}
              className="text-sm text-REFERENCE-navy hover:underline flex items-center gap-1"
              data-tour="conversation-save-button"
              style={{ display: isEditingConversationTranscript ? 'inline-flex' : 'none' }}
            >
              <Save size={16} />
              Done Editing
            </button>
          </div>
          
          {isEditingConversationTranscript ? (
            <textarea
              value={conversationTranscript}
              onChange={(e) => setConversationTranscript(e.target.value)}
              rows="6"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-REFERENCE-navy focus:border-transparent font-mono text-sm"
              data-tour="conversation-textarea"
              placeholder="Paste or type the review conversation here (this will be included in the final report)."
            />
          ) : (
            <p className="mt-2 text-gray-700 whitespace-pre-wrap">
              {conversationTranscript ?? 'No conversation transcript provided.'}
            </p>
          )}
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-green-800 font-medium mb-2 break-words">
          Detected {defects.length} defect{defects.length !== 1 ? 's' : ''}
        </p>
        <p className="text-xs sm:text-sm text-green-700 break-words">
          Continue to the next section to attach photos to each defect.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 mt-6 sm:mt-8">
        <button
          onClick={() => setCurrentSection('basic')}
          className="w-full sm:w-auto px-4 sm:px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
        >
          Back to Basic Info
        </button>
        <button
          onClick={handleConfirmTranscript}
          className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-REFERENCE-navy text-white rounded-lg hover:bg-REFERENCE-navy-dark flex items-center justify-center gap-2 transition-colors text-sm sm:text-base"
          data-tour="confirm-transcript-button"
        >
          <span className="whitespace-nowrap">{isCompliant ? 'Confirm & Generate Report' : 'Confirm & Continue to Defects'}</span>
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
        </button>
      </div>
    </div>
  );
}

export default TranscriptReviewSection;

