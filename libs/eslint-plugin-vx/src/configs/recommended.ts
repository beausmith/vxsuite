const jsExtensions = ['.js', '.jsx'];
const tsExtensions = ['.ts', '.tsx'];
const allExtensions = jsExtensions.concat(tsExtensions);

export = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    project: ['./tsconfig.json'],
    sourceType: 'module',
  },
  extends: [
    'airbnb-base',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended', // Uses the recommended rules from @typescript-eslint/eslint-plugin
    'plugin:prettier/recommended', // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  plugins: ['@typescript-eslint/eslint-plugin', 'vx'],
  settings: {
    'import/extensions': allExtensions,
    'import/parsers': {
      '@typescript-eslint/parser': tsExtensions,
    },
    'import/resolver': {
      node: {
        extensions: allExtensions,
      },
    },
  },
  reportUnusedDisableDirectives: true,
  rules: {
    'vx/gts-array-type-style': 'error',
    'vx/gts-constants': 'error',
    'vx/gts-direct-module-export-access-only': 'error',
    'vx/gts-func-style': 'error',
    'vx/gts-jsdoc': 'error',
    'vx/gts-identifiers': 'error',
    'vx/gts-module-snake-case': 'error',
    'vx/gts-no-array-constructor': 'error',
    'vx/gts-no-const-enum': 'error',
    'vx/gts-no-default-exports': 'error',
    'vx/gts-no-foreach': 'error',
    'vx/gts-no-for-in-loop': 'error',
    'vx/gts-no-import-export-type': ['error', { allowReexport: true }],
    'vx/gts-no-private-fields': 'error',
    'vx/gts-no-public-class-fields': 'error',
    'vx/gts-no-public-modifier': 'error',
    'vx/gts-no-return-type-only-generics': 'error',
    'vx/gts-no-unnecessary-has-own-property-check': 'warn',
    'vx/gts-object-literal-types': 'error',
    'vx/gts-parameter-properties': 'error',
    'vx/gts-safe-number-parse': 'error',
    'vx/gts-spread-like-types': 'error',
    'vx/gts-type-parameters': 'error',
    'vx/gts-unicode-escapes': 'error',
    'vx/gts-use-optionals': 'error',
    'vx/no-array-sort-mutation': 'error',
    'vx/no-assert-truthiness': 'error',
    'vx/no-floating-results': ['error', { ignoreVoid: true }],
    'vx/no-import-workspace-subfolders': 'error',

    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/no-array-constructor': 'off',
    '@typescript-eslint/no-extra-semi': 'off',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/prefer-readonly': 'error',
    '@typescript-eslint/require-await': 'error',
    'class-methods-use-this': 'off',
    'consistent-return': 'off',
    'dot-notation': 'off',
    // be stricter than eslint-config-airbnb which allows `== null`
    eqeqeq: ['error', 'always'],
    'import/extensions': 'off',
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          '**/*.test.ts',
          '**/*.test.tsx',
          'test/**/*',
          'src/setupTests.ts',
          'src/setupTests.tsx',
          'cypress/**/*',
        ],
      },
    ],
    'import/no-self-import': 'off',
    'import/prefer-default-export': 'off',
    'lines-between-class-members': 'off',
    'no-await-in-loop': 'off',
    'no-continue': 'off',
    'no-nested-ternary': 'off',
    'no-restricted-globals': ['error', 'Buffer'],
    'no-restricted-syntax': 'off',
    'no-return-await': 'off',
    'no-underscore-dangle': [
      'error',
      {
        allow: [
          // Update this to mirror CVR properties.
          '_precinctId',
          '_ballotId',
          '_ballotStyleId',
          '_ballotType',
          '_batchId',
          '_batchLabel',
          '_testBallot',
          '_scannerId',
          '_pageNumber',
          '_pageNumbers',
          '_locales',
          '_ballotImages',
          '_layouts',
        ],
      },
    ],
    'no-void': 'off', // allow silencing `no-floating-promises` with `void`
    'nonblock-statement-body-position': ['error', 'beside'],
    'prefer-arrow-callback': 'error',

    // replace some built-in rules that don't play well with TypeScript
    '@typescript-eslint/no-shadow': 'error',
    'no-shadow': 'off',
    '@typescript-eslint/no-use-before-define': 'error',
    'no-use-before-define': 'off',
    '@typescript-eslint/no-useless-constructor': 'error',
    'no-useless-constructor': 'off',
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.test.tsx', 'cypress/**/*.ts'],
      rules: {
        '@typescript-eslint/no-non-null-assertion': 'off',
        'no-loop-func': 'off',
        'vx/gts-direct-module-export-access-only': 'off',
      },
    },
    {
      files: ['**/*.test.ts', '**/*.test.tsx'],
      plugins: ['jest'],
      rules: {
        'jest/max-nested-describe': ['error', { max: 1 }],
        'jest/no-identical-title': 'error',
        'jest/no-focused-tests': 'error',
        'jest/valid-expect': ['error', { alwaysAwait: true }],
      },
    },
  ],
};
