import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        lion: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
        forest: {
          50: '#f2faf5',
          100: '#dff2e4',
          200: '#c0e4cb',
          300: '#8dcea1',
          400: '#56af75',
          500: '#368e58',
          600: '#286f46',
          700: '#21593a',
          800: '#1d4730',
          900: '#183a29',
        },
        ink: '#0f172a',
        mist: '#e2e8f0',
        royal: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        navy: {
          800: '#1e2a4a',
          900: '#141e36',
          950: '#0d1526',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"IBM Plex Sans"', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 14px rgba(15, 23, 42, 0.06)',
        'soft-dark': '0 6px 18px rgba(2, 6, 23, 0.22)',
      },
      backgroundImage: {
        'hero-glow':
          'radial-gradient(circle at top left, rgba(250,204,21,0.24), transparent 28%), radial-gradient(circle at bottom right, rgba(125,211,192,0.22), transparent 32%), linear-gradient(180deg, rgba(255,251,235,0.95) 0%, rgba(248,250,252,0.98) 45%, rgba(240,249,255,0.92) 100%)',
        'hero-glow-dark':
          'radial-gradient(circle at top left, rgba(109,40,217,0.22), transparent 34%), radial-gradient(circle at bottom right, rgba(250,204,21,0.12), transparent 30%)',
      },
    },
  },
  plugins: [],
} satisfies Config;
