module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: [
    '@nuxtjs/eslint-config-typescript',
    'plugin:prettier/recommended',
    'plugin:nuxt/recommended',
  ],
  plugins: ['prettier'],
  // add your custom rules here
  rules: {
    'object-shorthand': 0,
    'vue/singleline-html-element-content-newline': 'off',
    'vue/html-self-closing': [
      'warn',
      {
        html: {
          normal: 'never',
          void: 'always',
        },
      },
    ],
    'vue/valid-v-slot': 'off',
    'no-console': ['warn'],
    'standard/computed-property-even-spacing': 0,
    /**
     * Rules added below were not being inforced before,
     * if enabled, a developer will have to manually update code to fix linting issues.
     */
    'vue/component-definition-name-casing': 'off',
    quotes: [
      'error',
      'single',
      {
        avoidEscape: true,
        allowTemplateLiterals: true,
      },
    ],
    'import/export': 'off',
    'no-redeclare': 'off',
    'no-unused-vars': 'off',
    'array-callback-return': 'off',
    'no-prototype-builtins': 'off',
    'vue/no-lone-template': 'off',
    'vue/no-mutating-props': 'off',
    'no-useless-catch': 'off',
    'vue/order-in-components': 'off',
    /**
     * Rules below are disabled to delegate style to prettier
     */
    curly: 'off',
    'arrow-parens': 'off',
    'brace-style': 'off',
    'space-before-function-paren': 'off',
    'vue/html-indent': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'vue/max-attributes-per-line': 'off',
    'vue/html-closing-bracket-newline': 'off',
    indent: 'off',
    'vue/custom-event-name-casing': [
      'error',
      'kebab-case',
      {
        ignores: [],
      },
    ],
  },
}
