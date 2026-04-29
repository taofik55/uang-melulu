import type { Config } from "tailwindcss"
import tailwindcssAnimate from "tailwindcss-animate"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        card: "hsl(var(--background-card))",
        "card-foreground": "hsl(var(--foreground))",

        muted: "hsl(var(--background-subtle))",
        "muted-foreground": "hsl(var(--foreground-muted))",

        border: "hsl(var(--border))",
        input: "hsl(var(--border))",
        ring: "hsl(var(--primary))",

        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        "accent-amber": "hsl(var(--accent-amber))",
        "accent-red": "hsl(var(--accent-red))",
        "accent-green": "hsl(var(--accent-green))",
      },
    },
  },
  plugins: [tailwindcssAnimate],
}

export default config

