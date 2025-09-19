import stylistic from '@stylistic/eslint-plugin'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  files: ['**/*.ts', '**/*.js', '**/*.vue'],
  plugins: {
    stylistic,
  },
  rules: {
    // Style rules
    semi: ['error', 'never'],
    quotes: ['error', 'single'],
    'comma-dangle': ['error', 'always-multiline'],

    // Optional: disable formatting rules that Prettier handles
    'prettier/prettier': 'off',
  },
}).append(stylistic.configs.recommended)
