/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Manrope', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        // Dark navy/indigo scale — sidebar, headings, high-contrast text.
        // Kept under the existing `ink` name so every page already using
        // ink-600/700/800/900/950 picks up the new palette automatically.
        ink: {
          50: '#F5F6FA',
          100: '#E7E9F2',
          200: '#CBCFE2',
          300: '#A6ACC9',
          400: '#7A82AD',
          500: '#565F8C',
          600: '#39406B',
          700: '#262B4D',
          800: '#1B1F3B',
          900: '#12152B',
          950: '#0B0D1C',
        },
        // Primary — Indigo/Violet. Kept under the existing `brand` name so
        // every page already using brand-50..900 repaints automatically.
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        // Secondary accent — Cyan.
        secondary: {
          50: '#ECFEFF',
          100: '#CFFAFE',
          200: '#A5F3FC',
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#06B6D4',
          600: '#0891B2',
          700: '#0E7490',
          800: '#155E75',
          900: '#164E63',
        },
        // Semantic status colors — additive aliases. Tailwind's default
        // emerald/amber/rose/slate scales remain available and unchanged,
        // so every existing bg-emerald-50 / text-rose-600 / etc. used in
        // pages today keeps working exactly as before.
        success: {
          50: '#ECFDF5', 100: '#D1FAE5', 200: '#A7F3D0', 300: '#6EE7B7', 400: '#34D399',
          500: '#10B981', 600: '#059669', 700: '#047857', 800: '#065F46', 900: '#064E3B',
        },
        warning: {
          50: '#FFFBEB', 100: '#FEF3C7', 200: '#FDE68A', 300: '#FCD34D', 400: '#F5A524',
          500: '#E8930B', 600: '#D97706', 700: '#B45309', 800: '#92400E', 900: '#78350F',
        },
        danger: {
          50: '#FFF1F2', 100: '#FFE4E6', 200: '#FECDD3', 300: '#FDA4AF', 400: '#FB7185',
          500: '#F43F5E', 600: '#E11D48', 700: '#BE123C', 800: '#9F1239', 900: '#881337',
        },
        // amber kept as a direct override too, since a couple of existing
        // pages reference amber-400/500 explicitly for the readiness bar.
        amber: {
          400: '#F5A524',
          500: '#E8930B',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(17, 21, 43, 0.06), 0 1px 1px rgba(17, 21, 43, 0.04)',
        'card-hover': '0 12px 24px -8px rgba(49, 46, 129, 0.18), 0 4px 8px -2px rgba(17, 21, 43, 0.06)',
        soft: '0 1px 2px rgba(17, 21, 43, 0.04)',
        glow: '0 8px 20px -4px rgba(99, 102, 241, 0.45)',
        'glow-sm': '0 4px 12px -2px rgba(99, 102, 241, 0.35)',
        'inner-top': 'inset 0 1px 0 0 rgba(255,255,255,0.06)',
      },
      backgroundImage: {
        'gradient-sidebar': 'linear-gradient(180deg, #12152B 0%, #0B0D1C 100%)',
        'gradient-brand': 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
        'gradient-brand-soft': 'linear-gradient(135deg, #EEF2FF 0%, #ECFEFF 100%)',
        'gradient-mesh': 'radial-gradient(at top left, rgba(99,102,241,0.10), transparent 55%), radial-gradient(at bottom right, rgba(6,182,212,0.08), transparent 55%)',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0, transform: 'translateY(4px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        scaleIn: { '0%': { opacity: 0, transform: 'scale(0.96)' }, '100%': { opacity: 1, transform: 'scale(1)' } },
        shimmer: { '0%': { backgroundPosition: '-400px 0' }, '100%': { backgroundPosition: '400px 0' } },
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'scale-in': 'scaleIn 0.15s ease-out',
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
};
