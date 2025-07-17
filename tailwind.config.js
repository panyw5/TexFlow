/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/renderer/**/*.{js,ts,jsx,tsx}",
    "./src/renderer/index.html",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: [
          'SF Mono',
          'Monaco',
          'Inconsolata',
          'Roboto Mono',
          'Consolas',
          'Courier New',
          'monospace',
        ],
      },
      colors: {
        editor: {
          bg: '#27262F',
          text: '#d4d4d4',
          comment: '#6a9955',
          command: '#569cd6',
          math: '#dcdcaa',
          environment: '#c586c0',
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};
