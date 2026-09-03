import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "out-desktop/**",
      ".open-next/**",
      "build/**",
      "next-env.d.ts",
      // 생성·빌드 산출물 (모두 gitignore 대상)
      "src/generated/**",    // prisma generate
      "src-tauri/target/**", // cargo build
      ".wrangler/**",        // wrangler 로컬 상태·임시 번들
    ],
  },
];

export default eslintConfig;
