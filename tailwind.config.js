import scrollbar from "tailwind-scrollbar";

export default {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
      maxWidth: {
        "7xl": "80rem",
        "8xl": "88rem",
        "9xl": "100rem",
      },
    },
  },
  plugins: [scrollbar],
};
