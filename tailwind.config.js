import scrollbar from 'tailwind-scrollbar';

export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Adjust for your file structure
  ],
  theme: {
    extend: {
      maxWidth: {
        '7xl': '80vw',
        '8xl': '90vw',
      },
    },
  },
  plugins: [scrollbar],
};
