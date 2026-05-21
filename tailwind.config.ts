import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#fafaf7',
          surface: '#ffffff',
          ink: '#1a1f2e',
          ink2: '#3d4658',
          muted: '#7a8494',
          line: '#e8eaed',
          line2: '#f0f1f3',
          primary: '#1f3a5f',
          primary2: '#2c5282',
          accent: '#b8915a',
          accent2: '#d4b478',
          green: '#10b981',
          'green-soft': '#d1fae5',
          red: '#ef4444',
          'red-soft': '#fee2e2',
          amber: '#f59e0b',
          'amber-soft': '#fef3c7',
          blue: '#3b82f6',
          'blue-soft': '#dbeafe',
          purple: '#8b5cf6',
          'purple-soft': '#ede9fe',
        },
      },
      fontFamily: {
        display: ["Georgia", "'Times New Roman'", "serif"],
        mono: ["ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
