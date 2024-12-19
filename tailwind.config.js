import quantumPlugin from '@nearform/quantum/tailwind-plugin'

export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [quantumPlugin],
  darkMode: 'class',
}
