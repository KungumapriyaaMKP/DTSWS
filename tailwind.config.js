/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#040507',
        charcoal: '#0B0D12',
        obsidian: '#12151E',
        csk: {
          yellow: '#F9CD05',
          amber: '#E5A900',
        },
        gold: {
          champagne: '#E5C778',
          metallic: '#D4AF37',
          deep: '#8A6D29',
        },
        warm: {
          white: '#F4EFE6',
          muted: '#9E998F',
        },
      },
      fontFamily: {
        display: ['"Cinzel"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      letterSpacing: {
        monument: '0.28em',
        editorial: '0.16em',
        tightDisplay: '-0.025em',
      },
    },
  },
  plugins: [],
};
