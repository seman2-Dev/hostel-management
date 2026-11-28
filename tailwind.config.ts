import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1rem", screens: { "2xl": "1360px" } },
    extend: {
      fontFamily: {
        sans: ["Inter", "Noto Sans Bengali", "system-ui", "sans-serif"],
        bangla: ["Noto Sans Bengali", "Hind Siliguri", "system-ui", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        success: { DEFAULT: "hsl(var(--success))", foreground: "hsl(var(--success-foreground))" },
        danger: { DEFAULT: "hsl(var(--danger))", foreground: "hsl(var(--danger-foreground))" },
        warning: { DEFAULT: "hsl(var(--warning))", foreground: "hsl(var(--warning-foreground))" },
        brass: { DEFAULT: "hsl(var(--brass))", foreground: "hsl(var(--brass-foreground))" },
      },
      borderRadius: { lg: "var(--radius)", md: "calc(var(--radius) - 2px)", sm: "calc(var(--radius) - 4px)" },
      boxShadow: {
        panel: "0 1px 2px hsl(229 42% 20% / 0.04), 0 18px 40px -22px hsl(243 75% 45% / 0.34)",
        lift: "0 2px 6px hsl(229 42% 20% / 0.06), 0 26px 56px -24px hsl(243 75% 45% / 0.42)",
        glow: "0 0 0 1px hsl(var(--primary) / 0.08), 0 24px 60px -28px hsl(var(--primary) / 0.45)",
      },
      backgroundImage: {
        "brand-mesh":
          "radial-gradient(70% 60% at 8% 0%, hsl(var(--primary) / 0.14) 0%, transparent 62%), radial-gradient(55% 50% at 100% 10%, hsl(var(--brass) / 0.14) 0%, transparent 60%)",
        aurora:
          "radial-gradient(55% 55% at 10% 20%, hsl(243 90% 65% / 0.28) 0%, transparent 60%), radial-gradient(45% 45% at 85% 15%, hsl(38 95% 60% / 0.20) 0%, transparent 60%), radial-gradient(50% 50% at 55% 100%, hsl(280 85% 65% / 0.16) 0%, transparent 60%)",
        "dot-grid": "radial-gradient(hsl(var(--border) / 0.7) 1px, transparent 1px)",
        "fine-grid":
          "linear-gradient(to right, hsl(var(--border) / 0.45) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border) / 0.45) 1px, transparent 1px)",
      },
      backgroundSize: { grid: "36px 36px", dots: "22px 22px" },
      keyframes: {
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        "fade-up": { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        float: {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-14px) scale(1.02)" },
        },
        shine: {
          "0%, 55%": { transform: "translateX(-120%)" },
          "80%, 100%": { transform: "translateX(120%)" },
        },
      },
      animation: {
        marquee: "marquee var(--marquee-duration, 40s) linear infinite",
        "fade-up": "fade-up 0.4s ease-out both",
        float: "float 9s ease-in-out infinite",
        shine: "shine 6s ease-in-out infinite",
      },
    },
  },
  plugins: [animate],
};

export default config;
