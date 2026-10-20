// components/InspectionForm.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  MapPin,
  Image,
  Mic,
  AlertTriangle,
  FileText,
  Upload,
  X,
  Plus,
  ChevronRight,
  ChevronLeft,
  Download,
  CheckCircle2,
  Loader2,
  Trash2,
  RotateCcw,
  RefreshCw,
} from "lucide-react";
import { uploadFilesConcurrently, withRetry } from "../utils/apiHelpers";
import axiosInstance, { initCsrf } from "../utils/axiosClient";
import ReportPreview from "./ReportPreview";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";

/* ── tiny helpers ─────────────────────────────────────────────────────── */

function GlowOrb({ className }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute rounded-full blur-3xl opacity-15 ${className}`}
    />
  );
}

function StepIndicator({ steps, current }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-10">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                  ${done ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] opacity-70" : ""}
                  ${active ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] ring-4 ring-[hsl(var(--primary)/0.25)]" : ""}
                  ${!done && !active ? "bg-secondary text-muted-foreground" : ""}
                `}
              >
                {done ? <CheckCircle2 size={14} /> : i + 1}
              </div>
              <span
                className={`text-xs hidden sm:block ${active ? "text-foreground font-medium" : "text-muted-foreground"}`}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-px w-8 sm:w-16 transition-all duration-500 ${i < current ? "bg-[hsl(var(--primary))]" : "bg-border"}`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function FieldLabel({ icon: Icon, children, required }) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
      <Icon size={14} className="text-[hsl(var(--primary))]" />
      {children}
      {required && <span className="text-red-400 text-xs ml-0.5">*</span>}
    </label>
  );
}

function ErrorBanner({ error, onDismiss }) {
  if (!error) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-6"
    >
      <AlertTriangle size={16} className="mt-0.5 shrink-0" />
      <span className="flex-1">{error}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="shrink-0 hover:text-red-300">
          <X size={14} />
        </button>
      )}
    </motion.div>
  );
}

function FileDropZone({ label, hint, accept, multiple, onFiles, icon: Icon = Upload }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) onFiles(files);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-all duration-200
        ${
          dragging
            ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)]"
            : "border-border bg-secondary/30 hover:border-[hsl(var(--primary)/0.5)] hover:bg-secondary/50"
        }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) onFiles(files);
          e.target.value = "";
        }}
      />
      <div className="w-10 h-10 rounded-full bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
        <Icon size={20} className="text-[hsl(var(--primary))]" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-1">{hint}</p>
      </div>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────────────── */

const STEPS = [
  { id: "details", label: "Details" },
  { id: "files",   label: "Files"   },
  { id: "defects", label: "Defects" },
  { id: "report",  label: "Report"  },
];

export default function InspectionForm() {
  /* ── Step ────────────────────────────────────────── */
  const [step, setStep] = useState(0);

  /* ── Form fields ─────────────────────────────────── */
  const [inspectorName,   setInspectorName]   = useState("");
  const [contractorName,  setContractorName]  = useState("");
  const [siteAddress,     setSiteAddress]     = useState("");

  /* ── Files ───────────────────────────────────────── */
  const [mainSiteImage,   setMainSiteImage]   = useState(null);
  const [audioFile,       setAudioFile]       = useState(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState(null);

  /* ── Defects ─────────────────────────────────────── */
  const [defects,    setDefects]    = useState([]);
  const [transcript, setTranscript] = useState("");
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);

  /* ── Report ──────────────────────────────────────── */
  const [reportReady,         setReportReady]         = useState(false);
  const [reportData,          setReportData]          = useState(null);
  const [stageFilesToCleanup, setStageFilesToCleanup] = useState([]);

  /* ── UI state ────────────────────────────────────── */
  const [isProcessing,    setIsProcessing]    = useState(false);
  const [error,           setError]           = useState(null);
  const [backendReady,    setBackendReady]    = useState(false);
  const [backendMsg,      setBackendMsg]      = useState("Checking backend…");
  const [checkingBackend, setCheckingBackend] = useState(true);

  /* ── Refs ────────────────────────────────────────── */
  const isProcessingAudioRef = useRef(false);
  const isGeneratingRef      = useRef(false);

  /* ── Backend health check ────────────────────────── */
  const checkBackend = useCallback(async (retry = 0, max = 3) => {
    setCheckingBackend(true);
    let stopChecking = true;
    try {
      const base = (API_BASE_URL ?? "").replace(/\/$/, "");
      const res = await axiosInstance.get(`${base}/health`, {
        timeout: retry === 0 ? 10000 : 8000,
      });
      if (res.data?.status === "healthy" || res.data?.status === "degraded") {
        setBackendReady(true);
        setBackendMsg("Backend ready.");
      } else {
        setBackendReady(false);
        setBackendMsg(res.data?.message ?? "Backend starting…");
      }
    } catch (err) {
      let msg = "Unable to reach backend.";
      if (err.code === "ECONNABORTED" || err.message?.includes("timeout"))
        msg = "Backend is taking longer than expected.";
      else if (!err.response) msg = "Cannot connect to backend service.";
      else if ((err.response?.status ?? 0) >= 500)
        msg = "Backend temporarily unavailable.";
      if (retry < max) {
        const delay = Math.min(1000 * 2 ** retry, 8000);
        setBackendMsg(
          `${msg} Retrying in ${delay / 1000}s… (${retry + 1}/${max})`,
        );
        stopChecking = false;
        setTimeout(() => checkBackend(retry + 1, max), delay);
        return;
      }
      setBackendReady(false);
      setBackendMsg(`${msg} Click retry.`);
    } finally {
      if (stopChecking) setCheckingBackend(false);
    }
  }, []);

  useEffect(() => {
    checkBackend();
    initCsrf().catch(() => {});
  }, [checkBackend]);

  /* ── URL cleanup on unmount ──────────────────────── */
  useEffect(() => {
    return () => {
      if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
      if (mainSiteImage?.previewUrl)
        URL.revokeObjectURL(mainSiteImage.previewUrl);
      defects.forEach((d) =>
        (d.photos ?? []).forEach((p) => {
          if (p.previewUrl) URL.revokeObjectURL(p.previewUrl);
        }),
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Step 0 → 1 validation ───────────────────────── */
  const handleDetailsNext = () => {
    if (!inspectorName.trim()) {
      setError("Inspector name is required.");
      return;
    }
    if (!contractorName.trim()) {
      setError("Contractor / builder name is required.");
      return;
    }
    if (!siteAddress.trim()) {
      setError("Site address is required.");
      return;
    }
    setError(null);
    setStep(1);
  };

  /* ── Step 1 → 2: upload + transcribe audio ────────── */
  const handleFilesNext = async () => {
    if (!mainSiteImage) {
      setError("Please upload a main site photo.");
      return;
    }
    if (!audioFile) {
      setError("Please upload an audio recording.");
      return;
    }
    if (isProcessingAudioRef.current || isProcessing) return;
    if (!backendReady) {
      setError("Backend is not ready yet. Please wait.");
      return;
    }

    isProcessingAudioRef.current = true;
    setError(null);
    setIsProcessing(true);

    try {
      // Upload audio
      const audioForm = new FormData();
      audioForm.append("audio_file", audioFile);
      const uploadRes = await withRetry(
        () =>
          axiosInstance.post("/api/upload-audio", audioForm, {
            timeout: 180000,
          }),
        2,
        1000,
      );
      const stageFilename = uploadRes.data.stage_filename;

      // Transcribe
      const transcribeForm = new FormData();
      transcribeForm.append("stage_filename", stageFilename);
      const transcribeRes = await axiosInstance.post(
        "/api/transcribe",
        transcribeForm,
        { timeout: 600000 },
      );

      setTranscript(transcribeRes.data.transcript ?? "");

      // Seed detected defects
      const detected = (transcribeRes.data.defects ?? []).map((d, idx) => ({
        ...d,
        id: `defect-${Date.now()}-${idx}`,
        photos: [],
      }));
      setDefects(detected);
      setStep(2);
    } catch (err) {
      let msg = "Error processing audio.";
      if (err.code === "ECONNABORTED" || err.message?.includes("timeout"))
        msg = "Request timed out. Please try again.";
      else if (!err.response) msg = "Network error. Check your connection.";
      else if ((err.response?.status ?? 0) >= 500)
        msg = "Server error. Please try again.";
      else {
        const d = err.response?.data?.detail;
        msg =
          typeof d === "object"
            ? (d?.message ?? JSON.stringify(d))
            : (d ?? err.message ?? msg);
      }
      setError(msg);
    } finally {
      setIsProcessing(false);
      isProcessingAudioRef.current = false;
    }
  };

  /* ── Defect helpers ──────────────────────────────── */
  const addDefect = () => {
    setDefects((prev) => [
      ...prev,
      {
        id: `defect-${Date.now()}`,
        defect_code: "",
        category: "",
        subcategory: "",
        standard: "",
        defect_found: "",
        non_compliance: "",
        evidence_quote: "",
        photos: [],
      },
    ]);
  };

  const updateDefect = (id, field, value) =>
    setDefects((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: value } : d)),
    );

  const removeDefect = (id) =>
    setDefects((prev) => prev.filter((d) => d.id !== id));

  const addDefectPhoto = (id, files) => {
    files.forEach((f) => {
      f.previewUrl = URL.createObjectURL(f);
    });
    setDefects((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, photos: [...(d.photos ?? []), ...files] } : d,
      ),
    );
  };

  const removeDefectPhoto = (defectId, photoIndex) => {
    setDefects((prev) =>
      prev.map((d) => {
        if (d.id !== defectId) return d;
        if (d.photos[photoIndex]?.previewUrl)
          URL.revokeObjectURL(d.photos[photoIndex].previewUrl);
        return { ...d, photos: d.photos.filter((_, i) => i !== photoIndex) };
      }),
    );
  };

  /* ── Step 2 → 3: generate report ────────────────── */
  const handleGenerateReport = async () => {
    if (isGeneratingRef.current || isProcessing) return;
    if (!backendReady) {
      setError("Backend is not ready yet.");
      return;
    }

    isGeneratingRef.current = true;
    setError(null);
    setIsProcessing(true);

    try {
      // Upload main site image
      let mainSiteStageFile = null;
      if (mainSiteImage) {
        const imgForm = new FormData();
        imgForm.append("image_file", mainSiteImage);
        const imgRes = await withRetry(
          () =>
            axiosInstance.post("/api/upload-image", imgForm, {
              timeout: 180000,
            }),
          2,
          1000,
        );
        mainSiteStageFile = imgRes.data.stage_filename;
      }

      // Upload defect photos and build payload
      const defectsWithStageFiles = [];
      for (const defect of defects) {
        const stageFiles =
          (defect.photos ?? []).length > 0
            ? await uploadFilesConcurrently(
                defect.photos,
                "/api/upload-image",
                "image_file",
                { concurrency: 2, timeout: 180000, additionalFields: {} },
              )
            : [];
        defectsWithStageFiles.push({
          defect_code:    defect.defect_code ?? defect.code ?? "",
          category:       defect.category ?? "",
          subcategory:    defect.subcategory ?? "",
          standard:       defect.standard ?? "",
          defect_found:   defect.defect_found ?? "",
          non_compliance: defect.non_compliance ?? "",
          evidence_quote: defect.evidence_quote ?? "",
          caption:        defect.defect_found ?? "",
          photos:         stageFiles,
        });
      }

      // Build report form
      const form = new FormData();
      form.append("inspector_name",        inspectorName);
      form.append("contractor_name",       contractorName);
      form.append("site_address",          siteAddress);
      form.append("other_contractors",     "N/A");
      form.append("inspection_date",       new Date().toISOString().split("T")[0]);
      form.append("transcript",            transcript);
      form.append("audio_filename",        audioFile?.name ?? "");
      form.append("is_compliant",          defects.length === 0 ? "true" : "false");
      form.append("include_raw_transcript","false");
      if (defectsWithStageFiles.length > 0) {
        form.append("defects_with_photos", JSON.stringify(defectsWithStageFiles));
      }
      if (mainSiteStageFile) form.append("main_site_image", mainSiteStageFile);

      // Collect stage files for cleanup
      const allStageFiles = [];
      if (mainSiteStageFile) allStageFiles.push(mainSiteStageFile);
      defectsWithStageFiles.forEach((d) =>
        allStageFiles.push(...(d.photos ?? [])),
      );

      const reportRes = await axiosInstance.post(
        "/api/generate-report-preview",
        form,
        { timeout: 600000 },
      );

      setReportData(reportRes.data);
      setReportReady(true);
      setStageFilesToCleanup(allStageFiles);
      setStep(3);
    } catch (err) {
      let msg = "Error generating report.";
      if (err.code === "ECONNABORTED" || err.message?.includes("timeout"))
        msg = "Request timed out.";
      else if (!err.response) msg = "Network error. Check your connection.";
      else if (err.response?.status === 403) msg = "Session expired. Refresh the page.";
      else if ((err.response?.status ?? 0) >= 500)
        msg = "Server error. Please try again.";
      else {
        const d = err.response?.data?.detail;
        msg =
          typeof d === "object"
            ? (d?.message ?? JSON.stringify(d))
            : (d ?? err.message ?? msg);
      }
      setError(msg);
    } finally {
      setIsProcessing(false);
      isGeneratingRef.current = false;
    }
  };

  /* ── Download ────────────────────────────────────── */
  const handleDownload = () => {
    if (!reportData) return;
    const url = window.URL.createObjectURL(new Blob([reportData]));
    const link = document.createElement("a");
    link.href = url;
    const ts   = new Date().toISOString().split("T")[0];
    const addr = siteAddress.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30);
    link.setAttribute("download", `inspection_${addr}_${ts}.docx`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);

    if (stageFilesToCleanup.length > 0) {
      const cleanup = new FormData();
      cleanup.append("filenames", JSON.stringify(stageFilesToCleanup));
      axiosInstance.post("/api/cleanup-files", cleanup).catch(() => {});
      setStageFilesToCleanup([]);
    }
  };

  /* ── Reset ───────────────────────────────────────── */
  const handleReset = () => {
    setInspectorName("");
    setContractorName("");
    setSiteAddress("");
    if (audioPreviewUrl) {
      URL.revokeObjectURL(audioPreviewUrl);
      setAudioPreviewUrl(null);
    }
    if (mainSiteImage?.previewUrl) URL.revokeObjectURL(mainSiteImage.previewUrl);
    defects.forEach((d) =>
      (d.photos ?? []).forEach((p) => {
        if (p.previewUrl) URL.revokeObjectURL(p.previewUrl);
      }),
    );
    setMainSiteImage(null);
    setAudioFile(null);
    setDefects([]);
    setTranscript("");
    setReportReady(false);
    setReportData(null);
    if (stageFilesToCleanup.length > 0) {
      const cleanup = new FormData();
      cleanup.append("filenames", JSON.stringify(stageFilesToCleanup));
      axiosInstance.post("/api/cleanup-files", cleanup).catch(() => {});
      setStageFilesToCleanup([]);
    }
    setError(null);
    setStep(0);
  };

  /* ── Render ──────────────────────────────────────── */
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-dot-grid opacity-30 pointer-events-none"
        aria-hidden
      />
      <GlowOrb className="w-[500px] h-[500px] bg-[hsl(var(--primary))] -top-32 -right-32" />
      <GlowOrb className="w-[400px] h-[400px] bg-[hsl(var(--accent))] bottom-0 left-0" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
            <span className="shimmer-text">New Report</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Follow the steps to generate your report report.
          </p>
        </motion.div>

        {/* Step indicator */}
        <StepIndicator steps={STEPS} current={step} />

        {/* Backend status */}
        {checkingBackend && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-xs text-muted-foreground justify-center mb-6"
          >
            <Loader2 size={12} className="animate-spin" />
            {backendMsg}
          </motion.div>
        )}
        {!checkingBackend && !backendReady && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs mb-6"
          >
            <span>
              <AlertTriangle size={12} className="inline mr-1" />
              {backendMsg}
            </span>
            <button
              onClick={() => checkBackend(0, 3)}
              className="flex items-center gap-1 text-yellow-300 hover:text-yellow-200"
            >
              <RefreshCw size={11} /> Retry
            </button>
          </motion.div>
        )}

        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <ErrorBanner error={error} onDismiss={() => setError(null)} />
          )}
        </AnimatePresence>

        {/* ── Step 0: Reviewer Details ───────────────── */}
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step-details"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3 }}
              className="glow-card rounded-xl bg-card p-6 sm:p-8"
            >
              <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                <User size={18} className="text-[hsl(var(--primary))]" />
                Reviewer Details
              </h2>

              <div className="space-y-5">
                <div>
                  <FieldLabel icon={User} required>
                    Reviewer Name
                  </FieldLabel>
                  <input
                    type="text"
                    value={inspectorName}
                    onChange={(e) => setInspectorName(e.target.value)}
                    placeholder="e.g. Jane Smith"
                    className="w-full rounded-lg border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.5)] transition"
                  />
                </div>

                <div>
                  <FieldLabel icon={User} required>
                    Builder / Supplier Name
                  </FieldLabel>
                  <input
                    type="text"
                    value={contractorName}
                    onChange={(e) => setContractorName(e.target.value)}
                    placeholder="e.g. Riverview Builders"
                    className="w-full rounded-lg border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.5)] transition"
                  />
                </div>

                <div>
                  <FieldLabel icon={MapPin} required>
                    Site Address
                  </FieldLabel>
                  <input
                    type="text"
                    value={siteAddress}
                    onChange={(e) => setSiteAddress(e.target.value)}
                    placeholder="e.g. 42 Builder St, Brisbane QLD 4000"
                    className="w-full rounded-lg border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.5)] transition"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <button
                  onClick={handleDetailsNext}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold text-sm hover:opacity-90 transition"
                >
                  Next: Upload Files <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 1: Upload Files ──────────────────── */}
          {step === 1 && (
            <motion.div
              key="step-files"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3 }}
              className="glow-card rounded-xl bg-card p-6 sm:p-8 space-y-8"
            >
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Upload size={18} className="text-[hsl(var(--primary))]" />
                Upload Files
              </h2>

              {/* Main site photo */}
              <div>
                <FieldLabel icon={Image} required>
                  Main Site Photo
                </FieldLabel>
                {mainSiteImage ? (
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-secondary/30">
                    <img
                      src={mainSiteImage.previewUrl}
                      alt="site preview"
                      className="w-16 h-16 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {mainSiteImage.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(mainSiteImage.size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        if (mainSiteImage.previewUrl)
                          URL.revokeObjectURL(mainSiteImage.previewUrl);
                        setMainSiteImage(null);
                      }}
                      className="text-muted-foreground hover:text-red-400 transition"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <FileDropZone
                    label="Drop or click to upload site photo"
                    hint="JPG, PNG, WEBP · max 10 MB"
                    accept="image/*"
                    icon={Image}
                    onFiles={(files) => {
                      const f = files[0];
                      f.previewUrl = URL.createObjectURL(f);
                      setMainSiteImage(f);
                    }}
                  />
                )}
              </div>

              {/* Audio recording */}
              <div>
                <FieldLabel icon={Mic} required>
                  Inspection Audio
                </FieldLabel>
                {audioFile ? (
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-secondary/30">
                    <div className="w-10 h-10 rounded-full bg-[hsl(var(--primary)/0.1)] flex items-center justify-center shrink-0">
                      <Mic size={16} className="text-[hsl(var(--primary))]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {audioFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(audioFile.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    </div>
                    {audioPreviewUrl && (
                      <audio
                        src={audioPreviewUrl}
                        controls
                        className="h-8 max-w-[140px]"
                      />
                    )}
                    <button
                      onClick={() => {
                        if (audioPreviewUrl) {
                          URL.revokeObjectURL(audioPreviewUrl);
                          setAudioPreviewUrl(null);
                        }
                        setAudioFile(null);
                      }}
                      className="text-muted-foreground hover:text-red-400 transition"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <FileDropZone
                    label="Drop or click to upload audio"
                    hint="MP3, WAV, M4A, MP4 · max 100 MB"
                    accept="audio/*,video/mp4"
                    icon={Mic}
                    onFiles={(files) => {
                      const f = files[0];
                      setAudioFile(f);
                      setAudioPreviewUrl(URL.createObjectURL(f));
                    }}
                  />
                )}
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => {
                    setError(null);
                    setStep(0);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-muted-foreground text-sm hover:text-foreground hover:bg-secondary/50 transition"
                >
                  <ChevronLeft size={15} /> Back
                </button>
                <button
                  onClick={handleFilesNext}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />{" "}
                      Transcribing…
                    </>
                  ) : (
                    <>
                      Process Audio <ChevronRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Defect Items ──────────────────── */}
          {step === 2 && (
            <motion.div
              key="step-defects"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Transcript card */}
              <div className="glow-card rounded-xl bg-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <FileText
                      size={15}
                      className="text-[hsl(var(--primary))]"
                    />
                    AI Transcript
                  </h3>
                  <button
                    onClick={() => setIsEditingTranscript((v) => !v)}
                    className="text-xs text-[hsl(var(--primary))] hover:opacity-80"
                  >
                    {isEditingTranscript ? "Done" : "Edit"}
                  </button>
                </div>
                {isEditingTranscript ? (
                  <textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    rows={6}
                    className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs text-foreground resize-y focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary)/0.5)]"
                  />
                ) : (
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4 whitespace-pre-wrap">
                    {transcript || (
                      <span className="italic">No transcript available.</span>
                    )}
                  </p>
                )}
              </div>

              {/* Defects list */}
              <div className="glow-card rounded-xl bg-card p-5 sm:p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <AlertTriangle
                      size={18}
                      className="text-[hsl(var(--primary))]"
                    />
                    Defect Items
                    <span className="ml-1 text-xs bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] px-2 py-0.5 rounded-full">
                      {defects.length}
                    </span>
                  </h2>
                  <button
                    onClick={addDefect}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[hsl(var(--primary)/0.4)] text-[hsl(var(--primary))] text-xs font-medium hover:bg-[hsl(var(--primary)/0.08)] transition"
                  >
                    <Plus size={13} /> Add Defect
                  </button>
                </div>

                {defects.length === 0 && (
                  <p className="text-sm text-muted-foreground italic text-center py-6">
                    No defects detected. Add items manually or proceed to
                    generate the report.
                  </p>
                )}

                <div className="space-y-4">
                  {defects.map((defect, idx) => (
                    <DefectCard
                      key={defect.id}
                      defect={defect}
                      index={idx}
                      onUpdate={updateDefect}
                      onRemove={removeDefect}
                      onAddPhoto={addDefectPhoto}
                      onRemovePhoto={removeDefectPhoto}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => {
                    setError(null);
                    setStep(1);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-muted-foreground text-sm hover:text-foreground hover:bg-secondary/50 transition"
                >
                  <ChevronLeft size={15} /> Back
                </button>
                <button
                  onClick={handleGenerateReport}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />{" "}
                      Generating…
                    </>
                  ) : (
                    <>
                      <FileText size={15} /> Generate Report{" "}
                      <ChevronRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Report Preview + Edit ──────────── */}
          {step === 3 && reportData && (
            <motion.div
              key="step-report"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <ReportPreview
                initialData={reportData}
                stageFilesToCleanup={stageFilesToCleanup}
                onReset={handleReset}
                siteAddress={siteAddress}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── DefectCard ───────────────────────────────────────────────────────── */

function DefectCard({ defect, index, onUpdate, onRemove, onAddPhoto, onRemovePhoto }) {
  const [expanded,   setExpanded]   = useState(true);
  const [previewIdx, setPreviewIdx] = useState(null);
  const photoInputRef = useRef(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-lg border border-border bg-secondary/20"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer select-none"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] text-xs font-bold flex items-center justify-center shrink-0">
            {index + 1}
          </span>
          <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
            {defect.defect_found || "Untitled Defect"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(defect.id);
            }}
            className="text-muted-foreground hover:text-red-400 transition p-1"
          >
            <Trash2 size={14} />
          </button>
          <ChevronRight
            size={14}
            className={`text-muted-foreground transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
          />
        </div>
      </div>

      {/* Body */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-border pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InlineField label="Defect Code" value={defect.defect_code} onChange={(v) => onUpdate(defect.id, "defect_code", v)} placeholder="e.g. SDR001" />
                <InlineField label="Category"    value={defect.category}    onChange={(v) => onUpdate(defect.id, "category", v)}    placeholder="e.g. Framing" />
                <InlineField label="Subcategory" value={defect.subcategory} onChange={(v) => onUpdate(defect.id, "subcategory", v)} placeholder="e.g. Roof Trusses" />
                <InlineField label="Standard"    value={defect.standard}    onChange={(v) => onUpdate(defect.id, "standard", v)}    placeholder="e.g. AS 4440:2004" />
              </div>
              <InlineTextarea label="Defect Found"     value={defect.defect_found}    onChange={(v) => onUpdate(defect.id, "defect_found", v)}    placeholder="Describe the defect…" />
              <InlineTextarea label="Non-Compliance"   value={defect.non_compliance}  onChange={(v) => onUpdate(defect.id, "non_compliance", v)}  placeholder="Why this is non-compliant…" />
              <InlineTextarea label="Evidence / Quote" value={defect.evidence_quote}  onChange={(v) => onUpdate(defect.id, "evidence_quote", v)}  placeholder="Quoted evidence from transcript…" />

              {/* Photos */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Photos ({(defect.photos ?? []).length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {(defect.photos ?? []).map((photo, pi) => (
                    <div key={pi} className="relative group">
                      <img
                        src={photo.previewUrl}
                        alt={`defect ${pi + 1}`}
                        className="w-16 h-16 rounded-lg object-cover cursor-pointer border border-border"
                        onClick={() =>
                          setPreviewIdx(pi === previewIdx ? null : pi)
                        }
                      />
                      <button
                        onClick={() => onRemovePhoto(defect.id, pi)}
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-background border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        <X size={10} className="text-red-400" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => photoInputRef.current?.click()}
                    className="w-16 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-[hsl(var(--primary)/0.5)] hover:text-[hsl(var(--primary))] transition"
                  >
                    <Plus size={16} />
                  </button>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files ?? []);
                      if (files.length) onAddPhoto(defect.id, files);
                      e.target.value = "";
                    }}
                  />
                </div>

                {/* Photo preview */}
                <AnimatePresence>
                  {previewIdx !== null && defect.photos?.[previewIdx] && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="mt-3"
                    >
                      <img
                        src={defect.photos[previewIdx].previewUrl}
                        alt="preview"
                        className="max-h-60 rounded-xl object-contain border border-border"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function InlineField({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1">
        {label}
      </label>
      <input
        type="text"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-border bg-background/40 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary)/0.4)] transition"
      />
    </div>
  );
}

function InlineTextarea({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1">
        {label}
      </label>
      <textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="w-full rounded-md border border-border bg-background/40 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 resize-y focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary)/0.4)] transition"
      />
    </div>
  );
}
