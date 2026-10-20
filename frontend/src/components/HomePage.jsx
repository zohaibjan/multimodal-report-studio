import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, Brain, FileText, ChevronRight, Zap, Shield, BarChart3 } from 'lucide-react';

/* ── Tiny reusable primitives ────────────────────────────────────────────── */

function GlowOrb({ className }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute rounded-full blur-3xl opacity-20 ${className}`}
    />
  );
}

function BentoCard({ icon: Icon, title, description, accent = 'blue', delay = 0 }) {
  const accentMap = {
    blue:   'text-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)]',
    purple: 'text-[hsl(var(--accent))]  bg-[hsl(var(--accent)/0.1)]',
    cyan:   'text-studio-cyan              bg-cyan-500/10',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="glow-card group relative flex flex-col gap-4 rounded-xl bg-card p-6 hover:bg-card/80 transition-colors"
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accentMap[accent]}`}>
        <Icon size={20} />
      </div>
      <div>
        <h3 className="font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

function StatBadge({ value, label }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-2xl font-bold text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden">

      {/* Background grid + glow orbs */}
      <div className="absolute inset-0 bg-dot-grid opacity-40 pointer-events-none" aria-hidden />
      <GlowOrb className="w-[600px] h-[600px] bg-[hsl(var(--primary))] -top-40 -left-40" />
      <GlowOrb className="w-[400px] h-[400px] bg-[hsl(var(--accent))]  top-1/3  right-0" />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">

        {/* Pill badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/60 bg-secondary/50 text-xs text-muted-foreground mb-8"
        >
          <Zap size={11} className="text-[hsl(var(--primary))]" />
          Powered by local Whisper + GPT-4o
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
        >
          <span className="shimmer-text">Multimodal</span>
          <br />
          <span className="text-foreground">Report Studio</span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="max-w-xl mx-auto text-lg text-muted-foreground mb-10 leading-relaxed"
        >
          Record your site walkthrough. AI transcribes, suggests observations, and
          generates a draft report for your review.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <button
            onClick={() => navigate('/inspection/new')}
            className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold text-sm overflow-hidden transition-all hover:opacity-90 hover:shadow-lg hover:shadow-[hsl(var(--primary)/0.3)]"
          >
            <span
              aria-hidden
              className="absolute inset-0 -translate-x-full bg-white/20 skew-x-12 group-hover:translate-x-full transition-transform duration-700"
            />
            <Mic size={16} />
            Start New Report
            <ChevronRight size={14} className="opacity-70" />
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-border bg-secondary/40 text-foreground font-semibold text-sm hover:bg-secondary/80 transition-colors"
          >
            <BarChart3 size={16} />
            View Dashboard
          </button>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-16 flex justify-center gap-12 divide-x divide-border"
        >
          <StatBadge value="100%" label="Free transcription" />
          <div className="pl-12"><StatBadge value="≤30s"  label="Report generation" /></div>
          <div className="pl-12"><StatBadge value="Local" label="Runs on-device"    /></div>
        </motion.div>
      </section>

      {/* ── Bento feature grid ────────────────────────────────────────────── */}
      <section className="relative max-w-7xl mx-auto px-6 pb-24">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-10"
        >
          How it works
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <BentoCard
            icon={Mic}
            title="Free Audio Transcription"
            description="Upload or record site audio. Local Whisper transcribes it entirely on-device — zero API cost, works offline."
            accent="blue"
            delay={0.3}
          />
          <BentoCard
            icon={Brain}
            title="AI Defect Detection"
            description="GPT-4o analyses the transcript, maps findings to standard defect codes, and extracts structured data automatically."
            accent="purple"
            delay={0.38}
          />
          <BentoCard
            icon={FileText}
            title="Professional Reports"
            description="One click generates a complete Word report with photos, defect codes, review conversations, and reviewer notes."
            accent="cyan"
            delay={0.46}
          />
          <BentoCard
            icon={Shield}
            title="Local Storage, Optional Cloud AI"
            description="Uploads and reports are stored locally. Transcripts and selected images may be sent to OpenAI; configure service access and retention for your use."
            accent="purple"
            delay={0.54}
          />
          <BentoCard
            icon={Zap}
            title="On-Device Whisper"
            description="Choose your Whisper model size — from tiny (fast) to large-v3 (accurate). No OpenAI Whisper API fees ever."
            accent="blue"
            delay={0.62}
          />
          <BentoCard
            icon={BarChart3}
            title="Report Dashboard"
            description="Browse past reports, review observations, and re-download reports from a clean searchable dashboard."
            accent="cyan"
            delay={0.7}
          />
        </div>
      </section>
    </div>
  );
}

