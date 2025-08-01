module.exports = {
    env: {
      browser: true,
      node: true,
      es2021: true,
      jest: true
    },
    extends: [
      "eslint:recommended"
    ],
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module"
    },
    rules: {
      "semi": ["error", "always"],
      "quotes": ["error", "double"]
    }
  };
  