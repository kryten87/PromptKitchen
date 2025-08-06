/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8F9FA',
        'text-primary': '#1F2937',
        'text-secondary': '#6B7280',
        primary: '#3581b8', // for emphasis
        warning: '#db6c79', // for warnings
        'btn-subtle': '#eef6fd',
        'btn-subtle-hover': '#e6f5f9',
        'btn-success': '#effcef',
        border: '#E5E7EB',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
