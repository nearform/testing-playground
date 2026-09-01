import tseslint from '@typescript-eslint/eslint-plugin'

export default [
  { ignores: ['dist/'] },
  ...tseslint.configs['flat/recommended'],
  {
    files: ['**/*.{js,jsx,cjs,mjs,ts,tsx,cts,mts}'],
    rules: {
      semi: [2, 'never'],
      quotes: [2, 'single', { avoidEscape: true }],
    },
  },
]
