import stylistic from '@stylistic/eslint-plugin'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  files: ['**/*.ts', '**/*.js', '**/*.vue'],
  plugins: {
    stylistic,
  },
  rules: {
    '@stylistic/quote-props': 'off', // Disable the rule causing the error
    'comma-dangle': ['error', 'always-multiline'],
    'prettier/prettier': 'off',
  },
})
  .append(stylistic.configs.recommended)
  .append({
    files: ['**/*.vue'],
    rules: {
      '@stylistic/indent': 'off',
    },
  })
