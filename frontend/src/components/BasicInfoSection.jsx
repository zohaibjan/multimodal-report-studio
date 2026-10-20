// components/BasicInfoSection.jsx
import React from 'react';
import {
  Image,
  FileAudio,
  CheckCircle,
  Loader,
  X,
  ChevronDown,
  Play,
  Pause,
} from 'lucide-react';

function BasicInfoSection({
  // Form state
  inspectorName,
  setInspectorName,
  contractorName,
  setContractorName,
  siteAddress,
  setSiteAddress,
  otherContractors,
  setOtherContractors,
  isCompliant,
  setIsCompliant,
  // File state
  audioFile,
  setAudioFile,
  conversationFile,
  setConversationFile,
  conversationTranscriptionError,
  setConversationTranscript,
  setConversationTranscriptionError,
  mainSiteImage,
  setMainSiteImage,
  generalPhotos,
  setGeneralPhotos,
  selectedGeneralPreviewIndex,
  setSelectedGeneralPreviewIndex,
  // UI state
  showOptional,
  setShowOptional,
  fileSelectFailed,
  // Refs
  audioInputRef,
  mainSiteInputRef,
  generalPhotosInputRef,
  convInputRef,
  audioElemRef,
  // Audio preview
  audioPreviewUrl,
  setAudioPreviewUrl,
  isPreviewPlaying,
  setIsPreviewPlaying,
  setTranscript,
  // Handlers
  handleMainSiteImageChange,
  handleAudioFileChange,
  handleGeneralPhotosAdd,
  handleGeneralPhotoRemove,
  handleConversationFileChange,
  toggleGeneralPreview,
  handleProcessAudio,
  isProcessing,
  backendReady,
  // Tour state
  tourRun,
  tourSteps,
  stepIndex,
  setStepIndex,
  // Demo Mode
  isDemoMode,
}) 
{
  // A small helper to keep cursor styles consistent everywhere.
  const cursorClass = (isEnabled) => (isEnabled ? 'cursor-pointer' : 'cursor-default');
  const inputFocusClass = isDemoMode
    ? 'focus:ring-0 focus:outline-none focus:border-gray-300' // no highlight in demo
    : 'focus:ring-2 focus:ring-REFERENCE-navy focus:border-transparent'; // normal highlight

  return (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-REFERENCE-navy border-l-4 border-REFERENCE-navy pl-3 sm:pl-4 mb-4 sm:mb-6 break-words">
        Basic Information
      </h2>
      {/* Step 1 target */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-tour="basic-info-welcome">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Reviewer Name *</label>
          <input
            type="text"
            value={inspectorName}
            onChange={(e) => setInspectorName(e.target.value)}
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${inputFocusClass}`}
            placeholder="John Smith"
            readOnly={isDemoMode}
            aria-disabled={isDemoMode}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Supplier Name *</label>
          <input
            type="text"
            value={contractorName}
            onChange={(e) => setContractorName(e.target.value)}
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${inputFocusClass}`}
            placeholder="ABC Construction Pty Ltd"
            readOnly={isDemoMode}
            aria-disabled={isDemoMode}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Site Address *</label>
          <textarea
            value={siteAddress}
            onChange={(e) => setSiteAddress(e.target.value)}
            rows="3"
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${inputFocusClass}`}
            placeholder="123 Main Street, Suburb, QLD 4000"
            readOnly={isDemoMode}
            aria-disabled={isDemoMode}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Other Contractors</label>
          <textarea
            value={otherContractors}
            onChange={(e) => setOtherContractors(e.target.value)}
            rows="3"
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${inputFocusClass}`}
            placeholder="Contractor 2, Contractor 3"
            readOnly={isDemoMode}
            aria-disabled={isDemoMode}
          />
        </div>
      </div>

      {/* Site Compliance Checkbox - Step 2 target */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg" data-tour="compliance-checkbox">
        <label 
          className={`flex items-center gap-3 ${cursorClass(!isDemoMode)}`}
        >
          <input
            type="checkbox"
            checked={isCompliant}
            onChange={(e) => setIsCompliant(e.target.checked)}
            className={`w-5 h-5 text-REFERENCE-navy rounded focus:ring-2 focus:ring-REFERENCE-navy ${cursorClass(!isDemoMode)}`}
            disabled={isDemoMode}
            aria-disabled={isDemoMode}
          />
          <div>
            <span className="text-sm font-medium text-gray-900">Site is Compliant</span>
            <p className="text-xs text-gray-600 mt-1">
              Check this if the site has no defects. The report will include the audio transcript without defect mapping.
            </p>
          </div>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Main Site Photo - Step 3 target */}
        <div data-tour="main-site-photo">
          <label className="block text-sm font-medium text-gray-700 mb-2">Main Site Photo *</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-REFERENCE-navy transition-colors relative">
            <input
              ref={mainSiteInputRef}
              type="file"
              accept="image/*"
              onChange={handleMainSiteImageChange}
              disabled={isDemoMode}
              aria-disabled={isDemoMode}
              className="hidden"
              id="mainSiteImage"
            />
            {!mainSiteImage && (
              <label htmlFor="mainSiteImage" className={`${cursorClass(!isDemoMode)}`}>
                <Image className="w-12 h-12 mx-auto text-gray-400 mb-2" aria-hidden="true" />
                <p className="text-sm text-gray-600">Click to upload main site photo</p>
              </label>
            )}
            {/* When image is selected, show its name (optional) */}
            {mainSiteImage && (
              <p className="text-sm text-gray-700">{mainSiteImage.name ?? 'Selected image'}</p>
            )}
            {/* Preview block */}
            {mainSiteImage?.previewUrl && (
              <div className="mt-3">
                <div className="text-xs text-gray-600 mb-1">Preview</div>
                <img
                  src={mainSiteImage.previewUrl}
                  alt={mainSiteImage.name ?? "Main site image"}
                  className="w-full max-h-64 object-cover rounded-lg border border-gray-200"
                  decoding="async"
                />
              </div>
            )}
            {/* Remove button */}
            {mainSiteImage && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (mainSiteImage?.previewUrl) URL.revokeObjectURL(mainSiteImage.previewUrl);
                  setMainSiteImage(null);
                  if (mainSiteInputRef.current) {
                    mainSiteInputRef.current.value = '';
                  }
                }}
                className={`absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors ${cursorClass(!isDemoMode)}`}
                title="Remove main site image"
                disabled={isDemoMode}
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {fileSelectFailed && (
              <p className="text-xs text-yellow-700 mt-2">
                No file was selected — if you're in an embedded webview try opening this page in a full browser or choose the image from the Files or Photos app.
              </p>
            )}
          </div>
        </div>

        {/* Audio Recording - Step 4 target */}
        <div data-tour="audio-recording">
          <label className="block text-sm font-medium text-gray-700 mb-2">Audio Recording {!isCompliant && <span aria-hidden="true"> *</span>}</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-REFERENCE-navy transition-colors relative">
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*,.mp3,.m4a,.wav"
              onChange={handleAudioFileChange}
              className="hidden"
              id="audioFile"
              disabled={isDemoMode}
              aria-disabled={isDemoMode}
            />
            <label htmlFor="audioFile" className={`${cursorClass(!isDemoMode)}`}>
              <FileAudio className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                {audioFile ? audioFile.name : `Click to upload audio recording ${isCompliant ? '(optional for compliant sites)' : '(required)'}`}
              </p>
            </label>

            {audioFile && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setAudioFile(null);
                  setAudioPreviewUrl(null);
                  setTranscript('');
                  if (audioInputRef.current) {
                    audioInputRef.current.value = '';
                  }
                }}
                className={`absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors ${cursorClass(!isDemoMode)}`}
                title="Remove audio file"
                disabled={isDemoMode} //disable remove in demo mode
              >
                <X className="w-4 h-4" />
              </button>
            )}
            
            {/* Shared preview for uploaded or recorded audio (native player only) */}
            {audioPreviewUrl && (
              <audio
                ref={audioElemRef}
                src={audioPreviewUrl}
                controls
                controlsList="nodownload"
                className={
                  // In demo mode, visually gray it out and block mouse/touch interaction
                  isDemoMode
                    ? "w-full mt-2 opacity-60 pointer-events-none"
                    : "w-full mt-2"
                }
                onPlay={() => {
                  // Keep UI state in sync
                  setIsPreviewPlaying(true);
                  // In demo mode immediately pause so it never plays
                  if (isDemoMode) {
                    const el = audioElemRef.current;
                    if (el) {
                      el.pause();
                      setIsPreviewPlaying(false);
                    }
                  }
                }}
                onPause={() => setIsPreviewPlaying(false)}
                // Optional: prevent keyboard-initiated play in demo mode
                onKeyDown={(e) => {
                  if (!isDemoMode) return;
                  // Space/Enter should not start playback
                  if (e.key === " " || e.key === "Enter") {
                    e.preventDefault();
                  }
                }}
                // Optional: prevent focus ring implying interactivity in demo mode
                tabIndex={isDemoMode ? -1 : 0}
                aria-disabled={isDemoMode ? true : undefined}
              />
            )}
            {fileSelectFailed && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                File selection returned no file. On iPad / embedded browsers this can happen if the webview blocks the file picker — try opening this page in a full browser or use the device Files app to choose the file. If the problem persists, please capture console logs and share them with the dev team.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Optional block header + toggle - Step 5 target */}
      <div className="mt-6" data-tour="optional-inputs-section">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Optional Inputs</label>
          <button
            onClick={() => {
              const willOpen = !showOptional;
              setShowOptional(willOpen);
              if (willOpen && tourRun && tourSteps?.[stepIndex]?.target === '[data-tour="optional-inputs-toggle"]') {
                setStepIndex(stepIndex + 1);
              }
            }}
            aria-expanded={showOptional}
            className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 focus:outline-none"
              data-tour="optional-inputs-toggle"
          >
            <span className="sr-only">{showOptional ? 'Hide optional inputs' : 'Show optional inputs'}</span>
            <ChevronDown className={`w-4 h-4 text-REFERENCE-navy transform transition-transform duration-200 ${showOptional ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showOptional && (
          <>
            {/* General Photos and Review Conversation side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* General Photos - Step 6 target */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-REFERENCE-navy transition-colors min-h-[256px] flex flex-col" data-tour="general-photos">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">General Site Photos (Optional)</label>
                  <p className="text-xs text-gray-500 mb-3">Upload additional site overview/context photos (separate from defect-specific photos)</p>
                </div>
                <div className="flex-1">
                  <input
                    ref={generalPhotosInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGeneralPhotosAdd}
                    className="hidden"
                    id="generalPhotos"
                    disabled={isDemoMode}
                    aria-disabled={isDemoMode}

                  />
                  <label htmlFor="generalPhotos" className={`${cursorClass(!isDemoMode)} block text-center mb-4`}>
                    <Image className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Click to upload general site photos (can select multiple)</p>
                    {generalPhotos.length > 0 && (
                      <p className="text-xs text-green-600 mt-2 font-medium">
                        ✓ {generalPhotos.length} photo{generalPhotos.length !== 1 ? 's' : ''} ready to upload
                      </p>
                    )}
                  </label>

                  {generalPhotos.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {/* Mobile scroller */}
                      <div className="flex gap-3 overflow-x-auto photo-scroller py-3 md:hidden border-2 border-gray-300 rounded-lg p-3 bg-white shadow-sm min-h-[140px]">
                        {generalPhotos.map((photo, idx) => (
                          <div key={idx} className="flex-none w-36 sm:w-44 relative group">
                            <button
                              onClick={() => toggleGeneralPreview(idx)}
                              className={`w-full h-28 rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-REFERENCE-navy thumbnail-preview border-2 border-gray-200 hover:border-REFERENCE-navy transition-all shadow-sm hover:shadow-md ${cursorClass(true)}`}
                              aria-label={`Preview ${photo.name}`}
                            >
                              <img src={URL.createObjectURL(photo)} alt={`General ${idx + 1}`} className="w-full h-full object-cover" />
                            </button>
                            <button
                              onClick={() => handleGeneralPhotoRemove(idx)}
                              className={`absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600 ${cursorClass(true)}`}
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <p className="text-xs text-gray-700 mt-1 truncate text-center font-semibold">Photo #{idx + 1}</p>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 text-center md:hidden flex items-center justify-center gap-1">
                        <span className="inline-block w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center text-[10px]">←</span>
                        Swipe to see all {generalPhotos.length} photos
                        <span className="inline-block w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center text-[10px]">→</span>
                      </p>
                      {/* Desktop grid */}
                      <div className="hidden md:block border-2 border-gray-300 rounded-xl p-4 bg-gradient-to-br from-gray-50 to-white shadow-md min-h-[200px]">
                        <div className="text-sm font-medium text-gray-700 mb-3 flex items-center justify-between">
                          <span>{generalPhotos.length} photo{generalPhotos.length !== 1 ? 's' : ''} uploaded</span>
                          {generalPhotos.length > 6 && <span className="text-xs text-gray-500">Scroll to view all ↓</span>}
                        </div>
                        <div className="grid grid-cols-3 gap-4 auto-rows-max max-h-[500px] overflow-y-auto pr-2 scrollbar-custom">
                          {generalPhotos.map((photo, idx) => (
                            <div key={idx} className="relative group">
                              <button
                                onClick={() => toggleGeneralPreview(idx)}
                                className={`w-full h-36 rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-REFERENCE-navy thumbnail-preview border-2 border-gray-200 hover:border-REFERENCE-navy transition-all shadow-sm hover:shadow-md ${cursorClass(true)}`}
                                aria-label={`Preview ${photo.name}`}
                              >
                                <img src={URL.createObjectURL(photo)} alt={`General ${idx + 1}`} className="w-full h-full object-cover" />
                              </button>
                              <button
                                onClick={() => handleGeneralPhotoRemove(idx)}
                                className={`absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600 ${cursorClass(true)}`}
                              >
                                <X className="w-4 h-4" />
                              </button>
                              <p className="text-xs text-gray-700 mt-2 text-center font-semibold">Photo #{idx + 1}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Inline preview */}
                      {selectedGeneralPreviewIndex !== null && generalPhotos[selectedGeneralPreviewIndex] && (
                        <div className="mt-3 rounded-lg border border-gray-200 p-3 bg-gray-50 max-h-44 overflow-auto">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <img
                                src={URL.createObjectURL(generalPhotos[selectedGeneralPreviewIndex])}
                                alt={generalPhotos[selectedGeneralPreviewIndex].name}
                                className="w-full h-40 object-contain rounded-lg bg-white"
                              />
                              <p className="text-xs text-gray-600 mt-2 truncate">
                                {generalPhotos[selectedGeneralPreviewIndex].name}
                              </p>
                            </div>
                            <div className="ml-3 flex-shrink-0">
                              <button
                                onClick={() => setSelectedGeneralPreviewIndex(null)}
                                className="px-3 py-1 border border-gray-300 rounded-lg text-xs text-gray-700 hover:bg-gray-100"
                              >
                                Close
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Review Conversation (Optional) - Step 7 target */}
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-REFERENCE-navy transition-colors h-64 flex flex-col justify-between relative"
                data-tour="builder-conversation"
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">Review Conversation (Optional)</label>
                <p className="text-xs text-gray-500 mb-2">
                  If you recorded a short discussion with a participant (context / clarifications), upload it here and we'll include a transcript in the report.
                </p>
                <div className="text-center mt-4">
                  <input
                    ref={convInputRef}
                    type="file"
                    accept=".mp3,.m4a,.wav,audio/*"
                    onChange={handleConversationFileChange}
                    className="hidden"
                    id="conversationFile"
                    disabled={isDemoMode}
                    aria-disabled={isDemoMode}

                  />
                  <label htmlFor="conversationFile" className={`${cursorClass(!isDemoMode)} inline-block`}>
                    <FileAudio className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      {conversationFile ? conversationFile.name : 'Click to upload conversation recording (optional)'}
                    </p>
                  </label>
                  {conversationFile && (
                    <>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setConversationFile(null);
                          setConversationTranscript('');
                          setConversationTranscriptionError(null);
                          if (convInputRef.current) {
                            convInputRef.current.value = '';
                          }
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                        title="Remove conversation file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="mt-2 text-xs text-gray-500">
                        <p>We will transcribe this and include the conversation transcript in the final report. You can edit it later.</p>
                        {conversationTranscriptionError && (
                          <p className="text-xs text-red-600 mt-2">Conversation transcription failed: {conversationTranscriptionError}</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Process button - Step 8 target */}
      <div className="flex justify-end mt-6 sm:mt-8">
        <button
          onClick={handleProcessAudio}
          disabled={isProcessing || !backendReady}
          className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-REFERENCE-navy text-white rounded-lg hover:bg-REFERENCE-navy-dark disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors text-sm sm:text-base"
          data-tour="process-audio-button"
        >
          {isProcessing ? (
            <>
              <Loader className="w-5 h-5 animate-spin flex-shrink-0" />
              <span className="whitespace-nowrap">Processing Audio...</span>
            </>
          ) : (
            <>
              <span className="whitespace-nowrap">Process Audio & Continue</span>
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default BasicInfoSection;

