/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'hsl(var(--color-primary))',
        'primary-foreground': 'hsl(var(--color-primary-foreground))',
        surface: 'hsl(var(--color-surface))',
        background: 'hsl(var(--color-background))',
        foreground: 'hsl(var(--color-foreground))',
        'muted-foreground': 'hsl(var(--color-muted-foreground))',
        secondary: 'hsl(var(--color-secondary))',
        'secondary-foreground': 'hsl(var(--color-secondary-foreground))',
        border: 'hsl(var(--color-border))',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
