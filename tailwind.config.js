/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#0B4A3A',
          dark: '#073328',
          deeper: '#04211A',
          surface: '#0E5E4A',
          light: '#13705A',
          gold: '#C8A24B',
          'gold-light': '#DFC17B',
          'gold-dark': '#A98433',
          bg: '#F5F6F8',
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans Arabic"', 'system-ui', '-apple-system', 'Segoe UI', 'Tahoma', 'sans-serif'],
      },
      /* IBM Plex Sans Arabic أقصاه 700 — السلّم ده بيخفّف التقل ويحافظ على تدرّج واضح */
      fontWeight: {
        medium: '500',
        semibold: '500',
        bold: '600',
        extrabold: '700',
        black: '700',
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px -8px rgba(11, 74, 58, 0.08)',
        'card-hover': '0 2px 4px rgba(15, 23, 42, 0.04), 0 20px 40px -12px rgba(11, 74, 58, 0.18)',
        gold: '0 10px 30px -8px rgba(200, 162, 75, 0.55)',
        brand: '0 10px 30px -8px rgba(11, 74, 58, 0.45)',
      },
      keyframes: {
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(50%)' } },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        marquee: 'marquee 40s linear infinite',
      },
    },
  },
  plugins: [],
};
