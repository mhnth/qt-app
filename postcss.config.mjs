/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    'postcss-import': {}, // postcss-import needs to be first
    'tailwindcss/nesting': 'postcss-nesting',
    tailwindcss: {},
  },
};

export default config;
