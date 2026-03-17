import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: [
      "docs/**",
      "node_modules/**",
      "coverage/**",
      ".next/**",
      "plans/**",
      "templates/**",
      ".github/**",
    ],
  },
  js.configs.recommended,
  {
    files: ["bin/**/*.js", "scripts/**/*.js", "src/**/*.js", "*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
];
