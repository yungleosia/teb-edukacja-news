
import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic':
                    'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
            keyframes: {
                'deal-card': {
                    '0%': { transform: 'translateY(-100%) translateX(50%) scale(0.5)', opacity: '0' },
                    '100%': { transform: 'translateY(0) translateX(0) scale(1)', opacity: '1' },
                }
            },
            animation: {
                'deal-card': 'deal-card 0.5s ease-out backwards',
            }
        },
    },
    plugins: [],
};
export default config;
