// components/ReportPreview.jsx
// Inline-editable web preview of the inspection report.
// User can tweak any field, then download the final .docx.
import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  X,
  Plus,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  FileText,
  User,
  MapPin,
  Calendar,
  ClipboardList,
  Image,
  ZoomIn,
} from "lucide-react";
import axiosInstance from "../utils/axiosClient";

/* ─── tiny editable field ─────────────────────────────────────────────── */
function EditableField({ value, onChange, multiline = false, placeholder = "—", className = "" }) {
  const [editing, setEditing] = useState(false);

  const baseClass =
    "w-full bg-transparent focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary)/0.5)] rounded px-1 transition-all";

  if (multiline) {
    return editing ? (
      <textarea
        autoFocus
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
        className={`${baseClass} border border-border bg-secondary/40 px-2 py-1 text-sm resize-y ${className}`}
      />
    ) : (
      <p
        onClick={() => setEditing(true)}
        className={`cursor-text text-sm text-foreground/90 leading-relaxed hover:bg-secondary/30 rounded px-1 py-0.5 group flex gap-1 min-h-[1.5rem] ${className}`}
      >
        <span className="flex-1">{value || <span className="text-muted-foreground italic">{placeholder}</span>}</span>
        <Edit3 size={11} className="shrink-0 mt-1 opacity-0 group-hover:opacity-50 transition-opacity" />
      </p>
    );
  }

  return editing ? (
    <input
      autoFocus
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={() => setEditing(false)}
      className={`${baseClass} border border-border bg-secondary/40 px-2 py-0.5 text-sm ${className}`}
    />
  ) : (
    <span
      onClick={() => setEditing(true)}
      className={`cursor-text hover:bg-secondary/30 rounded px-1 py-0.5 group inline-flex items-center gap-1 ${className}`}
    >
      <span>{value || <span className="text-muted-foreground italic">{placeholder}</span>}</span>
      <Edit3 size={11} className="opacity-0 group-hover:opacity-50 transition-opacity" />
    </span>
  );
}

/* ─── photo lightbox ─────────────────────────────────────────────────── */
function Lightbox({ src, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <motion.img
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        src={src}
        alt="Photo"
        className="max-h-[90vh] max-w-full rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        className="absolute top-4 right-4 text-white bg-black/40 rounded-full p-1.5 hover:bg-black/70 transition"
        onClick={onClose}
      >
        <X size={18} />
      </button>
    </motion.div>
  );
}

/* ─── photo strip ─────────────────────────────────────────────────────── */
function PhotoStrip({ photos, label = "Photos" }) {
  const [lightbox, setLightbox] = useState(null);
  if (!photos || photos.length === 0) return null;
  return (
    <>
      <AnimatePresence>
        {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
      </AnimatePresence>
      <div>
        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
          <Image size={11} /> {label} ({photos.length})
        </p>
        <div className="flex flex-wrap gap-2">
          {photos.map((filename, i) => (
            <button
              key={i}
              onClick={() => setLightbox(`/api/stage-file/${filename}`)}
              className="relative group w-20 h-20 rounded-md overflow-hidden border border-border bg-secondary/30 flex-shrink-0"
              title="Click to enlarge"
            >
              <img
                src={`/api/stage-file/${filename}`}
                alt={`Photo ${i + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <ZoomIn size={14} className="text-white" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

/* ─── single defect card ─────────────────────────────────────────────── */
function DefectCard({ defect, index, onChange, onRemove }) {
  const [expanded, setExpanded] = useState(true);

  const set = (key) => (val) => onChange({ ...defect, [key]: val });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="border border-border rounded-lg overflow-hidden"
    >
      {/* header bar */}
      <div
        className="flex items-center gap-3 px-4 py-3 bg-secondary/30 cursor-pointer select-none"
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="text-xs font-bold text-[hsl(var(--primary))] w-6 shrink-0">
          {index + 1}
        </span>
        <span className="flex-1 text-sm font-medium text-foreground truncate">
          {defect.defect_found || "Untitled defect"}
        </span>
        <span className="text-xs text-muted-foreground font-mono bg-secondary px-2 py-0.5 rounded">
          {defect.defect_code || "—"}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="text-muted-foreground hover:text-red-400 transition-colors"
          title="Remove defect"
        >
          <Trash2 size={13} />
        </button>
        {expanded ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Defect Found</p>
                <EditableField value={defect.defect_found || ""} onChange={set("defect_found")} multiline placeholder="Describe what was found" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Defect Code</p>
                <EditableField value={defect.defect_code || ""} onChange={set("defect_code")} placeholder="e.g. D.1.1" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Category</p>
                <EditableField value={defect.category || ""} onChange={set("category")} placeholder="Category" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Standard</p>
                <EditableField value={defect.standard || ""} onChange={set("standard")} placeholder="e.g. AS 3500.3" />
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-muted-foreground mb-1">Non-Compliance</p>
                <EditableField value={defect.non_compliance || ""} onChange={set("non_compliance")} multiline placeholder="Explain the non-compliance" />
              </div>
              {defect.photos && defect.photos.length > 0 && (
                <div className="sm:col-span-2">
                  <PhotoStrip photos={defect.photos} label="Defect Photos" />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── main component ─────────────────────────────────────────────────── */
export default function ReportPreview({
  initialData,          // JSON returned by /api/generate-report-preview
  stageFilesToCleanup,  // array of stage filenames to clean after download
  onReset,              // callback to start a new inspection
}) {
  const [data, setData] = useState(initialData);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);
  const [downloaded, setDownloaded] = useState(false);

  const setField = useCallback(
    (key) => (val) => setData((d) => ({ ...d, [key]: val })),
    []
  );

  const updateDefect = useCallback((i, updated) => {
    setData((d) => {
      const defects = [...(d.defects || [])];
      defects[i] = updated;
      return { ...d, defects };
    });
  }, []);

  const removeDefect = useCallback((i) => {
    setData((d) => {
      const defects = (d.defects || []).filter((_, idx) => idx !== i);
      const isCompliant = defects.length === 0;
      return { ...d, defects, is_compliant: isCompliant };
    });
  }, []);

  const addDefect = useCallback(() => {
    setData((d) => ({
      ...d,
      is_compliant: false,
      defects: [
        ...(d.defects || []),
        { defect_code: "", category: "", subcategory: "", standard: "", defect_found: "", non_compliance: "", photos: [] },
      ],
    }));
  }, []);

  const handleDownload = async () => {
    setDownloadError(null);
    setDownloading(true);
    try {
      const res = await axiosInstance.post("/api/download-report", data, {
        responseType: "blob",
        timeout: 300000,
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      const ts   = new Date().toISOString().split("T")[0];
      const addr = (data.site_address || "report").replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30);
      link.setAttribute("download", `inspection_${addr}_${ts}.docx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      setDownloaded(true);

      // Cleanup stage files
      if (stageFilesToCleanup?.length) {
        const cleanup = new FormData();
        cleanup.append("filenames", JSON.stringify(stageFilesToCleanup));
        axiosInstance.post("/api/cleanup-files", cleanup).catch(() => {});
      }
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.message ||
        "Download failed. Please try again.";
      setDownloadError(typeof msg === "object" ? JSON.stringify(msg) : msg);
    } finally {
      setDownloading(false);
    }
  };

  const complianceColor = data.is_compliant
    ? "text-green-400 bg-green-400/10 border-green-400/30"
    : "text-red-400 bg-red-400/10 border-red-400/30";

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* ── page header ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-4 flex-wrap"
      >
        <div>
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <FileText size={18} className="text-[hsl(var(--primary))]" />
            Report Preview
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Click any field to edit it, then download your finalised report.
          </p>
        </div>

        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${complianceColor}`}>
          {data.is_compliant ? "✓ COMPLIANT" : "⚠ NON-COMPLIANT"}
        </span>
      </motion.div>

      {/* ── inspection details card ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glow-card rounded-xl bg-card p-5 sm:p-6 space-y-4"
      >
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Inspection Details
        </h3>

        {data.main_site_image && (
          <div className="mb-4 rounded-lg overflow-hidden border border-border bg-secondary/20">
            <PhotoStrip photos={[data.main_site_image]} label="Main Site Photo" />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <User size={11} /> Inspector
            </p>
            <EditableField
              value={data.inspector_name}
              onChange={setField("inspector_name")}
              placeholder="Inspector name"
              className="font-medium"
            />
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <User size={11} /> Builder / Contractor
            </p>
            <EditableField
              value={data.contractor_name}
              onChange={setField("contractor_name")}
              placeholder="Contractor name"
            />
          </div>
          <div className="sm:col-span-2">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <MapPin size={11} /> Site Address
            </p>
            <EditableField
              value={data.site_address}
              onChange={setField("site_address")}
              placeholder="Site address"
              className="font-medium"
            />
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Calendar size={11} /> Date
            </p>
            <span className="text-sm text-foreground/80">{data.inspection_date}</span>
          </div>
          {data.other_contractors && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Other Contractors</p>
              <EditableField
                value={data.other_contractors}
                onChange={setField("other_contractors")}
                placeholder="N/A"
              />
            </div>
          )}
        </div>
      </motion.div>

      {/* ── compliant summary / transcript ── */}
      {data.is_compliant && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glow-card rounded-xl bg-card p-5 sm:p-6 space-y-3"
        >
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Inspection Summary
          </h3>
          <EditableField
            value={data.compliant_summary || data.transcript || ""}
            onChange={setField("compliant_summary")}
            multiline
            placeholder="No summary — click to add notes."
          />
        </motion.div>
      )}

      {/* ── defects ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="glow-card rounded-xl bg-card p-5 sm:p-6 space-y-4"
      >
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <ClipboardList size={14} />
            Defect Items
            {(data.defects || []).length > 0 && (
              <span className="ml-1 text-xs font-bold text-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.12)] px-2 py-0.5 rounded-full">
                {data.defects.length}
              </span>
            )}
          </h3>
          <button
            onClick={addDefect}
            className="flex items-center gap-1.5 text-xs text-[hsl(var(--primary))] hover:text-[hsl(var(--primary)/0.8)] transition-colors"
          >
            <Plus size={13} /> Add defect
          </button>
        </div>

        {(data.defects || []).length === 0 ? (
          <p className="text-sm text-muted-foreground italic text-center py-6">
            No defects — site is compliant.
          </p>
        ) : (
          <AnimatePresence>
            <div className="space-y-3">
              {data.defects.map((defect, i) => (
                <DefectCard
                  key={i}
                  defect={defect}
                  index={i}
                  onChange={(updated) => updateDefect(i, updated)}
                  onRemove={() => removeDefect(i)}
                />
              ))}
            </div>
          </AnimatePresence>
        )}
      </motion.div>

      {/* ── error ── */}
      <AnimatePresence>
        {downloadError && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
          >
            <AlertTriangle size={15} className="shrink-0" />
            <span className="flex-1">{downloadError}</span>
            <button onClick={() => setDownloadError(null)}>
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── action buttons ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm
            bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]
            hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {downloading ? (
            <><Loader2 size={15} className="animate-spin" /> Generating…</>
          ) : downloaded ? (
            <><CheckCircle2 size={15} /> Download Again</>
          ) : (
            <><Download size={15} /> Download Report</>
          )}
        </button>

        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-medium
            border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30
            transition-all"
        >
          <RotateCcw size={14} /> New Inspection
        </button>
      </motion.div>

      {downloaded && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-xs text-green-400 flex items-center justify-center gap-1.5"
        >
          <CheckCircle2 size={12} /> Report downloaded successfully.
        </motion.p>
      )}
    </div>
  );
}
