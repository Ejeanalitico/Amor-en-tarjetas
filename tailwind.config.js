/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}", // Added components folder just in case it's in root
        "./**/*.{js,ts,jsx,tsx}" // Cover all bases
    ],
    theme: {
        extend: {
            colors: {
                'rarity-common': '#9ca3af', // gray-400
                'rarity-rare': '#3b82f6',   // blue-500
                'rarity-epic': '#a855f7',   // purple-500
                'rarity-legendary': '#eab308', // yellow-500
                'rarity-special': '#22c55e', // green-500
                'brand-dark': '#111827',
                'brand-light': '#f9fafb',
            },
            animation: {
                'throw-card': 'throw 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                throw: {
                    '0%': { transform: 'translateY(0) scale(1)', opacity: '1' },
                    '50%': { transform: 'translateY(-150px) scale(0.5)', opacity: '0.8' },
                    '100%': { transform: 'translateY(-300px) scale(0)', opacity: '0' },
                }
            }
        },
    },
    plugins: [],
}
