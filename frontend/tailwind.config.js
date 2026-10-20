/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Shadcn/ui CSS-variable tokens ─────────────────────────────
        background:     'hsl(var(--background))',
        foreground:     'hsl(var(--foreground))',
        card:           { DEFAULT: 'hsl(var(--card))',            foreground: 'hsl(var(--card-foreground))' },
        popover:        { DEFAULT: 'hsl(var(--popover))',         foreground: 'hsl(var(--popover-foreground))' },
        primary:        { DEFAULT: 'hsl(var(--primary))',         foreground: 'hsl(var(--primary-foreground))' },
        secondary:      { DEFAULT: 'hsl(var(--secondary))',       foreground: 'hsl(var(--secondary-foreground))' },
        muted:          { DEFAULT: 'hsl(var(--muted))',           foreground: 'hsl(var(--muted-foreground))' },
        accent:         { DEFAULT: 'hsl(var(--accent))',          foreground: 'hsl(var(--accent-foreground))' },
        destructive:    { DEFAULT: 'hsl(var(--destructive))',     foreground: 'hsl(var(--destructive-foreground))' },
        border:         'hsl(var(--border))',
        input:          'hsl(var(--input))',
        ring:           'hsl(var(--ring))',
        // ── Studio colour shortcuts ────────────────────────────────────────
        'studio-blue':     '#3B82F6',   // bright blue accent
        'studio-cyan':     '#06B6D4',   // magic-UI glow teal
        'studio-purple':   '#8B5CF6',   // secondary accent
        'studio-surface':  '#0F172A',   // main dark surface (slate-900)
        'studio-surface2': '#1E293B',   // card surface (slate-800)
        'studio-surface3': '#334155',   // hover / border (slate-700)
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans:  ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono:  ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      // ── Magic UI animation tokens ──────────────────────────────────
      animation: {
        'shimmer':        'shimmer 2.5s linear infinite',
        'glow-pulse':     'glow-pulse 3s ease-in-out infinite',
        'beam':           'beam 3s linear infinite',
        'fade-in':        'fade-in 0.4s ease-out',
        'slide-up':       'slide-up 0.4s ease-out',
        'border-beam':    'border-beam 4s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.6', filter: 'blur(8px)' },
          '50%':      { opacity: '1',   filter: 'blur(12px)' },
        },
        beam: {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'border-beam': {
          '0%':   { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '200% 0%' },
        },
      },
      backgroundImage: {
        'grid-dark': 'linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
    },
  },
  plugins: [],
}

