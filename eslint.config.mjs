import stylistic from "@stylistic/eslint-plugin";
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt({
  extends: [
    "plugin:prettier/recommended", // Automatically turns off rules that conflict with Prettier
  ],
  rules: {
    semi: ["error", "never"],

    "comma-dangle": ["error", "always-multiline"],
  },
}).append(stylistic.configs.recommended);
