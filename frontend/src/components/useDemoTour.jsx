// components/useDemoTour.jsx
import { useState, useMemo, useCallback, useEffect } from 'react';
import { STATUS, EVENTS } from 'react-joyride';
import waitForElement from '../utils/waitForElement';




import React from "react";

export function CustomTooltip({
  step,
  continuous,
  isLastStep,
  index,
  backProps,
  primaryProps,
  tooltipProps,
  carouselAtEnd = false,
  onCarouselNext,
  onCarouselPrev,
  carouselIndex = 0,
  carouselTotal = 0,
  carouselWidth = 600,
  carouselHeight = 600,
}) {
  const [viewport, setViewport] = useState({ w: 1024, h: 768 });
  const isCarouselStep = step?.meta?.isCarousel === true;
  const shouldShowFinish =
    (isCarouselStep && carouselAtEnd) || (!isCarouselStep && isLastStep);

  const primaryLabel = shouldShowFinish ? "Finish" : "Next";

  const handlePrimaryClick = (e) => {
    if (isCarouselStep && !carouselAtEnd) {
      e.preventDefault();
      e.stopPropagation();
      onCarouselNext?.();
      return;
    }
    primaryProps?.onClick?.(e);
  };
  
  useEffect(() => {
    // Guard for SSR
    if (typeof window === "undefined") return;
  const update = () => {
    const vv = window.visualViewport;
    const w = vv?.width ?? window.innerWidth;
    const h = vv?.height ?? window.innerHeight;
    setViewport({ w, h });
  };
  update();
  window.addEventListener("resize", update);
  window.visualViewport?.addEventListener("resize", update);
  window.visualViewport?.addEventListener("scroll", update);
  return () => {
    window.removeEventListener("resize", update);
    window.visualViewport?.removeEventListener("resize", update);
    window.visualViewport?.removeEventListener("scroll", update);
  };
  }, []);


    const requireAction = step?.meta?.requireAction === true;
    const hideBack = step?.meta?.hideBack === true;
    const HORIZONTAL_GUTTER = 24;   // px on left + right
    const VERTICAL_GUTTER = 140;    // px to leave room for Joyride spacing + safe areas
    const responsiveCarouselSize = useMemo(() => {
      const maxW = carouselWidth;
      const maxH = carouselHeight;
      const w = Math.max(280, Math.min(maxW, viewport.w - HORIZONTAL_GUTTER * 2));
      const h = Math.max(320, Math.min(maxH, viewport.h - VERTICAL_GUTTER));

      return { w, h };
    }, [carouselWidth, carouselHeight, viewport.w, viewport.h]);

    // Optional: make buttons less wide on very small screens to avoid wrapping
    const btnBase =
      "h-9 min-w-[76px] sm:min-w-[92px] px-4 rounded-md text-sm font-medium flex items-center justify-center";

    const prevBtn = `${btnBase} bg-gray-200 text-gray-900 hover:bg-gray-300 disabled:opacity-50 disabled:hover:bg-gray-200`;
    const nextBtn = `${btnBase} bg-REFERENCE-navy text-white hover:bg-REFERENCE-navy-dark disabled:opacity-50`;

    
    const tooltipClassName = [
      tooltipProps?.className,
      "max-w-full",
      "max-w-full", 
      "bg-white",
      "rounded-lg",
      "shadow-lg",
      "border border-gray-200",
      isCarouselStep ? "p-0 overflow-hidden" : "p-4",
    ]
      .filter(Boolean)
      .join(" ");


    // ✅ Use responsive size for carousel steps
    const carouselRootStyle = isCarouselStep
      ? {
          width: `${responsiveCarouselSize.w}px`,
          height: `${responsiveCarouselSize.h}px`,
          maxWidth: `${responsiveCarouselSize.w}px`,
          maxHeight: `${responsiveCarouselSize.h}px`,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxSizing: "border-box",
        }
      : {
          boxSizing: "border-box",
        };

    // Content must be shrinkable so footer always stays visible
    const carouselContentStyle = {
      flex: "1 1 auto",
      minHeight: 0,
      overflow: "hidden",
      padding: 16,
      display: "flex",
    };

    const carouselInnerContentStyle = {
      flex: 1,
      minHeight: 0,
      minWidth: 0,
    };

    const carouselFooterStyle = {
      flex: "0 0 auto",
      minHeight: 56,
      padding: "8px 16px",
      borderTop: "1px solid rgb(229 231 235)",
      background: "white",
      display: "flex",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap", // ✅ helps on tiny widths
    };

    const isMobileViewport = viewport.w < 640;
    const maxTooltipHeightPx = Math.max(240, (viewport.h || 768) - (isMobileViewport ? 48 : 24));

  return (
    <div
      {...tooltipProps}
      className={tooltipClassName}
      style={{
        ...tooltipProps?.style,
        ...carouselRootStyle,
        // Ensure tooltip stays within viewport on mobile
        ...(isMobileViewport && !isCarouselStep && {
          maxWidth: `calc(${viewport.w}px - 32px)`,
          width: `calc(${viewport.w}px - 32px)`,
        }),
        ...(isCarouselStep
          ? {}
          : { maxHeight: `${maxTooltipHeightPx}px`, overflowY: "auto", overflowX: "hidden" }),
      }}
    >
      {isCarouselStep ? (
        <>
          {/* Content (fills space) */}
          <div style={carouselContentStyle}>
            <div style={carouselInnerContentStyle}>{step?.content}</div>
          </div>

          {/* Footer (pinned) */}
          {!requireAction && (
            <div style={carouselFooterStyle}>
              <button
                type="button"
                onClick={onCarouselPrev}
                disabled={carouselIndex === 0}
                className={prevBtn}
              >
                Prev
              </button>

              <div className="flex-1" />

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {carouselIndex + 1}/{carouselTotal}
                </span>

                <button
                  {...primaryProps}
                  onClick={handlePrimaryClick}
                  className={`${nextBtn} ${primaryProps?.className ?? ""}`}
                >
                  {primaryLabel}
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4">
          <div>{step?.content}</div>

          {!requireAction && (
            <div className="flex items-center justify-between gap-2 pt-2">
              {!hideBack && backProps?.onClick && index > 0 ? (
                <button
                  {...backProps}
                  className={`${prevBtn} ${backProps?.className ?? ""}`}
                >
                  Back
                </button>
              ) : (
                <div />
              )}

              {continuous && primaryProps?.onClick ? (
                <button
                  {...primaryProps}
                  onClick={handlePrimaryClick}
                  className={`${nextBtn} ${primaryProps?.className ?? ""}`}
                >
                  {primaryLabel}
                </button>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
}




// iPhone carousel slides
export const DOWNLOAD_CAROUSEL_SLIDES_IPHONE = [
  { src: '/demo/placeholder.svg', title: 'Tap "Download"' },
  { src: '/demo/placeholder.svg', title: 'Tap on the downloads icon' },
  { src: '/demo/placeholder.svg', title: 'Tap on "Downloads"' },
  { src: '/demo/placeholder.svg', title: 'Tap on the report file you just downloaded' },
  { src: '/demo/placeholder.svg', title: 'This will open the report in Microsoft Word. Tap the three dots (...) top right.' },
  { src: '/demo/placeholder.svg', title: 'Tap "Save a copy"' },
  { src: '/demo/placeholder.svg', title: 'Rename if needed and tap OneDrive' },
  { src: '/demo/placeholder.svg', title: 'Select or create a folder, then tap "Save"' },
];

// iPad carousel slides (placeholder images - to be replaced)
export const DOWNLOAD_CAROUSEL_SLIDES_IPAD = [
  { src: '/demo/placeholder.svg', title: 'Tap "Download" to save the report' },
  { src: '/demo/placeholder.svg', title: 'Tap on the report you just downloaded' },
  { src: '/demo/placeholder.svg', title: 'The report opens in Microsoft Word. Tap the three dots (...) in the top right.' },
  { src: '/demo/placeholder.svg', title: 'Tap "Save a copy"' },
  { src: '/demo/placeholder.svg', title: 'Rename if needed and select OneDrive, Choose or create a folder, then tap "Save"' },
];

// Legacy export for backwards compatibility
export const DOWNLOAD_CAROUSEL_SLIDES = DOWNLOAD_CAROUSEL_SLIDES_IPHONE;

// Helper to detect mobile/tablet devices (iPhone, iPad, Android)
// Used to determine if we should show the download carousel
export function getIsMobileDevice() {
  if (typeof window === 'undefined') return false;
  
  // URL param override for testing: ?mobile=true or ?desktop=true
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('mobile') === 'true') return true;
  if (urlParams.get('desktop') === 'true') return false;
  // ?ipad=true implies mobile (should show carousel)
  if (urlParams.get('ipad') === 'true') return true;
  
  const ua = navigator.userAgent || '';
  
  // Check for mobile/tablet indicators
  const isMobileUA = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  // iPad in iPadOS 13+ reports as Mac with touch support
  const isIPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  // Touch device with mobile-like screen (excludes touch laptops)
  const isTouchMobile = navigator.maxTouchPoints > 1 && window.innerWidth <= 1366;
  
  return isMobileUA || isIPadOS || isTouchMobile;
}

// Helper to detect iPad specifically (for choosing iPhone vs iPad carousel)
// Works with:
// 1. Real iPads (iPadOS 13+ reports as MacIntel with touch)
// 2. Chrome DevTools device emulation (checks user agent string)
// 3. URL param override for testing: ?ipad=true
export function getIsIPad() {
  if (typeof window === 'undefined') return false;
  
  // URL param override for testing: add ?ipad=true to force iPad mode
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('ipad') === 'true') return true;
  if (urlParams.get('ipad') === 'false') return false;
  
  const ua = navigator.userAgent || '';
  // iPad in iPadOS 13+ reports as Mac with touch support
  const isIPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  // Check user agent for "iPad" (works in Chrome DevTools emulation when UA is set)
  const isIPadUA = /iPad/.test(ua);
  // Also check for Macintosh in UA combined with touch (some iPadOS configs)
  const isMacWithTouch = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  
  return isIPadOS || isIPadUA || isMacWithTouch;
}



function DownloadAfterDownloadCarousel({ index, isIPad = false }) {
  const slides = isIPad ? DOWNLOAD_CAROUSEL_SLIDES_IPAD : DOWNLOAD_CAROUSEL_SLIDES_IPHONE;
  const slide = slides[index];

  return (
    <div className="w-full h-full flex flex-col min-h-0">
      {/* Title (fixed height so layout doesn't jump) */}
      <div className="flex-none h-10">
        <h4 className="text-sm font-semibold text-gray-900 leading-5 line-clamp-2">
          {slide.title}
        </h4>
      </div>

      {/* Fixed viewport uses remaining space */}
      <div className="flex-1 min-h-0 w-full">
        <div
          className="
            w-full h-full
            bg-gray-50
            border border-gray-200
            rounded-md
            overflow-hidden
            flex items-center justify-center
          "
        >
          <img
            src={slide.src}
            alt={slide.title}
            className="w-full h-full object-contain select-none"
            draggable={false}
            loading="eager"
          />
        </div>
      </div>
    </div>
  );
}
``



export function createSilentWavFile(sec = 2, sampleRate = 44100) {
  const numChannels = 1;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const numSamples = sec * sampleRate;
  const dataSize = numSamples * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  let offset = 0;
  function writeString(s) {
    for (let i = 0; i < s.length; i++) {
      view.setUint8(offset++, s.charCodeAt(i));
    }
  }
  writeString('RIFF');
  view.setUint32(offset, 36 + dataSize, true); offset += 4;
  writeString('WAVE');
  writeString('fmt ');
  view.setUint32(offset, 16, true); offset += 4; // Subchunk1Size (16 for PCM)
  view.setUint16(offset, 1, true); offset += 2; // AudioFormat (1 = PCM)
  view.setUint16(offset, numChannels, true); offset += 2; // NumChannels
  view.setUint32(offset, sampleRate, true); offset += 4; // SampleRate
  view.setUint32(offset, byteRate, true); offset += 4; // ByteRate
  view.setUint16(offset, blockAlign, true); offset += 2; // BlockAlign
  view.setUint16(offset, 8 * bytesPerSample, true); offset += 2; // BitsPerSample
  // data chunk
  writeString('data');
  view.setUint32(offset, dataSize, true); offset += 4;
  // PCM samples (silence)
  for (let i = 0; i < numSamples; i++) {
    view.setInt16(offset, 0, true);
    offset += 2;
  }
  const blob = new Blob([view], { type: 'audio/wav' });
  const file = new File([blob], `demo-inspection-${Date.now()}.wav`, { type: 'audio/wav' });
  file.previewUrl = URL.createObjectURL(blob);
  return file;
}
export const DEMO_FORM = {
  inspectorName: 'Demo Reviewer',
  contractorName: 'Example Supplier',
  siteAddress: 'Synthetic demo site — no real address',
  otherContractors: 'RoofCo Pty Ltd, PaintPro Services',
};
export const getDemoSteps = ({ carouselIndex, setCarouselIndex, isIPad = false, isMobile = false }) => [
  {
    target: '[data-tour="basic-info-welcome"]',
    content: (
      <>
        <h5 className="font-semibold">Welcome to the Multimodal Report Studio</h5>
        <p>Start by filling in the basic information. For this demo, the fields have been prefilled.</p>
        <p><br /></p>
        <small>Click "Next" to continue.</small>
      </>
    ),
    placement: 'auto',
    disableBeacon: true,
    spotlightClicks: true,
  },
  {
    target: '[data-tour="compliance-checkbox"]',
    content: (
      <>
        <h6>Tick this box if the site is compliant (The site has no defects).</h6>
        <p>For this demo, we'll leave it unchecked. </p>
        <p><br /></p>
        <small>Click "Next" to continue.</small>
      </>
    ),
    placement: 'auto',
    spotlightClicks: true,
    meta: { hideBack: true},
  },
  {
    target: '[data-tour="main-site-photo"]',
    content: (
      <>
        <h6>Upload the main site photo. This is a required field.</h6>
        <p>A demo file has been selected for you.</p>
        <p><br /></p>
        <small>Click "Next" to continue.</small>
      </>
    ),
    placement: 'auto',
    spotlightClicks: true,
    meta: { hideBack: true},
  },
  {
    target: '[data-tour="audio-recording"]',
    content: (
      <>
        <h6>Upload your audio recording of the inspection. This is also required.</h6>
        <p>A demo file has been selected for you.</p>
        <p><br /></p>
        <small>Click "Next" to continue.</small>
      </>
    ),
    placement: 'auto',
    spotlightClicks: true,
    meta: { hideBack: true},
  },
  {
    target: '[data-tour="optional-inputs-toggle"]',
    content: (
      <>
        <p>Expand this section to add optional site photos or builder conversation recordings.</p>
        <p><br /></p>
        <small>Click the expand button to continue.</small>
      </>
    ),
    placement: 'auto',
    spotlightClicks: true,
    meta: { requireAction: true }
  },
  {
    target: '[data-tour="general-photos"]',
    content: (
      <>
        <h6>Upload additional site photos here if available.</h6>
        <p>For this demo, we'll skip this optional step.</p>
        <p><br /></p>
        <small>Click "Next" to continue.</small>
      </>
    ),
    placement: 'auto',
    spotlightClicks: true,
    meta: { hideBack: true},
  },
  {
    target: '[data-tour="builder-conversation"]',
    content: (
      <>
        <h6>Upload a builder conversation recording if you have one.</h6>
        <p>For this demo, we'll skip this optional step.</p>
        <p><br /></p>
        <small>Click "Next" to continue.</small>
      </>
    ),
    placement: 'auto',
    spotlightClicks: true,
    meta: { hideBack: true},
  },
  {
    target: '[data-tour="process-audio-button"]',
    content: (
      <>
        <p>Process the audio to generate the transcript and detect defects.</p>
        <p><br /></p>
        <small>Click "Process Audio & Continue" to continue.</small>
      </>
    ),
    placement: 'auto',
    spotlightClicks: true,
    meta: { requireAction: true},
  },
  {
    target: '[data-tour="transcript-edit-button"]',
    content: (
      <>
        <p>Review and edit the transcript if needed.</p>
        <p><br /></p>
        <small>Click "Edit Transcript" to continue.</small>
      </>
    ),
    placement: 'auto',
    spotlightClicks: true,
    meta: { requireAction: true },
  },
  {
    target: '[data-tour="transcript-textarea"]',
    content: (
      <>
        <h6>You can make your edits in this text area</h6>
        <p>For this demo, we'll skip this step.</p>
        <p><br /></p>
        <small>Click "Next" to continue.</small>
      </>
    ),
    placement: 'auto',
    spotlightClicks: false,
    meta: { hideBack: true},
  },
  {
    target: '[data-tour="transcript-save-button"]',
    content: (
      <>
        <p>Save your transcript edits.</p>
        <p><br /></p>
        <small>Click "Done Editing" to continue.</small>
      </>
    ),
    placement: 'auto',
    spotlightClicks: true,
    meta: { requireAction: true },
  },
  {
    target: '[data-tour="conversation-edit-button"]',
    content: (
      <>
        <p>Add or edit the builder conversation transcript if you uploaded a recording.</p>
        <p><br /></p>
        <small>Click "Add Conversation Transcript" to continue.</small>
      </>
    ),
    placement: 'auto',
    spotlightClicks: true,
    meta: { requireAction: true },
  },
  {
    target: '[data-tour="conversation-textarea"]',
    content: (
      <>
        <h6>You can edit builders conversations in this text area</h6>
        <p>For this demo, we'll skip this optional step.</p>
        <p><br /></p>
        <small>Click "Next" to continue.</small>
      </>
    ),
    placement: 'auto',
    spotlightClicks: false,
    meta: { hideBack: true},
  },
  {
    target: '[data-tour="conversation-save-button"]',
    content: (
      <>
        <p>Save your transcript edits.</p>
        <p><br /></p>
        <small>Click "Done Editing" to continue.</small>
      </>
    ),
    placement: 'auto',
    spotlightClicks: true,
    meta: { requireAction: true },
  },
  {
    target: '[data-tour="confirm-transcript-button"]',
    content: (
      <>
        <p>Confirm the transcripts and continue to review defects.</p>
        <p><br /></p>
        <small>Click "Confirm & Continue to Defects" to continue.</small>
      </>
    ),
    placement: 'auto',
    spotlightClicks: true,
    meta: { requireAction: true },
  },
  {
    target: '[data-tour="defect-edit-field"]',
    content: (
      <>
        <h6>In this section, you can edit the details of the defects.</h6>
        <p>For this demo, we'll skip this optional step.</p>
        <p><br /></p>
        <small>Click "Next" to continue.</small>
      </>
    ),
    placement: 'auto',
    spotlightClicks: false,
    meta: { hideBack: true},
  },
  {
    target: '[data-tour="defect-add-photos"]',
    content: (
      <>
        <h6>You can add photos to document the defect here</h6>
        <p>For this demo, we'll skip this optional step.</p>
        <p><br /></p>
        <small>Click "Next" to continue.</small>
      </>
    ),
    placement: 'auto',
    spotlightClicks: false,
    meta: { hideBack: true},
  },
  {
    target: '[data-tour="remaining-defects"]',
    content: (
      <>
        <p>Repeat the same process for each defect.</p>
        <p>For this demo, we'll skip this optional step.</p>
        <p><br /></p>
        <small>Click "Next" to continue.</small>
      </>
    ),
    placement: 'top-start',
    spotlightClicks: false,
    meta: { hideBack: true, scrollToTop: true },
    disableScrolling: false,
  },
  {
    target: '[data-tour="include-raw-transcript-checkbox"]',
    content: (
      <>
        <p>Include the full raw transcript in the report if needed.</p>
        <p><br /></p>
        <small>Click "Next" to continue.</small>
      </>
    ),
    placement: 'auto',
    spotlightClicks: true,
    meta: { hideBack: true},
  },
  {
    target: '[data-tour="generate-report-button"]',
    content: (
      <>
        <p>Generate your report report once all defects are reviewed.</p>
        <p><br /></p>
        <small>Click "Generate Report" to continue.</small>
      </>
    ),
    placement: 'auto',
    spotlightClicks: true,
    meta: { requireAction: true },
  },
  
  // Desktop: end the tour at the download button
  // Mobile: show intro step then carousel for saving to OneDrive
  ...(isMobile
    ? [
        {
          target: '[data-tour="download-report-button"]',
          content: (
            <>
              Up next: we'll show you how to save your downloaded observation report to OneDrive.
              <p><br /></p>
              To follow along, make sure OneDrive and Microsoft Word are installed on your device and that you're signed in.
              <p><br /></p>
              Click "Next" to continue.
            </>
          ),
          placement: 'auto',
          meta: { requireAction: false, hideBack: true },
          spotlightClicks: false,
        },
        {
          target: 'body',
          placement: 'center',
          disableBeacon: true,
          spotlightClicks: false,
          content: (
            <>
              <DownloadAfterDownloadCarousel index={carouselIndex} isIPad={isIPad} />
            </>
          ),
          meta: { hideBack: true, isCarousel: true },
        },
      ]
    : [
        {
          target: '[data-tour="download-report-button"]',
          content: (
            <>
              <p>Your report is ready! Click "Download Report" to save the file to your computer.</p>
              <p><br /></p>
              <small>Click "Finish" to complete the demo.</small>
            </>
          ),
          placement: 'auto',
          meta: { requireAction: false, hideBack: true },
          spotlightClicks: true,
        },
      ]),
  ];
export function useDemoTour({
  setCurrentSection,
  setShowOptional,
  setInspectorName,
  setContractorName,
  setSiteAddress,
  setOtherContractors,
  setMainSiteImage,
  setAudioFile,
  setAudioPreviewUrl,
  mainSiteImage,
  audioFile,
  audioPreviewUrl,
}) {
  const [tourRun, setTourRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);
  
  // Detect mobile/tablet for showing carousel, and iPad for choosing which carousel
  const [isMobile, setIsMobile] = useState(false);
  const [isIPad, setIsIPad] = useState(false);
  useEffect(() => {
    setIsMobile(getIsMobileDevice());
    setIsIPad(getIsIPad());
  }, []);
  
  const carouselSlides = isIPad ? DOWNLOAD_CAROUSEL_SLIDES_IPAD : DOWNLOAD_CAROUSEL_SLIDES_IPHONE;
  const carouselTotal = carouselSlides.length;
  const carouselAtEnd = carouselIndex >= carouselTotal - 1;
  
  const onCarouselNext = useCallback(() => {
      setCarouselIndex(i => Math.min(carouselTotal - 1, i + 1));
    }, [carouselTotal]);

  const onCarouselPrev = useCallback(() => {
    setCarouselIndex(i => Math.max(0, i - 1));
  }, []);

  const tourSteps = useMemo(
    () => (tourRun ? getDemoSteps({ carouselIndex, setCarouselIndex, isIPad, isMobile }) : []),
    [tourRun, carouselIndex, isIPad, isMobile]
  );

  const startTour = useCallback(() => {
      setCarouselIndex(0);
      setStepIndex(0);
      setTourRun(true);
      setCurrentSection('basic');
      setShowOptional(false);
    }, [setCurrentSection, setShowOptional]);
  const endTour = useCallback(() => {
      setTourRun(false);
      setStepIndex(0);
      setCarouselIndex(0);
    }, []);
  const handleJoyrideCallback = useCallback(
      (data) => {
        const { status, type, index, action } = data;

        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
          endTour();
          return;
        }

        if (type === EVENTS.STEP_AFTER) {
          if (action === 'next') setStepIndex(index + 1);
          else if (action === 'prev') setStepIndex(Math.max(0, index - 1));
        }
        if (type === EVENTS.STEP_BEFORE) {
          const step = tourSteps[index];
          if (step?.meta?.isCarousel) {
            setCarouselIndex(0);
          }
          // Scroll to top of target element if meta.scrollToTop is set
          if (step?.meta?.scrollToTop && step?.target) {
            setTimeout(() => {
              const el = document.querySelector(step.target);
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Additional scroll up to make room for tooltip
                setTimeout(() => {
                  window.scrollBy({ top: -120, behavior: 'smooth' });
                }, 300);
              }
            }, 100);
          }
        }
      },
      [endTour, tourSteps]
    );

  const advanceTourIfAt = useCallback(
    async (currentSelector, nextSelector, timeoutMs = 2500) => {
      if (!tourRun) return;

      const current = tourSteps?.[stepIndex];
      if (!current || current.target !== currentSelector) return;

      // If we know what’s next, wait until it exists before advancing
      if (nextSelector) {
        try {
          await waitForElement(nextSelector, timeoutMs);
        } catch (e) {
          return;
        }
      }

      setStepIndex((i) => i + 1);
    },
    [tourRun, tourSteps, stepIndex]
  );

  useEffect(() => {
    if (!tourRun) return;
    if (stepIndex === 0) {
      setInspectorName(DEMO_FORM.inspectorName);
      setContractorName(DEMO_FORM.contractorName);
      setSiteAddress(DEMO_FORM.siteAddress);
      setOtherContractors(DEMO_FORM.otherContractors);
    } else {
    }
    switch (stepIndex) {
      case 2: {
        if (!mainSiteImage) {
          setMainSiteImage({
            name: 'Demo Site Photo (from files)',
            previewUrl: '/demo/placeholder.svg', // served directly by the app
            // Optional: mark so your remove logic can skip revokeObjectURL
            isStaticAsset: true,
          });
        }
        break;
      }
      case 3: {
        // Step 4: Audio demo
        if (!audioFile) {
          const demoAudio = createSilentWavFile(2, 44100);
          setAudioFile(demoAudio);
          // Preview
          if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
          setAudioPreviewUrl(demoAudio.previewUrl);
        }
        break;
      }
      case 8: {
        // Step 9: Switch to transcript section
        setCurrentSection('transcript');
        break;
      }
      default:
        break;
    }
  }, [tourRun, stepIndex, mainSiteImage, audioFile, audioPreviewUrl, setInspectorName, setContractorName, setSiteAddress, setOtherContractors, setMainSiteImage, setAudioFile, setAudioPreviewUrl, setCurrentSection]);
  
  return {
      tourRun,
      tourSteps,
      stepIndex,
      setStepIndex,
      advanceTourIfAt,
      startTour,
      handleJoyrideCallback,
      endTour,
      carouselIndex,
      carouselTotal,
      carouselAtEnd,
      onCarouselNext,
      onCarouselPrev,
    };
}

