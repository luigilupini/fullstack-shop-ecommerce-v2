/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        fluid: 'repeat(auto-fit, minmax(256px, 1fr))',
      },
      fontFamily: {
        lobster: ['var(--font-lobster)'],
        karla: ['var(--font-karla)'],
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      'light',
      'dark',
      'coffee',
      'forest',
      'halloween',
      'night',
      'bumblebee',
      'luxury',
      'business',
    ],
  },
};
