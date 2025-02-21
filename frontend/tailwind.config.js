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
        'sidebar-expanded': '16rem',  // 256px
        'sidebar-collapsed': '4.5rem',   // 64px
      },
      margin: {
        'sidebar-expanded': '16rem',
        'sidebar-collapsed': '4.5rem',
      }
    },
  },
  plugins: [],
}

