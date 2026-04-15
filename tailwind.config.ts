import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        blue: {
          50: "hsl(var(--blue-50))",
          100: "hsl(var(--blue-100))",
          200: "hsl(var(--blue-200))",
          300: "hsl(var(--blue-300))",
          400: "hsl(var(--blue-400))",
          500: "hsl(var(--blue-500))",
          600: "hsl(var(--blue-600))",
          700: "hsl(var(--blue-700))",
          800: "hsl(var(--blue-800))",
          900: "hsl(var(--blue-900))",
        },
        yellow: {
          50: "hsl(var(--yellow-50))",
          100: "hsl(var(--yellow-100))",
          200: "hsl(var(--yellow-200))",
          300: "hsl(var(--yellow-300))",
          400: "hsl(var(--yellow-400))",
          500: "hsl(var(--yellow-500))",
          600: "hsl(var(--yellow-600))",
          700: "hsl(var(--yellow-700))",
          800: "hsl(var(--yellow-800))",
          900: "hsl(var(--yellow-900))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
        "3xl": "calc(var(--radius) + 12px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "pulse-blue": {
          "0%, 100%": { 
            boxShadow: "0 0 20px hsl(217 91% 60% / 0.3), 0 0 40px hsl(217 91% 60% / 0.15)" 
          },
          "50%": { 
            boxShadow: "0 0 30px hsl(217 91% 60% / 0.5), 0 0 60px hsl(217 91% 60% / 0.25)" 
          },
        },
        "glow-blue": {
          "0%, 100%": { filter: "brightness(1) drop-shadow(0 0 10px hsl(217 91% 60% / 0.4))" },
          "50%": { filter: "brightness(1.1) drop-shadow(0 0 20px hsl(217 91% 60% / 0.6))" },
        },
        "glow-yellow": {
          "0%, 100%": { filter: "brightness(1) drop-shadow(0 0 10px hsl(45 93% 54% / 0.4))" },
          "50%": { filter: "brightness(1.1) drop-shadow(0 0 20px hsl(45 93% 54% / 0.6))" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          from: { opacity: "0", transform: "translateX(-20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float": "float 6s ease-in-out infinite",
        "pulse-blue": "pulse-blue 2s ease-in-out infinite",
        "glow-blue": "glow-blue 3s ease-in-out infinite",
        "glow-yellow": "glow-yellow 3s ease-in-out infinite",
        "slide-up": "slide-up 0.6s ease-out forwards",
        "slide-in": "slide-in 0.5s ease-out forwards",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "scale-in": "scale-in 0.4s ease-out forwards",
        "gradient": "gradient-shift 8s ease infinite",
        "shimmer": "shimmer 2s infinite",
        "spin-slow": "spin-slow 20s linear infinite",
        "bounce-subtle": "bounce-subtle 2s ease-in-out infinite",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, hsl(217 91% 60%), hsl(221 83% 53%))",
        "gradient-accent": "linear-gradient(135deg, hsl(45 93% 54%), hsl(42 87% 48%))",
        "gradient-hero": "linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(220 14% 98%) 50%, hsl(0 0% 100%) 100%)",
        "gradient-card": "linear-gradient(145deg, hsl(0 0% 100%), hsl(220 14% 98%))",
        "gradient-glow": "linear-gradient(135deg, hsl(217 91% 60% / 0.1), hsl(45 93% 54% / 0.1))",
        "gradient-mesh": "radial-gradient(at 40% 20%, hsl(217 91% 60% / 0.1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsl(45 93% 54% / 0.08) 0px, transparent 50%), radial-gradient(at 0% 50%, hsl(217 91% 60% / 0.06) 0px, transparent 50%)",
        "blue-yellow-gradient": "linear-gradient(135deg, hsl(217 91% 60%), hsl(45 93% 54%))",
      },
      boxShadow: {
        "blue": "0 4px 20px hsl(217 91% 60% / 0.15), 0 8px 40px hsl(217 91% 60% / 0.1)",
        "blue-lg": "0 8px 30px hsl(217 91% 60% / 0.2), 0 16px 60px hsl(217 91% 60% / 0.15)",
        "yellow": "0 4px 20px hsl(45 93% 54% / 0.2), 0 8px 40px hsl(45 93% 54% / 0.15)",
        "yellow-lg": "0 8px 30px hsl(45 93% 54% / 0.25), 0 16px 60px hsl(45 93% 54% / 0.2)",
        "card": "0 4px 20px hsl(220 20% 0% / 0.08), 0 8px 40px hsl(220 20% 0% / 0.04)",
        "elevated": "0 25px 50px -12px hsl(220 20% 0% / 0.15)",
        "glass": "0 8px 32px hsl(220 20% 0% / 0.1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
export default config
