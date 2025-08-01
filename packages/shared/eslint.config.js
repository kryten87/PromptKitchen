module.exports = {
  extends: ["eslint:recommended", "plugin:react/recommended"],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
  },
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  rules: {
    curly: ["error", "all"],
    eqeqeq: ["error", "always"],
    "no-unused-vars": ["warn"],
    "react/prop-types": ["off"],
  },
};