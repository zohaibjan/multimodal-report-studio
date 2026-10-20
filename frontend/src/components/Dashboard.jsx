// components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  ClipboardList, AlertTriangle, CheckCircle2, Layers, TrendingUp,
  SlidersHorizontal, X, ChevronDown, ChevronUp, RefreshCw, Eye,
  CalendarDays, MapPin, User, Building2,
} from 'lucide-react';
import axiosInstance from '../utils/axiosClient';

/* ── palette ──────────────────────────────────────────────────────────── */
const PIE_COLORS = [
  'hsl(217 91% 60%)', 'hsl(262 80% 65%)', 'hsl(188 80% 50%)',
  'hsl(346 77% 60%)', 'hsl(140 60% 50%)', 'hsl(36 90% 56%)',
  'hsl(280 65% 60%)', 'hsl(160 60% 45%)',
];

/* ── recharts custom tooltip ──────────────────────────────────────────── */
function DarkTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-xl">
      {label && <p className="text-muted-foreground mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

/* ── stat card ────────────────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, sub, accent = 'primary', delay = 0 }) {
  const accentCls = {
    primary: 'text-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)]',
    red:     'text-red-400 bg-red-500/10',
    green:   'text-emerald-400 bg-emerald-500/10',
    amber:   'text-amber-400 bg-amber-500/10',
    purple:  'text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.1)]',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glow-card rounded-xl bg-card p-5 flex items-center gap-4"
    >
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${accentCls[accent]}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground leading-tight">{value ?? '—'}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}

/* ── section heading ──────────────────────────────────────────────────── */
function SectionHeading({ children }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
      {children}
    </h2>
  );
}

/* ── filter panel ─────────────────────────────────────────────────────── */
function FilterPanel({ filters, setFilters, contractors, open, onToggle }) {
  const clear = () =>
    setFilters({ fromDate: '', toDate: '', compliance: 'all', contractor: 'all' });

  return (
    <div className="glow-card rounded-xl bg-card mb-6">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-sm font-medium text-foreground"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-[hsl(var(--primary))]" />
          Filters
        </span>
        {open ? <ChevronUp size={15} className="text-muted-foreground" /> : <ChevronDown size={15} className="text-muted-foreground" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-5 pb-5 border-t border-border pt-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">From date</label>
                <input
                  type="date"
                  value={filters.fromDate}
                  onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                  className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary)/0.5)]"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">To date</label>
                <input
                  type="date"
                  value={filters.toDate}
                  onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                  className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary)/0.5)]"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Compliance</label>
                <select
                  value={filters.compliance}
                  onChange={(e) => setFilters({ ...filters, compliance: e.target.value })}
                  className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary)/0.5)]"
                >
                  <option value="all">All</option>
                  <option value="compliant">Compliant</option>
                  <option value="non-compliant">Non-Compliant</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Contractor</label>
                <select
                  value={filters.contractor}
                  onChange={(e) => setFilters({ ...filters, contractor: e.target.value })}
                  className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary)/0.5)]"
                >
                  <option value="all">All Contractors</option>
                  {contractors.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="px-5 pb-4 flex justify-end">
              <button
                onClick={clear}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition"
              >
                <X size={11} /> Clear filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── inspection detail modal ──────────────────────────────────────────── */
function DetailModal({ inspection, defects, onClose }) {
  if (!inspection) return null;
  const compliant = inspection.IS_COMPLIANT;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl"
        >
          {/* Modal header */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-border bg-card">
            <h2 className="font-semibold text-foreground">Report Details</h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition p-1 rounded-lg hover:bg-secondary/60"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Meta grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: MapPin,       label: 'Site Address',  value: inspection.SITE_ADDRESS },
                { icon: CalendarDays, label: 'Date',          value: new Date(inspection.INSPECTION_DATE).toLocaleDateString('en-AU', { day: '2-digit', month: '2-digit', year: 'numeric' }) },
                { icon: User,         label: 'Reviewer',     value: inspection.INSPECTOR_NAME },
                { icon: Building2,    label: 'Contractor',    value: inspection.CONTRACTOR_NAME },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-lg border border-border bg-secondary/20 px-4 py-3">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
                    <Icon size={11} /> {label}
                  </p>
                  <p className="text-sm font-medium text-foreground">{value}</p>
                </div>
              ))}
            </div>

            {/* Status + defect count */}
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                compliant ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
              }`}>
                {compliant ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                {compliant ? 'Compliant' : 'Non-Compliant'}
              </span>
              <span className="text-xs text-muted-foreground">
                {inspection.TOTAL_DEFECTS_FOUND} defect{inspection.TOTAL_DEFECTS_FOUND !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Defects */}
            {defects && defects.length > 0 && (
              <div>
                <SectionHeading>Defects Found</SectionHeading>
                <div className="space-y-3">
                  {defects.map((d, i) => (
                    <div key={i} className="rounded-lg border border-border bg-secondary/20 p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-md bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] text-xs font-mono font-semibold">
                          {d.DEFECT_CODE}
                        </span>
                        <span className="text-xs text-muted-foreground">{d.DEFECT_CATEGORY}</span>
                      </div>
                      <p className="text-sm text-foreground mb-1">
                        <span className="text-muted-foreground">Found: </span>{d.DEFECT_FOUND}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Non-compliance: </span>{d.NON_COMPLIANCE}
                      </p>
                      {d.STANDARD_REFERENCE && (
                        <p className="text-xs text-muted-foreground/60 mt-1">
                          Standard: {d.STANDARD_REFERENCE}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transcript */}
            {inspection.TRANSCRIPT_TEXT && (
              <div>
                <SectionHeading>Transcript</SectionHeading>
                <div className="rounded-lg border border-border bg-secondary/20 p-4 max-h-48 overflow-y-auto">
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">
                    {inspection.TRANSCRIPT_TEXT}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ── main component ───────────────────────────────────────────────────── */
export default function Dashboard() {
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [metrics,      setMetrics]      = useState(null);
  const [inspections,  setInspections]  = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [defectCodes,  setDefectCodes]  = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [contractors,  setContractors]  = useState([]);
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [inspectionDefects,  setInspectionDefects]  = useState([]);
  const [filtersOpen,  setFiltersOpen]  = useState(false);

  const [filters, setFilters] = useState({
    fromDate: '', toDate: '', compliance: 'all', contractor: 'all',
  });

  useEffect(() => { fetchData(); }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.fromDate)                  params.append('from_date',  filters.fromDate);
      if (filters.toDate)                    params.append('to_date',    filters.toDate);
      if (filters.compliance !== 'all')      params.append('compliance', filters.compliance);
      if (filters.contractor !== 'all')      params.append('contractor', filters.contractor);

      const { data } = await axiosInstance.get(`/api/dashboard?${params}`, { timeout: 15000 });
      setMetrics(data.metrics);
      setInspections(data.inspections ?? []);
      setTimelineData(data.timeline ?? []);
      setDefectCodes(data.top_defects ?? []);
      setCategoryData(data.categories ?? []);
      setContractors(data.contractors ?? []);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err?.response?.data?.detail ?? err.message ?? 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const handleInspectionClick = async (inspection) => {
    setSelectedInspection(inspection);
    setInspectionDefects([]);
    try {
      const { data } = await axiosInstance.get(
        `/api/dashboard/inspection/${inspection.INSPECTION_ID}/defects`,
        { timeout: 10000 },
      );
      setInspectionDefects(data.defects ?? []);
    } catch (err) {
      console.error('Failed to fetch inspection defects:', err);
    }
  };

  /* ── loading ── */
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <div className="w-10 h-10 rounded-full border-2 border-[hsl(var(--primary))] border-t-transparent animate-spin" />
          <p className="text-sm">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  const compliantPct = metrics?.total_inspections
    ? Math.round((metrics.compliant / metrics.total_inspections) * 100)
    : 0;

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-dot-grid opacity-25 pointer-events-none" aria-hidden />
      <div className="pointer-events-none absolute rounded-full blur-3xl opacity-10 w-[500px] h-[500px] bg-[hsl(var(--primary))] -top-40 right-0" />
      <div className="pointer-events-none absolute rounded-full blur-3xl opacity-10 w-[400px] h-[400px] bg-[hsl(var(--accent))] bottom-0 left-0" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="shimmer-text">Dashboard</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Inspection analytics &amp; history</p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-muted-foreground text-sm hover:text-foreground hover:bg-secondary/50 transition disabled:opacity-40"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </motion.div>

        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-6"
            >
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span className="flex-1">{error}</span>
              <button onClick={() => setError(null)} className="hover:text-red-300">
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard icon={ClipboardList} label="Total Inspections"     value={metrics?.total_inspections ?? 0} accent="primary" delay={0}    />
          <StatCard icon={AlertTriangle} label="Non-Compliant"         value={metrics?.non_compliant ?? 0}     accent="red"     delay={0.06}  />
          <StatCard icon={CheckCircle2}  label="Compliant"             value={metrics?.compliant ?? 0}         accent="green"   delay={0.12} sub={`${compliantPct}% pass rate`} />
          <StatCard icon={Layers}        label="Total Defects"         value={metrics?.total_defects ?? 0}     accent="amber"   delay={0.18}  />
          <StatCard icon={TrendingUp}    label="Avg Defects/Inspection" value={(metrics?.avg_defects ?? 0).toFixed(1)} accent="purple" delay={0.24} />
        </div>

        {/* Filters */}
        <FilterPanel
          filters={filters}
          setFilters={setFilters}
          contractors={contractors}
          open={filtersOpen}
          onToggle={() => setFiltersOpen((v) => !v)}
        />

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glow-card rounded-xl bg-card p-6"
          >
            <SectionHeading>Inspections Over Time</SectionHeading>
            {timelineData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-16">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={[...timelineData].reverse()} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                  <Tooltip content={<DarkTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }} />
                  <Bar dataKey="inspections"  name="Total"         fill="hsl(var(--primary))"  radius={[4,4,0,0]} />
                  <Bar dataKey="non_compliant" name="Non-Compliant" fill="hsl(346 77% 55%)"     radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* Top defect codes */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glow-card rounded-xl bg-card p-6"
          >
            <SectionHeading>Top Defect Codes</SectionHeading>
            {defectCodes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-16">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={defectCodes} layout="vertical" barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                  <YAxis dataKey="code" type="category" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} width={60} />
                  <Tooltip content={<DarkTooltip />} />
                  <Bar dataKey="count" name="Occurrences" fill="hsl(var(--accent))" radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* Category pie — full width */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glow-card rounded-xl bg-card p-6 lg:col-span-2"
          >
            <SectionHeading>Defect Category Distribution</SectionHeading>
            {categoryData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-16">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={340}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%" cy="46%"
                    outerRadius={130}
                    dataKey="count"
                    nameKey="category"
                    labelLine={false}
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<DarkTooltip />} />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    formatter={(value) => <span style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* Category table */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glow-card rounded-xl bg-card p-6 lg:col-span-2"
          >
            <SectionHeading>Category Breakdown</SectionHeading>
            {categoryData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-16">No data</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Category</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground">Occurrences</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground">Inspections</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryData.map((cat, i) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                        <td className="py-2.5 px-3 text-foreground">{cat.category}</td>
                        <td className="py-2.5 px-3 text-right font-medium text-foreground">{cat.count}</td>
                        <td className="py-2.5 px-3 text-right text-muted-foreground">{cat.inspections}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>

        {/* Inspections table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glow-card rounded-xl bg-card p-6"
        >
          <SectionHeading>Recent Inspections</SectionHeading>
          {inspections.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
              <ClipboardList size={36} className="opacity-30" />
              <p className="text-sm">No inspections found for the selected filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {['ID', 'Date', 'Site Address', 'Inspector', 'Status', 'Defects', ''].map((h) => (
                      <th key={h} className={`py-2.5 px-3 text-xs font-semibold text-muted-foreground ${h === '' || h === 'Defects' || h === 'Status' ? 'text-center' : 'text-left'}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {inspections.map((ins, i) => (
                    <tr
                      key={i}
                      className="border-b border-border/40 hover:bg-secondary/30 transition-colors"
                    >
                      <td className="py-3 px-3 font-mono text-xs text-[hsl(var(--primary))]">
                        {ins.INSPECTION_ID}
                      </td>
                      <td className="py-3 px-3 text-muted-foreground whitespace-nowrap">
                        {new Date(ins.INSPECTION_DATE).toLocaleDateString('en-AU')}
                      </td>
                      <td className="py-3 px-3 text-foreground max-w-[200px] truncate">
                        {ins.SITE_ADDRESS}
                      </td>
                      <td className="py-3 px-3 text-muted-foreground whitespace-nowrap">
                        {ins.INSPECTOR_NAME}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          ins.IS_COMPLIANT
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-red-500/15 text-red-400'
                        }`}>
                          {ins.IS_COMPLIANT
                            ? <><CheckCircle2 size={10} /> Compliant</>
                            : <><AlertTriangle size={10} /> Non-Compliant</>
                          }
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-foreground">
                        {ins.TOTAL_DEFECTS_FOUND}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleInspectionClick(ins)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition"
                        >
                          <Eye size={12} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* Detail modal */}
      {selectedInspection && (
        <DetailModal
          inspection={selectedInspection}
          defects={inspectionDefects}
          onClose={() => { setSelectedInspection(null); setInspectionDefects([]); }}
        />
      )}
    </div>
  );
}
