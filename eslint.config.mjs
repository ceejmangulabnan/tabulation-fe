// eslint.config.mjs
import stylistic from '@stylistic/eslint-plugin'
import withNuxt from './.nuxt/eslint.config.mjs'
import eslintPluginPrettier from 'eslint-plugin-prettier'
import eslintConfigPrettier from 'eslint-config-prettier'

export default withNuxt({
  files: ['**/*.ts', '**/*.js', '**/*.vue'],
  plugins: {
    stylistic,
    prettier: eslintPluginPrettier,
  },
  rules: {
    // disable stylistic formatting rules in favor of Prettier
    ...eslintConfigPrettier.rules,

    // keep logical rules if you want
    // 'comma-dangle': ['error', 'always-multiline'],

    // run Prettier inside ESLint
    'prettier/prettier': 'error',
  },
}).append({
  files: ['**/*.vue'],
  rules: {
    '@stylistic/indent': 'off',
    '@stylistic/brace-style': 'off', // explicitly off
  },
})
