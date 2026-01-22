module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        app: "#FAF7F0",
        card: "#FFFFFF",
        surface: "#FFF9ED",
        muted: "#F3F4F6",

        ink: "#1F2937",
        ink2: "#4B5563",
        ink3: "#6B7280",

        line: "#E7E2D6",
        line2: "#EFEADF",

        accent: "#F4C430",
        accent2: "#FFB600",
        accentHover: "#EAB308",
      },
      boxShadow: {
        soft: "0 12px 30px -20px rgba(15, 23, 42, 0.25)",
        lift: "0 18px 45px -25px rgba(15, 23, 42, 0.35)",
      },
    },
  },
  plugins: [],
};
