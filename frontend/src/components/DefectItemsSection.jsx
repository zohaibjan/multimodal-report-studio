// components/DefectItemsSection.jsx
import React from 'react';
import { AlertCircle, Trash2, X, Plus, Loader, Download } from 'lucide-react';

function DefectItemsSection({
  defects,
  selectedDefectPreview,
  includeRawTranscript,
  setIncludeRawTranscript,
  fileSelectFailed,
  isProcessing,
  setCurrentSection,
  handleDefectRemove,
  handleDefectUpdate,
  handleDefectPhotoAdd,
  handleDefectPhotoRemove,
  toggleDefectPreview,
  handleGenerateReport,
  isDemoMode,
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-REFERENCE-navy border-l-4 border-REFERENCE-navy pl-3 sm:pl-4 mb-4 sm:mb-6 break-words">
        Defect Items ({defects.length})
      </h2>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
        <p className="text-xs sm:text-sm text-blue-800 break-words">
          Review each defect below. You can edit details and attach one or more photos per defect. Photos will use the defect description as the caption in the report.
        </p>
      </div>

      {defects.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600">No defects detected. Go back to edit the transcript or start a new inspection.</p>
        </div>
      ) : (
        <div className="space-y-6" data-tour="remaining-defects">
          {defects.map((defect, index) => (
            <div key={defect.id} className="border border-gray-300 rounded-lg p-6 bg-white shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-REFERENCE-navy">#{index + 1}</span>
                  <div>
                    <span className="inline-block px-3 py-1 bg-REFERENCE-navy text-white text-sm rounded-full">
                      {defect.defect_code ?? defect.code}
                    </span>
                    <p className="text-sm text-gray-600 mt-1">{defect.category} - {defect.subcategory}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDefectRemove(defect.id)}
                  className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              </div>

              <div data-tour={index === 0 ? "defect-edit-field" : undefined}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Defect Found</label>
                    <input
                      type="text"
                      value={defect.defect_found}
                      onChange={(e) => handleDefectUpdate(defect.id, 'defect_found', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-REFERENCE-navy focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Standard</label>
                    <input
                      type="text"
                      value={defect.standard}
                      onChange={(e) => handleDefectUpdate(defect.id, 'standard', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-REFERENCE-navy focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Non-Compliance Details</label>
                  <textarea
                    value={defect.non_compliance}
                    onChange={(e) => handleDefectUpdate(defect.id, 'non_compliance', e.target.value)}
                    rows="2"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-REFERENCE-navy focus:border-transparent"
                  />
                </div>
              </div>

              {/* Photos Section */}
              <div className="border-t border-gray-200 pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Photos ({defect.photos?.length ?? 0})
                  <span className="text-xs text-gray-500 ml-2">Add 1 or more photos for this defect</span>
                </label>

                <div className="mb-3">
                  {/* Mobile scroller */}
                  <div className="flex gap-3 overflow-x-auto photo-scroller hide-scrollbar py-1 md:hidden">
                    {(defect.photos ?? []).map((photo, photoIdx) => (
                      <div key={photoIdx} className="flex-none w-36 sm:w-44 relative group">
                        <button
                          onClick={() => toggleDefectPreview(defect.id, photoIdx)}
                          className="w-full h-28 rounded-lg overflow-hidden focus:outline-none thumbnail-preview"
                          aria-label={`Preview defect ${index + 1} photo ${photoIdx + 1}`}
                        >
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`Defect ${index + 1} Photo ${photoIdx + 1}`}
                            className="w-full h-full object-cover rounded border border-gray-300"
                          />
                        </button>
                        <button
                          onClick={() => handleDefectPhotoRemove(defect.id, photoIdx)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <p className="text-xs text-gray-600 mt-1 truncate text-center">{photo.name}</p>
                      </div>
                    ))}
                  </div>
                  {/* Desktop grid */}
                  <div className="hidden md:grid md:grid-cols-4 md:gap-3">
                    {(defect.photos ?? []).map((photo, photoIdx) => (
                      <div key={photoIdx} className="relative group">
                        <button
                          onClick={() => toggleDefectPreview(defect.id, photoIdx)}
                          className="w-full h-32 rounded overflow-hidden focus:outline-none thumbnail-preview"
                          aria-label={`Preview defect ${index + 1} photo ${photoIdx + 1}`}
                        >
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`Defect ${index + 1} Photo ${photoIdx + 1}`}
                            className="w-full h-full object-cover rounded border border-gray-300"
                          />
                        </button>
                        <button
                          onClick={() => handleDefectPhotoRemove(defect.id, photoIdx)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <p className="text-xs text-gray-600 mt-1 truncate">{photo.name}</p>
                      </div>
                    ))}
                  </div>
                  {/* Inline preview */}
                  {selectedDefectPreview[defect.id] !== undefined &&
                    (defect.photos ?? [])[selectedDefectPreview[defect.id]] && (
                      <div className="mt-3 rounded-lg border border-gray-200 p-3 bg-gray-50">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <img
                              src={URL.createObjectURL((defect.photos ?? [])[selectedDefectPreview[defect.id]])}
                              alt={(defect.photos ?? [])[selectedDefectPreview[defect.id]].name}
                              className="w-full h-56 object-contain rounded-lg bg-white"
                            />
                            <p className="text-xs text-gray-600 mt-2 truncate">
                              {(defect.photos ?? [])[selectedDefectPreview[defect.id]].name}
                            </p>
                          </div>
                          <div className="ml-3 flex-shrink-0">
                            <button
                              onClick={() => toggleDefectPreview(defect.id, selectedDefectPreview[defect.id])}
                              className="px-3 py-1 border border-gray-300 rounded-lg text-xs text-gray-700 hover:bg-gray-100"
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                </div>

                {/* Add Photo Button */}
                <div className="border-2 border-dashed border-gray-300 rounded hover:border-REFERENCE-navy transition-colors" data-tour={index === 0 ? "defect-add-photos" : undefined}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleDefectPhotoAdd(defect.id, e)}
                    className="hidden"
                    id={`defect-photo-${defect.id}`}
                  />
                  <label
                    htmlFor={`defect-photo-${defect.id}`}
                    className="cursor-pointer flex flex-col items-center justify-center h-32 text-gray-400 hover:text-REFERENCE-navy"
                  >
                    <Plus className="w-8 h-8" />
                    <span className="text-xs mt-1">Add Photos</span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Raw Transcript Checkbox (shown below defects section / before generate) */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={includeRawTranscript}
            onChange={(e) => setIncludeRawTranscript(e.target.checked)}
            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            data-tour="include-raw-transcript-checkbox"
            disabled={isDemoMode}
          />
          <div>
            <span className="text-sm font-medium text-blue-900">Include Raw Transcript</span>
            <p className="text-xs text-blue-700 mt-1">
              Check this to include the full audio transcript before the defect items in the report.
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
          disabled={isProcessing || defects.length === 0}
          aria-busy={isProcessing}
          className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors text-sm sm:text-base select-none"
          data-tour="generate-report-button"
        >
          {isProcessing ? (
            <>
              <Loader className="w-5 h-5 animate-spin flex-shrink-0" />
              <span className="whitespace-nowrap">Generating Report ...</span>
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

export default DefectItemsSection;

