/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'beach-primary': '#f59e0b',
                'beach-secondary': '#d97706',
                'indoor-primary': '#3b82f6',
                'indoor-secondary': '#2563eb',
                'bg-darker': '#050505',
                'bg-dark': '#0a0a0a',
                'bg-surface': '#1a1a1a',
                'bg-hover': '#2a2a2a',
                'text-primary': '#ffffff',
                'text-secondary': '#a1a1aa',
                'text-muted': '#71717a',
                'border-subtle': '#333333',
            }
        },
    },
    plugins: [],
}
