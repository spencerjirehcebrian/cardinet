/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        reddit: {
          orange: "#FF4500",
          red: "#F54404",
          blue: "#0079D3",
          lightgray: "#F6F7F8",
          gray: "#DAE0E6",
          darkgray: "#1A1A1B",
        },
      },
    },
  },
  plugins: [],
};
