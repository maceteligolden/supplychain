import { defineConfig, globalIgnores } from "eslint/config";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import eslintPluginBetterTailwindcss from "eslint-plugin-better-tailwindcss";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tseslint from "typescript-eslint";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  eslintPluginPrettier,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "better-tailwindcss": eslintPluginBetterTailwindcss,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        {
          allowExpressions: false,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
        },
      ],
      "@typescript-eslint/explicit-module-boundary-types": "error",
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "interface",
          format: ["PascalCase"],
          suffix: ["Interface", "Props"],
        },
        {
          selector: "typeAlias",
          filter: { regex: "Input$", match: true },
          format: ["PascalCase"],
          suffix: ["Input"],
        },
        {
          selector: "typeAlias",
          filter: { regex: "Output$", match: true },
          format: ["PascalCase"],
          suffix: ["Output"],
        },
      ],
      "better-tailwindcss/no-restricted-classes": [
        "error",
        {
          tailwindConfig: "./tailwind.config.ts",
          restrict: [
            {
              pattern: "/\\[.+\\]/",
              message:
                "Avoid arbitrary Tailwind values. Use design tokens from tailwind.config.ts.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/components/ui/**"],
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "better-tailwindcss/no-restricted-classes": "off",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "node_modules/**"]),
  {
    files: ["*.config.mjs", "eslint.config.mjs", "lint-staged.config.mjs"],
    ...tseslint.configs.disableTypeChecked,
  },
]);

export default eslintConfig;
