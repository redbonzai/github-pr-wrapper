const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');
const nestPlugin = require('@typescript-eslint/eslint-plugin');

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
  js.configs.recommended,
  ...compat.config({
    extends: ['plugin:@typescript-eslint/recommended', 'prettier'],
    plugins: ['@typescript-eslint/eslint-plugin'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      project: 'tsconfig.json',
      sourceType: 'module',
    },
    env: {
      node: true,
      jest: true,
    },
  }),
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['nx.js'],
    parser: 'espree',
    parserOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
    },
  },
];
