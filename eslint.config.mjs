import withNuxt from './.nuxt/eslint.config.mjs';
import prettier from 'eslint-plugin-prettier';

export default withNuxt({
  plugins: {
    prettier,
  },
  rules: {
    eqeqeq: ['error', 'always', { null: 'ignore' }],
    'vue/no-mutating-props': 'off',
    'no-async-promise-executor': 'off',
    'vue/no-multiple-template-root': 'off',
    'vue/html-self-closing': [
      'error',
      {
        html: {
          void: 'always',
          normal: 'always',
          component: 'always',
        },
        svg: 'always',
        math: 'always',
      },
    ],
    'prettier/prettier': [
      'error',
      {
        htmlWhitespaceSensitivity: 'ignore',
        jsxBracketSameLine: true,
      },
    ],
  },
});
