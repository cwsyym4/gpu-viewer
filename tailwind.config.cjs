/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: { ground: "#0d180a", lime: "#7fee64", ink: "#d8f9d9" },
      fontFamily: { mono: ["SFMono-Regular","Cascadia Code","Consolas","Liberation Mono","monospace"] }
    },
  },
  plugins: [],
}
