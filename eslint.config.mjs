import stylistic from '@stylistic/eslint-plugin'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    // Your rules here
  }
}).append(
  // Use stylistic as ES module instead of requiring it
  stylistic.configs.recommended
)
