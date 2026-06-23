import { fileURLToPath } from "node:url";
import path from "node:path";
import tseslint from "typescript-eslint";

const tsconfigRootDir = path.dirname(fileURLToPath(import.meta.url));

export default tseslint.config(
  { ignores: ["dist/**", "node_modules/**", "eslint.config.js"] },
  {
    files: ["src/**/*.ts", "tests/**/*.ts"],
    extends: [...tseslint.configs.recommended],
    languageOptions: {
      parserOptions: { project: "./tsconfig.typecheck.json", tsconfigRootDir },
    },
    rules: {
      // The defensive formatter layer intentionally uses `any` over raw API shapes.
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      // Catch unawaited promises in the async-heavy client/transport code.
      "@typescript-eslint/no-floating-promises": "error",
    },
  },
);
