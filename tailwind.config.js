/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./templates/**/*.html", // Flask templates folder
    "./static/js/**/*.js",   // Optional: Include custom JS if needed
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
};