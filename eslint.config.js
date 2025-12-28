import globals from "globals";
import pluginJs from "@eslint/js";
import pluginImport from "eslint-plugin-import";

export default [
  {
    ignores: ["eslint.config.js"], // Correctly use 'ignores' for flat config
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.browser
      },
    },
    plugins: {
      import: pluginImport,
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      ...pluginImport.configs.errors.rules,
      ...pluginImport.configs.warnings.rules,
      "indent": ["error", 2], // Changed to 2 spaces
      "linebreak-style": "off", // Temporarily turn off linebreak-style
      "quotes": ["error", "single"],
      "semi": ["error", "always"],
      "import/no-unresolved": ["error", { commonjs: true, amd: true }],
      "import/named": "error",
      "import/namespace": "error",
      "import/default": "error",
      "import/export": "error",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console": "warn"
    },
    settings: {
      "import/resolver": {
        node: {
          extensions: [".js", ".json"],
        },
      },
    },
  },
];