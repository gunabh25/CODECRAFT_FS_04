/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}', // adjust if your code is not inside /src
    './app/**/*.{js,ts,jsx,tsx}', // also for Next.js app dir
  ],
  theme: {
    extend: {
      colors: {
        border: '#E5E7EB', // light gray — now you can safely use `border-border`
        background: '#FFFFFF',
        ring: '#3B82F6', // example (Tailwind blue-500)
        // Add more tokens as needed
      },
    },
  },
  plugins: [
    require('tailwindcss-animate') // optional, only if you're using animation utilities
  ],
}
