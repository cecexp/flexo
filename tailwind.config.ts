import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          DEFAULT: '#00FF88',
          dim:    '#00CC6A',
          muted:  'rgba(0,255,136,0.10)',
          border: 'rgba(0,255,136,0.25)',
        },
        fluxo: {
          /* backgrounds */
          bg:  'var(--bg)',
          bg2: 'var(--bg2)',
          bg3: 'var(--bg3)',
          bg4: 'var(--bg4)',
          /* text */
          txt:  'var(--txt)',
          txt2: 'var(--txt2)',
          txt3: 'var(--txt3)',
          /* borders */
          border:  'var(--border)',
          border2: 'var(--border2)',
          /* semantic */
          amber: 'var(--amber)',
          red:   'var(--red)',
          blue:  'var(--blue)',
        },
      },
      borderColor: {
        neon: 'rgba(0,255,136,0.25)',
      },
    },
  },
  plugins: [],
}

export default config