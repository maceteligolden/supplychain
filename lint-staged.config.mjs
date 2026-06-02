/** @type {import('lint-staged').Configuration} */
const config = {
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,css,md,mjs}": ["prettier --write"],
};

export default config;
