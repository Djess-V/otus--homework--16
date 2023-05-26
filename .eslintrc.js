module.exports = {
  env: {
    browser: true,

    es2021: true,
    "jest/globals": true,
  },
  extends: [
    "airbnb-base",
    "eslint:recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  overrides: [],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["jest", "@typescript-eslint"],
  settings: {
    "import/resolver": {
      typescript: true,
      node: true,
    },
  },
  rules: {
    "no-undef": "off",
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/ban-types": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "no-use-before-define": "off",
    "no-console": "off",
    "no-param-reassign": "off",
    "no-return-assign": "off",
    "default-param-last": "off",
    "import/extensions": ["warn", { ts: "never" }],
  },
};
