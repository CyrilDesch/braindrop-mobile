module.exports = [
  {
    ignores: ["dist", "*.less", "*.cjs", ".expo", "android", "ios", "node_modules"],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: require("@typescript-eslint/parser"),
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        tsconfigRootDir: __dirname,
        project: "./tsconfig.json",
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    plugins: {
      "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
      react: require("eslint-plugin-react"),
      "react-hooks": require("eslint-plugin-react-hooks"),
      "unused-imports": require("eslint-plugin-unused-imports")
    },
    rules: {
      "no-console": process.env.NODE_ENV === "production" ? "error" : "warn",
      "no-debugger": process.env.NODE_ENV === "production" ? "error" : "warn",
      "block-scoped-var": "warn",
      "eol-last": ["warn", "always"],
      "unused-imports/no-unused-imports": "warn",

      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react-native',
              importNames: ['Text', 'Button'],
              message: 'Utilisez les composants @ui au lieu des composants natifs.'
            }
          ],
          patterns: [
            {
              group: ['**/core/ui/*'],
              message: 'Importez depuis "@ui" au lieu d\'importer directement depuis les sous-dossiers.'
            }
          ]
        }
      ],

      // TypeScript
      "@typescript-eslint/no-empty-interface": "off",
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/no-empty-function": "warn",
      "@typescript-eslint/no-non-null-assertion": "off",

      // Hooks React
      "react-hooks/exhaustive-deps": [
        "warn",
        { additionalHooks: "useLoader" },
      ],

      // JSX
      "react/jsx-curly-brace-presence": ["warn", { props: "always" }],
      "react/jsx-key": [
        process.env.NODE_ENV === "production" ? "error" : "warn",
        { checkFragmentShorthand: true },
      ],
      "react/jsx-no-target-blank": [
        process.env.NODE_ENV === "production" ? "error" : "warn",
        { enforceDynamicLinks: "always", warnOnSpreadAttributes: true },
      ],
      "react/jsx-sort-props": ["warn", { shorthandLast: true, reservedFirst: true }],
    },
  },
  require("eslint-config-prettier/flat"),
  require("eslint-plugin-react-refresh").configs.recommended,
];
