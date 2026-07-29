/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './screens/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#17130f',
        'surface-dim': '#17130f',
        'surface-container': '#231f1b',
        'surface-container-high': '#2e2925',
        'on-surface': '#eae1db',
        'on-surface-variant': '#d4c4b7',
        'outline-variant': '#50453b',
        primary: '#f2be8c',
        'on-primary': '#482904',
        secondary: '#bccbb1',
        tertiary: '#b0ccdb',
        error: '#ffb4ab',
        'error-container': '#93000a',
      },
      fontFamily: {
        heading: ['Literata_400Regular'],
        'heading-bold': ['Literata_700Bold'],
        body: ['SourceSans3_400Regular'],
        'body-semi': ['SourceSans3_600SemiBold'],
        'body-bold': ['SourceSans3_700Bold'],
        handwritten: ['Caveat_400Regular'],
      },
    },
  },
  plugins: [],
};
