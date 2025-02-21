/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      transitionProperty: {
        'width': 'width',
        'margin': 'margin',
      },
      width: {
        'sidebar-expanded': '16rem',
        'sidebar-collapsed': '4.5rem',
      },
      margin: {
        'sidebar-expanded': '16rem',
        'sidebar-collapsed': '4.5rem',
      }
    },
  },
  plugins: [],
}

