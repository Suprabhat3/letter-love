import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // lib/theme is imported by app/share/[id]/opengraph-image.tsx, which runs
    // in its own Satori bundle. A stray React or motion import there bloats or
    // breaks the OG route, so make it a lint error rather than a surprise.
    files: ["lib/theme/**/*.ts", "lib/theme/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "react", message: "lib/theme must stay React-free." },
            { name: "react-dom", message: "lib/theme must stay React-free." },
            { name: "motion", message: "lib/theme must stay React-free." },
            { name: "motion/react", message: "lib/theme must stay React-free." },
            { name: "next/image", message: "lib/theme must stay React-free." },
            { name: "next/link", message: "lib/theme must stay React-free." },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
